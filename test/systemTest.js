/**
 * Automated End-to-End System Test Suite for NodeCanvas
 * Tests JSON DB, port 9080, Templates, Projects, Pages, Submissions, Security, and Exports
 */

const BASE_URL = "http://localhost:9080";

async function runTests() {
  console.log("=== NodeCanvas Automated System Verification ===");
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} — ${err.message}`);
      failed++;
    }
  }

  // 1. Dashboard accessibility
  await test("Dashboard HTTP 200 OK on Port 9080", async () => {
    const res = await fetch(`${BASE_URL}/builder/dashboard`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes("NodeCanvas")) throw new Error("Dashboard missing brand title");
  });

  // 2. Templates API
  let availableTemplates = [];
  await test("Templates API returns full-stack templates list", async () => {
    const res = await fetch(`${BASE_URL}/api/templates`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.templates) || data.templates.length < 5) {
      throw new Error(`Expected at least 5 templates, got ${data.templates?.length}`);
    }
    availableTemplates = data.templates;
  });

  // 3. Create Project with SaaS template
  let createdProjectId = null;
  let createdHomePageId = null;
  await test("Create new project instantiated from SaaS template", async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Verification Suite Project",
        templateId: "saas"
      })
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.project?.id || !data.homePage?.id) throw new Error("Missing project or homePage id");
    createdProjectId = data.project.id;
    createdHomePageId = data.homePage.id;
  });

  // 4. Retrieve project detail with populated pages
  await test("Retrieve project details and populated pages", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${createdProjectId}`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.project?.pages || data.project.pages.length === 0) {
      throw new Error("Pages were not populated");
    }
  });

  // 5. Canvas autosave
  await test("Autosave updated canvas state to Page in JSON DB", async () => {
    const updatedCanvas = {
      tag: "div",
      attrs: { id: "test-root", style: "background:#ffffff;padding:40px;" },
      children: [
        {
          tag: "h1",
          attrs: { style: "font-size:32px;color:#000;" },
          children: [{ type: "text", content: "Modified via Test Suite" }]
        }
      ]
    };

    const res = await fetch(`${BASE_URL}/api/projects/${createdProjectId}/pages/${createdHomePageId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canvasState: JSON.stringify(updatedCanvas) })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.page?.canvas?.tag !== "div") throw new Error("Canvas did not save properly");
  });

  // 6. Page duplication
  let duplicatedPageId = null;
  await test("Duplicate page within project", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${createdProjectId}/pages/${createdHomePageId}/duplicate`, {
      method: "POST"
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.page?.id) throw new Error("Duplicate page missing id");
    duplicatedPageId = data.page.id;
  });

  // 7. Form submission processing
  await test("Interactive form submission via /api/forms/submit", async () => {
    const res = await fetch(`${BASE_URL}/api/forms/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: createdProjectId,
        formName: "Verification Contact Form",
        name: "Alice Developer",
        email: "alice@example.com",
        message: "Testing production NodeCanvas backend"
      })
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.submissionId) throw new Error("Form submission was not saved");
  });

  // 8. Form submissions retrieval
  await test("Fetch form submissions list for project", async () => {
    const res = await fetch(`${BASE_URL}/api/forms/submissions/${createdProjectId}`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.submissions) || data.submissions.length === 0) {
      throw new Error("No submissions found");
    }
    if (data.submissions[0].data?.email !== "alice@example.com") {
      throw new Error("Submission payload mismatch");
    }
  });

  // 9. Static Site Export
  await test("Static multi-page HTML/CSS/JS ZIP export", async () => {
    const res = await fetch(`${BASE_URL}/api/export/${createdProjectId}/static`, {
      method: "POST"
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.downloadUrl || !data.filename) throw new Error("Missing export downloadUrl");
  });

  // 10. WordPress Theme Export
  await test("WordPress theme ZIP export with PHP templates", async () => {
    const res = await fetch(`${BASE_URL}/api/export/${createdProjectId}/wordpress`, {
      method: "POST"
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.downloadUrl || !data.filename) throw new Error("Missing export downloadUrl");
  });

  // 11. Project JSON Export
  await test("Project JSON export", async () => {
    const res = await fetch(`${BASE_URL}/api/export/${createdProjectId}/json`, {
      method: "POST"
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.downloadUrl) throw new Error("Missing json export downloadUrl");
  });

  // 12. Security: Path Traversal rejection on export
  await test("Security: Rejection of invalid export format (prevents traversal)", async () => {
    const res = await fetch(`${BASE_URL}/api/export/${createdProjectId}/malicious_format`, {
      method: "POST"
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
  });

  // 13. Preview rendering
  await test("Preview renders without crash", async () => {
    const res = await fetch(`${BASE_URL}/builder/preview/${createdProjectId}`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes("Preview")) throw new Error("Preview missing header");
  });

  // 14. Clean up test project
  await test("Delete test project and its pages", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${createdProjectId}`, {
      method: "DELETE"
    });
    if (res.status !== 204) throw new Error(`Status ${res.status}`);
  });

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();

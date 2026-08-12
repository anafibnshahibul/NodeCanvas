/** @type {import('tailwindcss').Config} */
export default {
  // Scan all files that may contain Tailwind classes
  content: [
    "./public/**/*.{html,js,ejs}",
    "./src/views/**/*.ejs",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Builder UI palette
        canvas:  { DEFAULT: "#0f1117", surface: "#1a1d27", border: "rgba(255,255,255,0.06)" },
        violet:  { 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" },
      },
    },
  },
  plugins: [],
};
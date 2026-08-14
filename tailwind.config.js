/** @type {import('tailwindcss').Config} */
export default {
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
    },
  },
  plugins: [],
};

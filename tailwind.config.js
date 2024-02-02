/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
    colors: {
      muted: "#6B7280",
      muted2: "#9CA3AF",
      muted3: "#6B7280",
      neutral: "#1A314D",
      positive: "#008533",
      danger: "#D32F2F",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

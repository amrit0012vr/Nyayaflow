/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyaya: {
          navy: "#0a192f",
          deep: "#0f172a",
          card: "#1e293b",
          gold: "#f59e0b",
          goldlight: "#fef3c7",
          crimson: "#dc2626",
          emerald: "#10b981",
          sky: "#0284c7"
        }
      }
    },
  },
  plugins: [],
}

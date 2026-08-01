/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  presets: [
    require('@digital-suite/ui-kit/tailwind.preset.js')
  ],
  plugins: [],
}

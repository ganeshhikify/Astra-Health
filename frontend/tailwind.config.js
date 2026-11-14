/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          black: "#000000",
          deep: "#05070c",
          cyan: "#00a3ff",
          cyanBright: "#00c8ff",
          cyanGlow: "rgba(0, 163, 255, 0.4)",
          border: "rgba(255, 255, 255, 0.12)",
        },
        dashboard: {
          bg: "#050505",
          card: "#111111",
          panel: "#161616",
          border: "#252525",
          accent: "#36C9E8",
          textPrimary: "#FFFFFF",
          textSecondary: "#A3A3A3",
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        michroma: ['Michroma', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
      },
      letterSpacing: {
        'ultra-wide': '0.25em',
        'super-wide': '0.35em',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        ocean: {
          dark:  "#355872",
          mid:   "#7AAACE",
          light: "#F7F8F0",
        },
        forest: {
          dark:  "#346739",
          mid:   "#79AE6F",
          light: "#F2EDC2",
        },
        dark:     "#1A1A1A",
        charcoal: "#2D2D2D",
      },

      fontFamily: {
        display: ["'Protest Guerrilla'", "serif"],
        heading: ["'Poppins'", "sans-serif"],
        body:    ["'Inter'", "sans-serif"],
      },

      fontSize: {
        "hero":    ["clamp(3rem, 10vw, 7rem)", { lineHeight: "1" }],
        "section": ["clamp(1.5rem, 3vw, 2.5rem)", { lineHeight: "1.2" }],
      },

      spacing: {
        "section": "6rem",
        "18":      "4.5rem",
        "22":      "5.5rem",
        "128":     "32rem",
      },

      borderRadius: {
        "card": "1rem",
        "pill": "9999px",
      },

      boxShadow: {
        "card":        "0 4px 24px rgba(0,0,0,0.18)",
        "glow-ocean":  "0 0 32px rgba(122,170,206,0.3)",
        "glow-forest": "0 0 32px rgba(121,174,111,0.3)",
      },

      backgroundImage: {
        "hero-overlay": "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%)",
        "dark-overlay": "linear-gradient(135deg, rgba(53,88,114,0.92) 0%, rgba(26,26,26,0.96) 100%)",
      },

      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
      },

      animation: {
        "fade-up":     "fade-up 0.7s ease forwards",
        "fade-in":     "fade-in 0.6s ease forwards",
        "float":       "float 4s ease-in-out infinite",
        "fade-up-200": "fade-up 0.7s ease 0.2s forwards",
        "fade-up-400": "fade-up 0.7s ease 0.4s forwards",
        "fade-up-600": "fade-up 0.7s ease 0.6s forwards",
      },
    },
  },
  plugins: [],
}
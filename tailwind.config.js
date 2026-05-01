export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:        "#1a5c3a",
        "primary-light": "#154f31",
        "primary-dark":  "#0d3320",

        secondary:        "#e8f5ee",
        "secondary-light": "#f0faf4",

        accent:      "#F49E4B",
        "accent-dark": "#D88436",

        neutral: {
          900: "#1A1A1A",
          700: "#4A4A4A",
          500: "#9B9B9B",
          200: "#E5E5E5",
        },

        white: "#FFFFFF",
      },
      fontFamily: {
        sans:     ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        fraunces: ["Fraunces", "serif"],
      },
    },
  },
  plugins: [],
};

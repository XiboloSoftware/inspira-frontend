export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#023A4B",
        "primary-light": "#054256",

        secondary: "#9ACEFF",
        "secondary-light": "#E8F4FF",

        accent: "#F49E4B",
        "accent-dark": "#D88436",

        neutral: {
          900: "#1A1A1A",
          700: "#4A4A4A",
          500: "#9B9B9B",
          200: "#E5E5E5",
        },

        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};

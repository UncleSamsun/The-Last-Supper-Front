import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18211f",
        paper: "#f7f3ea",
        sage: "#73836b",
        moss: "#415344",
        tomato: "#bf4d3e",
        brass: "#b58b45",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 33, 31, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;

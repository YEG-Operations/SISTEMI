import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette brand Sistemi (rosso del logo / banner).
        sistemi: {
          red: "#E2001A",
          "red-dark": "#B80016",
          "red-darker": "#8F0011",
          ink: "#1A1A1A",
          mist: "#F4F4F5",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

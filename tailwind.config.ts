import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        slate: "#475569",
        mist: "#E2E8F0",
        pearl: "#F8FAFC",
        cyan: "#0891B2",
        teal: "#0F766E",
        sand: "#F8F5F1"
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)"],
        body: ["var(--font-source-sans-3)"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;


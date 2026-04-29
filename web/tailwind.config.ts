import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: "#dc2626", soft: "#fee2e2" },
        green: { DEFAULT: "#16a34a", soft: "#dcfce7" },
        ink: "#0f172a",
        paper: "#fafaf9",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Pretendard", "Noto Sans KR", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

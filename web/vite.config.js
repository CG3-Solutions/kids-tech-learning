import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH is set by the GitHub Pages workflow (e.g. /kids-tech-learning/).
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  test: { environment: "jsdom" },
});

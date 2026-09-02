import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      "@arogyasetu/triage-engine": path.resolve(__dirname, "../../packages/triage-engine/dist/index.js"),
      "@arogyasetu/shared-types":  path.resolve(__dirname, "../../packages/shared-types/dist/index.js"),
    }
  },
  optimizeDeps: {
    include: ["@arogyasetu/triage-engine", "@arogyasetu/shared-types"]
  }
});

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    // node for pure utilities (default), jsdom for DOM-dependent component tests
    environment: "node",
    environmentMatchGlobs: [
      ["src/components/**/*.test.tsx", "jsdom"],
      ["src/components/**/*.test.ts", "jsdom"],
      ["src/hooks/**/*.test.tsx", "jsdom"],
      ["src/hooks/**/*.test.ts", "jsdom"],
    ],
  },
});

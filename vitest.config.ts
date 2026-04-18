import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./ui/__tests__/setup.ts"],
    globals: true,
    include: ["ui/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["ui/**/*.{ts,tsx}"],
      exclude: ["ui/__tests__/**"],
    },
  },
});

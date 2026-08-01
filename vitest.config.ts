import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["ui/**/*.test.ts", "ui/**/*.test.tsx"],
  },
});

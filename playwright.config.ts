import { defineConfig } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 3000);
const baseURL = process.env.BASE_URL || `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `pnpm exec next dev --port ${port}`,
        port,
        reuseExistingServer: !process.env.CI,
        // Scoped to Playwright's spawned dev server only — never affects prod
        env: { E2E_TEST: process.env.E2E_TEST || "true" },
      },
});

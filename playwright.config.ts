import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT || 3001);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    // Production server avoids flaky Instant/HMR hydration issues in next dev.
    // CI already ran `npm run build` in the same job.
    command: process.env.CI
      ? `npx next start --port ${PORT}`
      : `npm run build && npx next start --port ${PORT}`,
    url: baseURL,
    // Don't reuse a manual `next start` — admin e2e needs E2E_BYPASS_ADMIN_AUTH on the process.
    reuseExistingServer: process.env.PW_REUSE_SERVER === "1",
    timeout: 180_000,
    env: {
      ...process.env,
      // Allow admin UI e2e without a live Clerk session (never set on Railway).
      E2E_BYPASS_ADMIN_AUTH: "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

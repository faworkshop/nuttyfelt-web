import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const FIXTURE = path.join(__dirname, "fixtures", "cat.jpg");
const WORK_ID = "00000000-0000-4000-8000-000000000099";

async function mockWorksApis(page: Page) {
  let createBody: Record<string, unknown> | null = null;
  let uploadBody: Record<string, unknown> | null = null;
  let putHits = 0;

  await page.route("**/api/admin/works", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    createBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        work: {
          id: WORK_ID,
          titleZh: createBody.titleZh,
          titleEn: createBody.titleEn,
        },
      }),
    });
  });

  await page.route("**/api/admin/works/upload-url", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    uploadBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        uploadUrl: "https://r2.test/studio-put",
        storageKey: `studio/works/${WORK_ID}/test.jpg`,
        headers: { "Content-Type": "image/jpeg" },
        expiresIn: 900,
      }),
    });
  });

  await page.route("https://r2.test/studio-put", async (route) => {
    expect(route.request().method()).toBe("PUT");
    putHits += 1;
    await route.fulfill({ status: 200, body: "" });
  });

  return {
    getCreateBody: () => createBody,
    getUploadBody: () => uploadBody,
    getPutHits: () => putHits,
  };
}

test.describe("admin add work flow", () => {
  test("creates a work then uploads a studio image", async ({ page }) => {
    const mocks = await mockWorksApis(page);

    await page.goto("/en/admin/works");
    await expect(page.getByRole("heading", { name: "Works & Home" })).toBeVisible();

    await page.getByTestId("add-work-btn").click();
    await expect(page.getByTestId("create-work-form")).toBeVisible();

    await page.getByTestId("title-zh").fill("栗子");
    await page.getByTestId("title-en").fill("Chestnut");
    await page.getByTestId("featured-home").check();
    await page.getByTestId("create-work-submit").click();

    await expect(page).toHaveURL(new RegExp(`/en/admin/works/${WORK_ID}`));
    await expect(page.getByRole("heading", { name: "Edit work" })).toBeVisible();

    expect(mocks.getCreateBody()).toMatchObject({
      titleZh: "栗子",
      titleEn: "Chestnut",
      featuredOnHome: true,
    });

    await page.getByTestId("work-image-input").setInputFiles([FIXTURE, FIXTURE]);

    await expect.poll(() => mocks.getPutHits()).toBe(2);
    expect(mocks.getUploadBody()).toMatchObject({
      workId: WORK_ID,
      contentType: "image/jpeg",
    });
    await expect(page.getByTestId("work-upload-error")).toHaveCount(0);
  });

  test("shows a clear error when upload-url returns HTML", async ({ page }) => {
    await page.route("**/api/admin/works/upload-url", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: '<script src="/_next/static/chunks/main.js"></script>',
      });
    });

    await page.goto(`/en/admin/works/${WORK_ID}`);
    await expect(page.getByRole("heading", { name: "Edit work" })).toBeVisible();
    await page.getByTestId("work-image-input").setInputFiles(FIXTURE);

    await expect(page.getByTestId("work-upload-error")).toContainText(/Expected JSON/i);
  });
});

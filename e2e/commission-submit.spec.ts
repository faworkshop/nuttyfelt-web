import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const FIXTURE = path.join(__dirname, "fixtures", "cat.jpg");

async function mockIntakeApis(page: Page) {
  const uploadedKeys: string[] = [];
  let submitBody: Record<string, unknown> | null = null;

  await page.route("**/api/commission/upload-url", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    const body = route.request().postDataJSON() as {
      filename: string;
      contentType: string;
      sizeBytes: number;
      group: string;
      uploadSessionId: string;
    };

    const storageKey = `commissions/pending/${body.uploadSessionId}/${body.group}/test-${body.filename}`;
    uploadedKeys.push(storageKey);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        uploadUrl: "https://r2.test/mock-put",
        storageKey,
        expiresIn: 900,
        headers: { "Content-Type": body.contentType },
        maxBytes: 100 * 1024 * 1024,
      }),
    });
  });

  await page.route("https://r2.test/mock-put", async (route) => {
    expect(route.request().method()).toBe("PUT");
    await route.fulfill({ status: 200, body: "" });
  });

  await page.route("**/api/commission", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    submitBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        requestId: "00000000-0000-4000-8000-000000000001",
        referenceNo: "NF-00000000",
        email: { notify: true, confirm: true },
      }),
    });
  });

  return {
    getUploadedKeys: () => uploadedKeys,
    getSubmitBody: () => submitBody,
  };
}

async function openCommissionForm(page: Page) {
  await page.goto("/en/commission");
  await expect(page.getByRole("heading", { name: "Commission form" })).toBeVisible();
  // Wait until the interactive step panel is stable (Suspense / locale shell settled).
  await expect(page.locator('[data-step-panel="1"]:not([hidden]) #email')).toBeVisible();
  await expect(page.getByText("Step 1 of 4")).toBeVisible();
}

async function fillContact(page: Page) {
  await page.locator("#email").fill("client@example.com");
  await page.locator("#name").fill("Alex");
  await page.locator("#instagram").fill("@alex");
  await page.locator("#whatsapp").fill("+85290000000");
  await page.locator("#location").selectOption("hk");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator('[data-step-panel="2"]:not([hidden]) #catName')).toBeVisible();
}

async function fillCat(page: Page) {
  await page.locator("#catName").fill("Mochi");
  await page.locator("#coat").selectOption("short");
  await page.locator("#features").fill("Round eyes and cream patches");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator('[data-step-panel="3"]:not([hidden])')).toBeVisible();
}

test.describe("commission form submit", () => {
  test("uploads photos and submits the request", async ({ page }) => {
    const api = await mockIntakeApis(page);

    await openCommissionForm(page);
    await fillContact(page);
    await fillCat(page);

    await page
      .locator('[data-step-panel="3"]:not([hidden]) input[type="file"]')
      .first()
      .setInputFiles(FIXTURE);
    await expect(page.getByText("cat.jpg")).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.locator('[data-step-panel="4"]:not([hidden])')).toBeVisible();

    await page.locator("#status").selectOption("skip");
    await page.locator('input[name="terms"]').check();
    await page.locator('input[name="handmade"]').check();
    await page.locator('input[name="publicity"][value="tag"]').check();

    await page.getByRole("button", { name: "Submit request" }).click();

    await expect(page.getByRole("heading", { name: "We received your request" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("Reference no.")).toBeVisible();
    await expect(page.getByText("NF-00000000")).toBeVisible();

    expect(api.getUploadedKeys().length).toBe(1);

    const body = api.getSubmitBody();
    expect(body).toBeTruthy();
    expect(body).toMatchObject({
      locale: "en",
      email: "client@example.com",
      displayName: "Alex",
      instagram: "@alex",
      whatsapp: "+85290000000",
      location: "hk",
      catName: "Mochi",
      coatLength: "short",
      features: "Round eyes and cream patches",
      livingStatus: "skip",
      agreedTerms: true,
      agreedHandmade: true,
      publicity: "tag",
    });
    expect(Array.isArray(body!.files)).toBe(true);
    expect((body!.files as unknown[]).length).toBe(1);
    expect(body!.uploadSessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test("blocks leaving photos step without a basic photo", async ({ page }) => {
    await openCommissionForm(page);
    await fillContact(page);
    await fillCat(page);

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Please upload at least one basic-angle photo.")).toBeVisible();
    await expect(page.getByText("Step 3 of 4")).toBeVisible();
  });

  test("shows an error when submit API fails after upload", async ({ page }) => {
    await page.route("**/api/commission/upload-url", async (route) => {
      const body = route.request().postDataJSON() as {
        filename: string;
        contentType: string;
        uploadSessionId: string;
        group: string;
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          uploadUrl: "https://r2.test/mock-put",
          storageKey: `commissions/pending/${body.uploadSessionId}/${body.group}/test-${body.filename}`,
          expiresIn: 900,
          headers: { "Content-Type": body.contentType },
          maxBytes: 100 * 1024 * 1024,
        }),
      });
    });
    await page.route("https://r2.test/mock-put", async (route) => {
      await route.fulfill({ status: 200, body: "" });
    });
    await page.route("**/api/commission", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Could not store request. Please try again." }),
      });
    });

    await openCommissionForm(page);
    await fillContact(page);
    await fillCat(page);
    await page
      .locator('[data-step-panel="3"]:not([hidden]) input[type="file"]')
      .first()
      .setInputFiles(FIXTURE);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.locator('[data-step-panel="4"]:not([hidden])')).toBeVisible();

    await page.locator('input[name="terms"]').check();
    await page.locator('input[name="handmade"]').check();
    await page.locator('input[name="publicity"][value="no-tag"]').check();
    await page.getByRole("button", { name: "Submit request" }).click();

    await expect(page.getByText("Could not store request. Please try again.")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: "We received your request" })).toHaveCount(0);
  });
});

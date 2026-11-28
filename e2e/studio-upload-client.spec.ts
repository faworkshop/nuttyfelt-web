import { expect, test } from "@playwright/test";
import {
  parseJsonResponse,
  uploadStudioWorkImage,
} from "../src/lib/admin/studio-upload-client";

test.describe("studio upload client helpers", () => {
  test("parseJsonResponse rejects HTML bodies", async () => {
    const response = new Response('<script src="/x.js"></script>', {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
    await expect(parseJsonResponse(response)).rejects.toThrow(/Expected JSON/i);
  });

  test("uploadStudioWorkImage requests URL then PUTs the file", async () => {
    const calls: { url: string; method: string }[] = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method || "GET";
      calls.push({ url, method });

      if (url.includes("/api/admin/works/upload-url")) {
        return new Response(
          JSON.stringify({
            uploadUrl: "https://r2.test/put",
            storageKey: "studio/works/1/a.jpg",
            headers: { "Content-Type": "image/jpeg" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url === "https://r2.test/put") {
        return new Response(null, { status: 200 });
      }
      return new Response("not found", { status: 404 });
    }) as typeof fetch;

    try {
      const file = new File([new Uint8Array([1, 2, 3])], "cat.jpg", {
        type: "image/jpeg",
      });
      const key = await uploadStudioWorkImage("work-1", file);
      expect(key).toBe("studio/works/1/a.jpg");
      expect(calls).toEqual([
        { url: "/api/admin/works/upload-url", method: "POST" },
        { url: "https://r2.test/put", method: "PUT" },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

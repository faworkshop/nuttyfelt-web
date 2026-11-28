"use client";

import { useRouter } from "@/i18n/navigation";
import { parseJsonResponse } from "@/lib/admin/studio-upload-client";
import { useState } from "react";

export function CreateWorkForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleZh: String(data.get("titleZh") ?? "").trim(),
          titleEn: String(data.get("titleEn") ?? "").trim(),
          captionZh: String(data.get("captionZh") ?? "").trim() || null,
          captionEn: String(data.get("captionEn") ?? "").trim() || null,
          visible: data.get("visible") === "on",
          featuredOnHome: data.get("featuredOnHome") === "on",
        }),
      });
      const payload = await parseJsonResponse<{
        error?: string;
        work?: { id: string };
      }>(response);
      if (!response.ok || !payload.work?.id) {
        throw new Error(payload.error || `Create failed (${response.status})`);
      }
      router.push({
        pathname: "/admin/works/[id]",
        params: { id: payload.work.id },
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn-primary shrink-0 !px-4 !py-2 text-sm"
        data-testid="add-work-btn"
        onClick={() => setOpen(true)}
      >
        Add work
      </button>
    );
  }

  return (
    <section className="mt-2 w-full basis-full rounded-md border border-line bg-paper p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">Add work</h2>
        <button
          type="button"
          className="font-ui text-sm text-ink-muted underline-offset-4 hover:underline"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </button>
      </div>
      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-3 md:grid-cols-2"
        data-testid="create-work-form"
      >
        <label className="font-ui text-sm text-ink">
          Title (中文)
          <input
            name="titleZh"
            required
            data-testid="title-zh"
            className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
          />
        </label>
        <label className="font-ui text-sm text-ink">
          Title (EN)
          <input
            name="titleEn"
            required
            data-testid="title-en"
            className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
          />
        </label>
        <label className="font-ui text-sm text-ink md:col-span-2">
          Caption (中文)
          <textarea
            name="captionZh"
            rows={2}
            className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
          />
        </label>
        <label className="font-ui text-sm text-ink md:col-span-2">
          Caption (EN)
          <textarea
            name="captionEn"
            rows={2}
            className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
          />
        </label>
        <label className="inline-flex items-center gap-2 font-ui text-sm text-ink">
          <input type="checkbox" name="visible" defaultChecked />
          Visible on Works
        </label>
        <label className="inline-flex items-center gap-2 font-ui text-sm text-ink">
          <input
            type="checkbox"
            name="featuredOnHome"
            data-testid="featured-home"
          />
          Featured on Home
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60"
            data-testid="create-work-submit"
          >
            {busy ? "Creating…" : "Create & upload photo"}
          </button>
          {error ? (
            <p
              className="mt-2 font-ui text-sm text-danger"
              data-testid="create-work-error"
            >
              {error}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

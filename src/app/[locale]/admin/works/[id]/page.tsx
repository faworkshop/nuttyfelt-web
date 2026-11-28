import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  deleteWorkAction,
  updateWorkAction,
} from "@/app/[locale]/admin/works/actions";
import { WorkImageUpload } from "@/components/admin/WorkImageUpload";
import { Link } from "@/i18n/navigation";
import { e2eAdminBypassEnabled } from "@/lib/admin/auth";
import { getWork, type WorkWithImages } from "@/lib/admin/works";

type Props = { params: Promise<{ id: string }> };

function e2eStubWork(id: string): WorkWithImages {
  const now = new Date();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    titleZh: "E2E 作品",
    titleEn: "E2E Work",
    captionZh: null,
    captionEn: null,
    sortOrder: 0,
    visible: true,
    featuredOnHome: false,
    featuredRank: null,
    images: [],
  };
}

async function WorkEditor({ params }: Props) {
  const { id } = await params;
  const work =
    (await getWork(id)) ?? (e2eAdminBypassEnabled() ? e2eStubWork(id) : null);
  if (!work) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/works"
        className="font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
      >
        ← Works &amp; Home
      </Link>

      <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">
        Edit work
      </h1>

      <section className="mt-8 rounded-md border border-line bg-paper p-4 md:p-5">
        <h2 className="font-display text-xl text-ink">Photographs</h2>
        <p className="mt-1 font-ui text-sm text-ink-muted">
          Cover is used on Works cards. Home hero can be any one studio image
          site-wide.
        </p>
        <div className="mt-4">
          <WorkImageUpload workId={work.id} images={work.images} />
        </div>
      </section>

      <section className="mt-6 rounded-md border border-line bg-paper p-4 md:p-5">
        <h2 className="font-display text-xl text-ink">Details</h2>
        <form action={updateWorkAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={work.id} />
          <label className="font-ui text-sm text-ink">
            Title (中文)
            <input
              name="titleZh"
              required
              defaultValue={work.titleZh}
              className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
            />
          </label>
          <label className="font-ui text-sm text-ink">
            Title (EN)
            <input
              name="titleEn"
              required
              defaultValue={work.titleEn}
              className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
            />
          </label>
          <label className="font-ui text-sm text-ink md:col-span-2">
            Caption (中文)
            <textarea
              name="captionZh"
              rows={2}
              defaultValue={work.captionZh ?? ""}
              className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
            />
          </label>
          <label className="font-ui text-sm text-ink md:col-span-2">
            Caption (EN)
            <textarea
              name="captionEn"
              rows={2}
              defaultValue={work.captionEn ?? ""}
              className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
            />
          </label>
          <label className="font-ui text-sm text-ink">
            Sort order
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={work.sortOrder}
              className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
            />
          </label>
          <label className="font-ui text-sm text-ink">
            Home featured rank
            <input
              name="featuredRank"
              type="number"
              min={0}
              defaultValue={work.featuredRank ?? 0}
              className="mt-1 w-full rounded-md border border-line bg-wool px-3 py-2"
            />
          </label>
          <label className="inline-flex items-center gap-2 font-ui text-sm text-ink">
            <input type="checkbox" name="visible" defaultChecked={work.visible} />
            Visible on Works
          </label>
          <label className="inline-flex items-center gap-2 font-ui text-sm text-ink">
            <input
              type="checkbox"
              name="featuredOnHome"
              defaultChecked={work.featuredOnHome}
            />
            Featured on Home
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
              Save
            </button>
          </div>
        </form>
      </section>

      <form action={deleteWorkAction} className="mt-8">
        <input type="hidden" name="id" value={work.id} />
        <button
          type="submit"
          className="font-ui text-sm text-danger underline-offset-4 hover:underline"
        >
          Delete this work
        </button>
      </form>
    </div>
  );
}

export default function AdminWorkDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="font-ui text-ink-muted">Loading…</div>}>
      <WorkEditor params={params} />
    </Suspense>
  );
}

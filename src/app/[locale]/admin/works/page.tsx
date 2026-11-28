import { Suspense } from "react";
import { moveWorkAction } from "@/app/[locale]/admin/works/actions";
import { CreateWorkForm } from "@/components/admin/CreateWorkForm";
import { Link } from "@/i18n/navigation";
import { listWorksAdmin } from "@/lib/admin/works";
import { studioPublicPath } from "@/lib/studio-uploads";

async function WorksAdminList() {
  const rows = await listWorksAdmin();

  return (
    <>
      {rows.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-line bg-paper px-4 py-10 text-center font-ui text-sm text-ink-muted">
          No works yet. Add a title pair, then upload a studio photo.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((work, index) => {
            const cover = work.images[0];
            const imageUrl = cover
              ? studioPublicPath(cover.storageKey)
              : null;
            return (
              <li
                key={work.id}
                className="flex flex-col gap-4 rounded-md border border-line bg-paper p-4 sm:flex-row sm:items-center"
              >
                <div className="photo-frame aspect-[4/5] w-full shrink-0 overflow-hidden rounded-md sm:w-20">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-mist font-ui text-xs text-ink-muted">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={{
                      pathname: "/admin/works/[id]",
                      params: { id: work.id },
                    }}
                    className="font-display text-lg text-ink hover:text-brass-deep"
                  >
                    {work.titleZh} / {work.titleEn}
                  </Link>
                  <p className="mt-1 font-ui text-xs text-ink-muted">
                    {work.visible ? "Visible" : "Hidden"}
                    {work.featuredOnHome
                      ? ` · Home #${(work.featuredRank ?? 0) + 1}`
                      : ""}
                    {work.images.some((image) => image.homeHero)
                      ? " · Home hero"
                      : ""}
                    {" · "}
                    {work.images.length} image
                    {work.images.length === 1 ? "" : "s"}
                    {" · "}order {work.sortOrder}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={moveWorkAction}>
                    <input type="hidden" name="id" value={work.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
                    >
                      Up
                    </button>
                  </form>
                  <form action={moveWorkAction}>
                    <input type="hidden" name="id" value={work.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === rows.length - 1}
                      className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
                    >
                      Down
                    </button>
                  </form>
                  <Link
                    href={{
                      pathname: "/admin/works/[id]",
                      params: { id: work.id },
                    }}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function AdminWorksPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink md:text-4xl">
            Works &amp; Home
          </h1>
          <p className="mt-2 font-body text-ink-muted">
            Studio marketing images only — never client reference photos.
          </p>
        </div>
        <CreateWorkForm />
      </div>

      <Suspense
        fallback={
          <p className="mt-8 font-ui text-sm text-ink-muted">Loading works…</p>
        }
      >
        <WorksAdminList />
      </Suspense>
    </div>
  );
}

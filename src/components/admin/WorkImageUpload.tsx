"use client";

import {
  clearWorkImageHomeHeroAction,
  deleteWorkImageAction,
  setWorkImageCoverAction,
  setWorkImageHomeHeroAction,
} from "@/app/[locale]/admin/works/actions";
import { useRouter } from "@/i18n/navigation";
import { uploadStudioWorkImage } from "@/lib/admin/studio-upload-client";
import { studioPublicPath } from "@/lib/studio-uploads";
import { useState } from "react";

export type WorkImageItem = {
  id: string;
  storageKey: string;
  sortOrder: number;
  homeHero: boolean;
};

type Props = {
  workId: string;
  images: WorkImageItem[];
};

export function WorkImageUpload({ workId, images }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadStudioWorkImage(workId, file);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {images.length === 0 ? (
        <div className="photo-frame photo-placeholder flex aspect-[4/5] max-w-xs items-center justify-center">
          <span className="relative z-10 font-ui text-sm text-ink-muted">
            No images yet
          </span>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {images.map((image, index) => {
            const url = studioPublicPath(image.storageKey);
            const isCover = index === 0;
            return (
              <li key={image.id} className="space-y-2">
                <div className="photo-frame aspect-[4/5] max-w-xs overflow-hidden rounded-md border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isCover ? (
                    <span className="font-ui text-xs text-brass-deep">Cover</span>
                  ) : (
                    <form action={setWorkImageCoverAction}>
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="workId" value={workId} />
                      <button
                        type="submit"
                        className="font-ui text-xs text-ink underline-offset-4 hover:underline"
                      >
                        Make cover
                      </button>
                    </form>
                  )}
                  {image.homeHero ? (
                    <form action={clearWorkImageHomeHeroAction} className="inline-flex items-center gap-2">
                      <span className="font-ui text-xs text-brass-deep">Home hero</span>
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="workId" value={workId} />
                      <button
                        type="submit"
                        className="font-ui text-xs text-ink-muted underline-offset-4 hover:underline"
                      >
                        Clear
                      </button>
                    </form>
                  ) : (
                    <form action={setWorkImageHomeHeroAction}>
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="workId" value={workId} />
                      <button
                        type="submit"
                        className="font-ui text-xs text-ink underline-offset-4 hover:underline"
                        data-testid="work-image-home-hero"
                      >
                        Set as home hero
                      </button>
                    </form>
                  )}
                  <form action={deleteWorkImageAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="workId" value={workId} />
                    <button
                      type="submit"
                      className="font-ui text-xs text-danger underline-offset-4 hover:underline"
                      data-testid="work-image-delete"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 font-ui text-sm text-ink">
        <span className="btn-secondary !px-3 !py-2 text-xs">
          {busy ? "Uploading…" : images.length ? "Add images" : "Upload images"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={busy}
          data-testid="work-image-input"
          onChange={onChange}
        />
      </label>
      {error ? (
        <p className="font-ui text-sm text-danger" data-testid="work-upload-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

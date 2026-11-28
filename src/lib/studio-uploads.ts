import { sanitizeFilename } from "./uploads";

/** Studio marketing assets — separate from private commission originals. */
export const STUDIO_PREFIX = "studio/";
export const STUDIO_MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
export const STUDIO_UPLOAD_URL_EXPIRES_IN = 15 * 60;

export const STUDIO_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type StudioImageType = (typeof STUDIO_ALLOWED_TYPES)[number];

export function isStudioImageType(value: string): value is StudioImageType {
  return (STUDIO_ALLOWED_TYPES as readonly string[]).includes(value);
}

export function isStudioStorageKey(key: string) {
  return key.startsWith(STUDIO_PREFIX) && !key.includes("..");
}

export function buildStudioWorkObjectKey(input: {
  workId: string;
  filename: string;
  randomId: string;
}) {
  const safe = sanitizeFilename(input.filename);
  return `${STUDIO_PREFIX}works/${input.workId}/${input.randomId}-${safe}`;
}

/** Public app path that streams a studio object. */
export function studioPublicPath(storageKey: string) {
  if (!isStudioStorageKey(storageKey)) {
    throw new Error("Invalid studio storage key");
  }
  return `/api/studio/${storageKey.slice(STUDIO_PREFIX.length)}`;
}

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_FILES_PER_GROUP = 10;
export const UPLOAD_URL_EXPIRES_IN = 15 * 60; // 15 minutes
export const PENDING_PREFIX = "commissions/pending/";
/** Abandoned pending objects older than this should be deleted (lifecycle + cleanup script). */
export const PENDING_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type UploadGroup = "basic" | "extra";

export function isAllowedImageType(value: string): value is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value);
}

export function isUploadGroup(value: string): value is UploadGroup {
  return value === "basic" || value === "extra";
}

/** Keep original extension when safe; strip path segments. */
export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "upload";
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180);
  return cleaned || "upload";
}

export function buildPendingObjectKey(input: {
  uploadSessionId: string;
  group: UploadGroup;
  filename: string;
  randomId: string;
}): string {
  const safe = sanitizeFilename(input.filename);
  return `${PENDING_PREFIX}${input.uploadSessionId}/${input.group}/${input.randomId}-${safe}`;
}

/** Final key after a request is accepted (outside pending/, safe from abandon cleanup). */
export function buildFinalObjectKey(input: {
  requestId: string;
  group: UploadGroup;
  /** Filename leaf from the pending object key (randomId-safeName). */
  objectName: string;
}): string {
  const leaf = input.objectName.split(/[/\\]/).pop() || "upload";
  return `commissions/${input.requestId}/${input.group}/${leaf}`;
}

export function pendingObjectName(storageKey: string): string {
  return storageKey.split("/").pop() || "upload";
}

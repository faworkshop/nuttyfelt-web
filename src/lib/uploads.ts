export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_FILES_PER_GROUP = 10;
export const UPLOAD_URL_EXPIRES_IN = 15 * 60; // 15 minutes

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
  return `commissions/pending/${input.uploadSessionId}/${input.group}/${input.randomId}-${safe}`;
}

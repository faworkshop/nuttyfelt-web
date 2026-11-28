/** Browser helper for studio work image uploads (testable). */

export type UploadUrlResponse = {
  uploadUrl: string;
  storageKey: string;
  headers?: Record<string, string>;
  expiresIn?: number;
  error?: string;
};

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const preview = (await response.text()).slice(0, 80);
    throw new Error(
      `Expected JSON from ${response.url || "upload-url"} (${response.status}), got: ${preview}`,
    );
  }
  return (await response.json()) as T;
}

export async function requestStudioUploadUrl(input: {
  workId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}): Promise<UploadUrlResponse> {
  const response = await fetch("/api/admin/works/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<UploadUrlResponse>(response);
  if (!response.ok || !payload.uploadUrl) {
    throw new Error(payload.error || `Could not get upload URL (${response.status})`);
  }
  return payload;
}

export async function putStudioFile(
  uploadUrl: string,
  file: Blob,
  headers?: Record<string, string>,
) {
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    body: file,
  });
  if (!put.ok) {
    throw new Error(`Upload failed (${put.status})`);
  }
}

export async function uploadStudioWorkImage(workId: string, file: File) {
  const signed = await requestStudioUploadUrl({
    workId,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });
  await putStudioFile(signed.uploadUrl, file, signed.headers);
  return signed.storageKey;
}

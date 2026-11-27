import type { UploadGroup } from "./uploads";

export type UploadUrlResponse = {
  uploadUrl: string;
  storageKey: string;
  expiresIn: number;
  headers: {
    "Content-Type": string;
  };
  maxBytes: number;
};

export class UploadError extends Error {
  constructor(
    message: string,
    readonly code: "request" | "put" | "network" = "request",
  ) {
    super(message);
    this.name = "UploadError";
  }
}

export async function requestUploadUrl(input: {
  filename: string;
  contentType: string;
  sizeBytes: number;
  group: UploadGroup;
  uploadSessionId: string;
}): Promise<UploadUrlResponse> {
  let response: Response;
  try {
    response = await fetch("/api/commission/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new UploadError("Network error requesting upload URL", "network");
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & Partial<UploadUrlResponse>;

  if (!response.ok || !data.uploadUrl || !data.storageKey || !data.headers) {
    throw new UploadError(data.error || "Could not create upload URL", "request");
  }

  return data as UploadUrlResponse;
}

function putWithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.min(1, event.loaded / event.total));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
        return;
      }
      reject(
        new UploadError(
          `Upload failed (${xhr.status || "network"})`,
          "put",
        ),
      );
    };

    xhr.onerror = () => {
      reject(new UploadError("Network error during upload", "network"));
    };

    xhr.onabort = () => {
      reject(new UploadError("Upload aborted", "network"));
    };

    xhr.send(file);
  });
}

export async function uploadFileToR2(
  file: File,
  options: {
    group: UploadGroup;
    uploadSessionId: string;
    onProgress?: (ratio: number) => void;
  },
): Promise<{ storageKey: string }> {
  const signed = await requestUploadUrl({
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    group: options.group,
    uploadSessionId: options.uploadSessionId,
  });

  options.onProgress?.(0);

  await putWithProgress(
    signed.uploadUrl,
    file,
    signed.headers["Content-Type"],
    options.onProgress,
  );

  return { storageKey: signed.storageKey };
}

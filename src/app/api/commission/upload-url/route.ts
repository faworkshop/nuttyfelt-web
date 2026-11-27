import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getR2Bucket, getR2Client } from "@/lib/r2";
import { rateLimit } from "@/lib/rate-limit";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  UPLOAD_URL_EXPIRES_IN,
  buildPendingObjectKey,
  isAllowedImageType,
  isUploadGroup,
} from "@/lib/uploads";

export const runtime = "nodejs";

type Body = {
  filename?: string;
  contentType?: string;
  sizeBytes?: number;
  group?: string;
  uploadSessionId?: string;
};

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limited = rateLimit(`upload-url:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many upload requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limited.retryAfterMs ?? 60_000) / 1000)),
        },
      },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const filename = body.filename?.trim();
  const contentType = body.contentType?.trim().toLowerCase();
  const sizeBytes = body.sizeBytes;
  const group = body.group;
  const uploadSessionId = body.uploadSessionId?.trim();

  if (!filename || !contentType || typeof sizeBytes !== "number" || !group) {
    return NextResponse.json(
      {
        error:
          "filename, contentType, sizeBytes, and group are required",
      },
      { status: 400 },
    );
  }

  if (!isUploadGroup(group)) {
    return NextResponse.json(
      { error: "group must be basic or extra" },
      { status: 400 },
    );
  }

  if (!isAllowedImageType(contentType)) {
    return NextResponse.json(
      {
        error: "Unsupported content type",
        allowed: ALLOWED_IMAGE_TYPES,
      },
      { status: 400 },
    );
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `sizeBytes must be between 1 and ${MAX_UPLOAD_BYTES}`,
      },
      { status: 400 },
    );
  }

  if (
    !uploadSessionId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uploadSessionId,
    )
  ) {
    return NextResponse.json(
      { error: "uploadSessionId must be a UUID" },
      { status: 400 },
    );
  }

  const randomId = randomUUID();
  const storageKey = buildPendingObjectKey({
    uploadSessionId,
    group,
    filename,
    randomId,
  });

  try {
    const command = new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: storageKey,
      ContentType: contentType,
      ContentLength: sizeBytes,
    });

    const uploadUrl = await getSignedUrl(getR2Client(), command, {
      expiresIn: UPLOAD_URL_EXPIRES_IN,
      // Ensure browsers must send the declared Content-Type.
      signableHeaders: new Set(["content-type"]),
    });

    return NextResponse.json({
      uploadUrl,
      storageKey,
      expiresIn: UPLOAD_URL_EXPIRES_IN,
      headers: {
        "Content-Type": contentType,
      },
      maxBytes: MAX_UPLOAD_BYTES,
    });
  } catch (error) {
    console.error("Failed to create upload URL", error);
    return NextResponse.json(
      { error: "Could not create upload URL" },
      { status: 500 },
    );
  }
}

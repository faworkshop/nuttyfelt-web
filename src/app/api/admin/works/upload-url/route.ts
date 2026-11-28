import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { addWorkImage, getWork } from "@/lib/admin/works";
import { getR2Bucket, getR2Client } from "@/lib/r2";
import {
  STUDIO_ALLOWED_TYPES,
  STUDIO_MAX_UPLOAD_BYTES,
  STUDIO_UPLOAD_URL_EXPIRES_IN,
  buildStudioWorkObjectKey,
  isStudioImageType,
} from "@/lib/studio-uploads";

type Body = {
  workId?: string;
  filename?: string;
  contentType?: string;
  sizeBytes?: number;
};

export async function POST(request: NextRequest) {
  const gate = await requireAdminApi();
  if ("error" in gate && gate.error) return gate.error;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const workId = body.workId?.trim();
  const filename = body.filename?.trim();
  const contentType = body.contentType?.trim().toLowerCase();
  const sizeBytes = body.sizeBytes;

  if (!workId || !filename || !contentType || typeof sizeBytes !== "number") {
    return NextResponse.json(
      { error: "workId, filename, contentType, and sizeBytes are required" },
      { status: 400 },
    );
  }

  if (!isStudioImageType(contentType)) {
    return NextResponse.json(
      { error: "Unsupported content type", allowed: STUDIO_ALLOWED_TYPES },
      { status: 400 },
    );
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > STUDIO_MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File must be between 1 byte and ${STUDIO_MAX_UPLOAD_BYTES} bytes` },
      { status: 400 },
    );
  }

  const work = await getWork(workId);
  if (!work) {
    return NextResponse.json({ error: "Work not found" }, { status: 404 });
  }

  const storageKey = buildStudioWorkObjectKey({
    workId,
    filename,
    randomId: randomUUID().slice(0, 8),
  });

  const command = new PutObjectCommand({
    Bucket: getR2Bucket(),
    Key: storageKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: STUDIO_UPLOAD_URL_EXPIRES_IN,
  });

  const image = await addWorkImage({ workId, storageKey, contentType });

  return NextResponse.json({
    uploadUrl,
    storageKey,
    imageId: image.id,
    headers: { "Content-Type": contentType },
    expiresIn: STUDIO_UPLOAD_URL_EXPIRES_IN,
  });
}

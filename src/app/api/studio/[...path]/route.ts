import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getR2Bucket, getR2Client } from "@/lib/r2";
import { STUDIO_PREFIX, isStudioStorageKey } from "@/lib/studio-uploads";

type Props = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, { params }: Props) {
  const segments = (await params).path ?? [];
  if (!segments.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const storageKey = `${STUDIO_PREFIX}${segments.map(decodeURIComponent).join("/")}`;
  if (!isStudioStorageKey(storageKey)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getR2Bucket(),
        Key: storageKey,
      }),
    );

    if (!result.Body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bytes = await result.Body.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": result.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        ...(result.ContentLength != null
          ? { "Content-Length": String(result.ContentLength) }
          : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

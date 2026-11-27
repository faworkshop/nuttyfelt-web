import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { commissionFiles, commissionRequests } from "@/db/schema";
import { sendClientConfirmation, sendStudioNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getSignedDownloadUrl, headObject } from "@/lib/r2-objects";
import {
  MAX_FILES_PER_GROUP,
  MAX_UPLOAD_BYTES,
  isAllowedImageType,
  isUploadGroup,
  type UploadGroup,
} from "@/lib/uploads";

export const runtime = "nodejs";

type FileInput = {
  group?: string;
  storageKey?: string;
  originalFilename?: string;
  sizeBytes?: number;
  contentType?: string;
};

type Body = {
  locale?: string;
  email?: string;
  displayName?: string;
  instagram?: string;
  whatsapp?: string;
  location?: string;
  country?: string | null;
  catName?: string;
  coatLength?: string;
  features?: string;
  foundVia?: string | null;
  sexBreed?: string | null;
  hopeDate?: string | null;
  stories?: string | null;
  livingStatus?: string | null;
  agreedTerms?: boolean;
  agreedHandmade?: boolean;
  publicity?: string;
  uploadSessionId?: string;
  files?: FileInput[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function trim(value: unknown, max: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function optionalTrim(value: unknown, max: number): string | null {
  const v = trim(value, max);
  return v || null;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limited = rateLimit(`commission-submit:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
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

  const locale = body.locale === "en" ? "en" : body.locale === "zh-Hant" ? "zh-Hant" : null;
  const email = trim(body.email, 320).toLowerCase();
  const displayName = trim(body.displayName, 200);
  const instagram = trim(body.instagram, 200);
  const whatsapp = trim(body.whatsapp, 100);
  const location = body.location === "hk" || body.location === "other" ? body.location : null;
  const country = optionalTrim(body.country, 120);
  const catName = trim(body.catName, 200);
  const coatLength =
    body.coatLength === "short" || body.coatLength === "long" ? body.coatLength : null;
  const features = trim(body.features, 10_000);
  const foundVia = optionalTrim(body.foundVia, 40);
  const sexBreed = optionalTrim(body.sexBreed, 200);
  const hopeDate = optionalTrim(body.hopeDate, 200);
  const stories = optionalTrim(body.stories, 10_000);
  const livingStatus =
    body.livingStatus === "with" ||
    body.livingStatus === "passed" ||
    body.livingStatus === "skip"
      ? body.livingStatus
      : body.livingStatus
        ? null
        : undefined;
  const publicity =
    body.publicity === "tag" || body.publicity === "no-tag" ? body.publicity : null;
  const uploadSessionId = trim(body.uploadSessionId, 36);
  const files = Array.isArray(body.files) ? body.files : [];

  if (
    !locale ||
    !email ||
    !EMAIL_RE.test(email) ||
    !displayName ||
    !instagram ||
    !whatsapp ||
    !location ||
    !catName ||
    !coatLength ||
    !features ||
    !publicity ||
    body.agreedTerms !== true ||
    body.agreedHandmade !== true ||
    !UUID_RE.test(uploadSessionId)
  ) {
    return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
  }

  if (location === "other" && !country) {
    return NextResponse.json(
      { error: "country is required when location is other" },
      { status: 400 },
    );
  }

  if (body.livingStatus && livingStatus === null) {
    return NextResponse.json({ error: "Invalid livingStatus" }, { status: 400 });
  }

  if (files.length < 1) {
    return NextResponse.json({ error: "At least one photo is required" }, { status: 400 });
  }

  const normalizedFiles: {
    group: UploadGroup;
    storageKey: string;
    originalFilename: string;
    sizeBytes: number;
    contentType: string;
  }[] = [];

  let basicCount = 0;
  let extraCount = 0;

  for (const file of files) {
    const group = file.group;
    const storageKey = trim(file.storageKey, 1000);
    const originalFilename = trim(file.originalFilename, 500);
    const sizeBytes = file.sizeBytes;
    const contentType = trim(file.contentType, 120).toLowerCase();

    if (!group || !isUploadGroup(group)) {
      return NextResponse.json({ error: "Invalid file group" }, { status: 400 });
    }
    if (!storageKey || !originalFilename || typeof sizeBytes !== "number") {
      return NextResponse.json({ error: "Invalid file metadata" }, { status: 400 });
    }
    if (!isAllowedImageType(contentType)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }

    const expectedPrefix = `commissions/pending/${uploadSessionId}/${group}/`;
    if (!storageKey.startsWith(expectedPrefix) || storageKey.includes("..")) {
      return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
    }

    if (group === "basic") basicCount += 1;
    else extraCount += 1;

    normalizedFiles.push({
      group,
      storageKey,
      originalFilename,
      sizeBytes,
      contentType,
    });
  }

  if (basicCount < 1) {
    return NextResponse.json(
      { error: "At least one basic-angle photo is required" },
      { status: 400 },
    );
  }
  if (basicCount > MAX_FILES_PER_GROUP || extraCount > MAX_FILES_PER_GROUP) {
    return NextResponse.json({ error: "Too many files in a group" }, { status: 400 });
  }

  const missing: string[] = [];
  for (const file of normalizedFiles) {
    const head = await headObject(file.storageKey);
    if (!head || head.contentLength <= 0) {
      missing.push(file.originalFilename);
      continue;
    }
    if (head.contentLength !== file.sizeBytes) {
      missing.push(file.originalFilename);
      continue;
    }
    if (head.contentType && !isAllowedImageType(head.contentType.toLowerCase())) {
      missing.push(file.originalFilename);
    }
  }

  if (missing.length) {
    return NextResponse.json(
      {
        error: "Some uploads could not be verified. Please retry those files.",
        missing,
      },
      { status: 400 },
    );
  }

  const db = getDb();
  let requestId: string;

  try {
    const [inserted] = await db
      .insert(commissionRequests)
      .values({
        locale,
        email,
        displayName,
        instagram,
        whatsapp,
        location,
        country: location === "other" ? country : null,
        catName,
        coatLength,
        features,
        foundVia,
        sexBreed,
        hopeDate,
        stories,
        livingStatus: livingStatus ?? null,
        agreedTerms: true,
        agreedHandmade: true,
        publicity,
        status: "received",
      })
      .returning({ id: commissionRequests.id });

    requestId = inserted.id;

    await db.insert(commissionFiles).values(
      normalizedFiles.map((file) => ({
        requestId,
        group: file.group,
        storageKey: file.storageKey,
        originalFilename: file.originalFilename,
        sizeBytes: file.sizeBytes,
        contentType: file.contentType,
      })),
    );
  } catch (error) {
    console.error("Failed to store commission request", error);
    return NextResponse.json(
      { error: "Could not store request. Please try again." },
      { status: 500 },
    );
  }

  const fileLinks = await Promise.all(
    normalizedFiles.map(async (file) => ({
      group: file.group,
      filename: file.originalFilename,
      url: await getSignedDownloadUrl(file.storageKey),
      sizeBytes: file.sizeBytes,
    })),
  );

  let notifyOk = false;
  let confirmOk = false;
  const emailFailures: string[] = [];

  try {
    await sendStudioNotification({
      requestId,
      locale,
      email,
      displayName,
      instagram,
      whatsapp,
      location,
      country: location === "other" ? country : null,
      catName,
      coatLength,
      features,
      foundVia,
      sexBreed,
      hopeDate,
      stories,
      livingStatus: livingStatus ?? null,
      publicity,
      files: fileLinks,
    });
    notifyOk = true;
    await db
      .update(commissionRequests)
      .set({ notifyEmailSentAt: new Date(), updatedAt: new Date() })
      .where(eq(commissionRequests.id, requestId));
  } catch (error) {
    console.error("Studio notification email failed", requestId, error);
    emailFailures.push("notify");
  }

  try {
    await sendClientConfirmation({
      email,
      displayName,
      catName,
      locale,
    });
    confirmOk = true;
    await db
      .update(commissionRequests)
      .set({ confirmEmailSentAt: new Date(), updatedAt: new Date() })
      .where(eq(commissionRequests.id, requestId));
  } catch (error) {
    console.error("Client confirmation email failed", requestId, error);
    emailFailures.push("confirm");
  }

  if (emailFailures.length) {
    await db
      .update(commissionRequests)
      .set({
        failureReason: `email_failed:${emailFailures.join(",")}`,
        updatedAt: new Date(),
      })
      .where(eq(commissionRequests.id, requestId));
  }

  // Request is stored; client success even if email partially failed.
  return NextResponse.json({
    ok: true,
    requestId,
    email: { notify: notifyOk, confirm: confirmOk },
  });
}

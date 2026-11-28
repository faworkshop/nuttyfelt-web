import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { createWork, listWorksAdmin } from "@/lib/admin/works";

export async function GET() {
  const gate = await requireAdminApi();
  if ("error" in gate && gate.error) return gate.error;

  const rows = await listWorksAdmin();
  return NextResponse.json({ works: rows });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApi();
  if ("error" in gate && gate.error) return gate.error;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const titleZh = String(body.titleZh ?? "").trim();
  const titleEn = String(body.titleEn ?? "").trim();
  if (!titleZh || !titleEn) {
    return NextResponse.json(
      { error: "titleZh and titleEn are required" },
      { status: 400 },
    );
  }

  const created = await createWork({
    titleZh,
    titleEn,
    captionZh: emptyToNull(body.captionZh),
    captionEn: emptyToNull(body.captionEn),
    visible: body.visible !== false,
    featuredOnHome: body.featuredOnHome === true,
  });

  return NextResponse.json({ work: created }, { status: 201 });
}

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

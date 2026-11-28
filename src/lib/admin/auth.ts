import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * E2E-only bypass for Playwright (`E2E_BYPASS_ADMIN_AUTH=1` on the test webServer).
 * Never set this on Railway / real production hosts.
 */
export function e2eAdminBypassEnabled() {
  return process.env.E2E_BYPASS_ADMIN_AUTH === "1";
}

export async function requireAdminPage() {
  if (e2eAdminBypassEnabled()) return;
  await auth.protect();
}

/** For Route Handlers — always JSON errors, never HTML redirects. */
export async function requireAdminApi() {
  if (e2eAdminBypassEnabled()) {
    return { userId: "e2e-admin" as string };
  }

  const session = await auth();
  if (!session.userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: session.userId };
}

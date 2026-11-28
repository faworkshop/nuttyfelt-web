import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

async function DynamicMarker() {
  await connection();
  return null;
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-wool px-4">
      <Suspense fallback={<p className="font-ui text-ink-muted">Loading…</p>}>
        <DynamicMarker />
        <SignIn />
      </Suspense>
    </div>
  );
}

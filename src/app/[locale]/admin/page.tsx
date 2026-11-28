import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { countCommissionsByStatus } from "@/lib/admin/commissions";

async function OverviewStats() {
  await connection();
  await auth.protect();
  const counts = await countCommissionsByStatus();
  const open =
    (counts.received ?? 0) +
    (counts.photos_reviewed ?? 0) +
    (counts.scheduled ?? 0) +
    (counts.deposit_paid ?? 0) +
    (counts.in_progress ?? 0) +
    (counts.balance_paid ?? 0) +
    (counts.revisions ?? 0);
  const received = counts.received ?? 0;
  const failed = counts.failed ?? 0;

  return (
    <dl className="mt-6 grid gap-3 sm:grid-cols-3">
      <div className="rounded-md border border-line bg-paper px-4 py-3">
        <dt className="font-ui text-xs text-ink-muted">Open pipeline</dt>
        <dd className="mt-1 font-display text-2xl text-ink">{open}</dd>
      </div>
      <div className="rounded-md border border-line bg-paper px-4 py-3">
        <dt className="font-ui text-xs text-ink-muted">New (received)</dt>
        <dd className="mt-1 font-display text-2xl text-ink">{received}</dd>
      </div>
      <div className="rounded-md border border-line bg-paper px-4 py-3">
        <dt className="font-ui text-xs text-ink-muted">Failed intake</dt>
        <dd className="mt-1 font-display text-2xl text-ink">{failed}</dd>
      </div>
    </dl>
  );
}

export default async function AdminHomePage() {
  await auth.protect();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Overview</h1>
      <p className="mt-3 max-w-xl font-body text-ink-muted">
        Private studio portal. Manage commissions first; Works &amp; Home content
        next.
      </p>

      <Suspense
        fallback={
          <p className="mt-6 font-ui text-sm text-ink-muted">Loading counts…</p>
        }
      >
        <OverviewStats />
      </Suspense>

      <ul className="mt-8 space-y-3">
        <li>
          <Link
            href="/admin/commissions"
            className="block rounded-md border border-line bg-paper px-4 py-4 font-ui text-ink hover:border-brass"
          >
            Commissions
            <span className="mt-1 block text-sm text-ink-muted">
              Queue, detail, photos, status
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/works"
            className="block rounded-md border border-line bg-paper px-4 py-4 font-ui text-ink hover:border-brass"
          >
            Works &amp; Home
            <span className="mt-1 block text-sm text-ink-muted">
              Public showcase entries and featured slots
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

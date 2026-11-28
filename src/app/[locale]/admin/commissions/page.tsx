import { Suspense } from "react";
import { CommissionFilters } from "@/components/admin/CommissionFilters";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Link } from "@/i18n/navigation";
import { isCommissionStatus, statusLabel } from "@/lib/admin/commission-status";
import {
  countCommissionsByStatus,
  listCommissions,
} from "@/lib/admin/commissions";
import { toReferenceNo } from "@/lib/reference";
import type { CommissionStatus } from "@/db/schema";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-HK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function CommissionList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const raw = (await searchParams).status;
  const status: CommissionStatus | undefined =
    raw && isCommissionStatus(raw) ? raw : undefined;

  const [rows, counts] = await Promise.all([
    listCommissions({ status }),
    countCommissionsByStatus(),
  ]);
  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  return (
    <>
      <p className="mt-2 font-body text-ink-muted">
        {total} total · newest first
      </p>

      <CommissionFilters active={status} counts={counts} total={total} />

      {rows.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-line bg-paper px-4 py-10 text-center font-ui text-sm text-ink-muted">
          No commissions{status ? ` with status “${statusLabel(status)}”` : ""}.
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={{
                    pathname: "/admin/commissions/[id]",
                    params: { id: row.id },
                  }}
                  className="block rounded-md border border-line bg-paper px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-ui text-xs text-ink-muted">
                        {toReferenceNo(row.id)}
                      </p>
                      <p className="mt-1 font-display text-lg text-ink">
                        {row.catName}
                      </p>
                      <p className="font-ui text-sm text-ink-muted">
                        {row.displayName}
                      </p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="mt-3 font-ui text-xs text-ink-muted">
                    {formatWhen(row.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto rounded-md border border-line bg-paper md:block">
            <table className="w-full min-w-[40rem] text-left font-ui text-sm">
              <thead className="border-b border-line bg-mist/50 text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref</th>
                  <th className="px-4 py-3 font-medium">Cat</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={{
                          pathname: "/admin/commissions/[id]",
                          params: { id: row.id },
                        }}
                        className="text-brass-deep underline-offset-2 hover:underline"
                      >
                        {toReferenceNo(row.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink">{row.catName}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.displayName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatWhen(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default function AdminCommissionsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Commissions</h1>
      <Suspense
        fallback={
          <p className="mt-2 font-ui text-sm text-ink-muted">
            Loading commissions…
          </p>
        }
      >
        <CommissionList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

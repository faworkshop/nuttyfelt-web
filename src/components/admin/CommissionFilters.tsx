"use client";

import { useLocale } from "next-intl";
import type { CommissionStatus } from "@/db/schema";
import { STATUS_WORKFLOW, statusLabel } from "@/lib/admin/commission-status";

type Props = {
  active?: CommissionStatus;
  counts: Partial<Record<CommissionStatus, number>>;
  total: number;
};

export function CommissionFilters({ active, counts, total }: Props) {
  const locale = useLocale();
  const prefix = locale === "en" ? "/en" : "";

  return (
    <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
      <Chip
        href={`${prefix}/admin/commissions`}
        active={!active}
        label={`All (${total})`}
      />
      {STATUS_WORKFLOW.map((value) => (
        <Chip
          key={value}
          href={`${prefix}/admin/commissions?status=${value}`}
          active={active === value}
          label={`${statusLabel(value)} (${counts[value] ?? 0})`}
        />
      ))}
    </div>
  );
}

function Chip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={`shrink-0 rounded-md px-3 py-1.5 font-ui text-xs ${
        active ? "bg-ink text-wool" : "bg-paper text-ink-muted ring-1 ring-line"
      }`}
    >
      {label}
    </a>
  );
}

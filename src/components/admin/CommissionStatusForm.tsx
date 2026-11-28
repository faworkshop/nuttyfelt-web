"use client";

import type { CommissionStatus } from "@/db/schema";
import { STATUS_WORKFLOW, statusLabel } from "@/lib/admin/commission-status";
import { setCommissionStatusAction } from "@/app/[locale]/admin/commissions/actions";

type Props = {
  id: string;
  status: CommissionStatus;
};

export function CommissionStatusForm({ id, status }: Props) {
  return (
    <form action={setCommissionStatusAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="id" value={id} />
      <label className="block flex-1 font-ui text-sm text-ink">
        Status
        <select
          name="status"
          defaultValue={status}
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-ink"
        >
          {STATUS_WORKFLOW.map((value) => (
            <option key={value} value={value}>
              {statusLabel(value)}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
        Update status
      </button>
    </form>
  );
}

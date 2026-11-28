"use client";

import type { CommissionRequest } from "@/db/schema";
import { saveCommissionAdminAction } from "@/app/[locale]/admin/commissions/actions";

type Props = {
  request: CommissionRequest;
};

export function CommissionAdminForm({ request }: Props) {
  return (
    <form action={saveCommissionAdminAction} className="space-y-5">
      <input type="hidden" name="id" value={request.id} />

      <label className="block font-ui text-sm text-ink">
        Photos sufficient?
        <select
          name="photosSufficient"
          defaultValue={
            request.photosSufficient === true
              ? "yes"
              : request.photosSufficient === false
                ? "no"
                : ""
          }
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
        >
          <option value="">Not set</option>
          <option value="yes">Yes</option>
          <option value="no">Need more photos</option>
        </select>
      </label>

      <label className="block font-ui text-sm text-ink">
        Photo notes
        <textarea
          name="photoNotes"
          rows={3}
          defaultValue={request.photoNotes ?? ""}
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
        />
      </label>

      <label className="block font-ui text-sm text-ink">
        Scheduled month
        <input
          name="scheduledMonth"
          type="text"
          placeholder="e.g. 2026-04"
          defaultValue={request.scheduledMonth ?? ""}
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
        />
      </label>

      <input
        type="hidden"
        name="previousDepositPaidAt"
        value={request.depositPaidAt?.toISOString() ?? ""}
      />
      <input
        type="hidden"
        name="previousBalancePaidAt"
        value={request.balancePaidAt?.toISOString() ?? ""}
      />

      <div className="flex flex-wrap gap-5 font-ui text-sm text-ink">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="depositPaid"
            defaultChecked={Boolean(request.depositPaidAt)}
          />
          Deposit paid
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="balancePaid"
            defaultChecked={Boolean(request.balancePaidAt)}
          />
          Balance paid
        </label>
      </div>

      <label className="block font-ui text-sm text-ink">
        Revision count (max 2)
        <input
          name="revisionCount"
          type="number"
          min={0}
          max={2}
          defaultValue={request.revisionCount}
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 sm:w-32"
        />
      </label>

      <label className="block font-ui text-sm text-ink">
        Handover / shipping notes
        <textarea
          name="handoverNotes"
          rows={3}
          defaultValue={request.handoverNotes ?? ""}
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
        />
      </label>

      <label className="block font-ui text-sm text-ink">
        Admin notes
        <textarea
          name="adminNotes"
          rows={4}
          defaultValue={request.adminNotes ?? ""}
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
        />
      </label>

      <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
        Save notes
      </button>
    </form>
  );
}

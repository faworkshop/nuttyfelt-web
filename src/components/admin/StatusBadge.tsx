import type { CommissionStatus } from "@/db/schema";
import { statusLabel } from "@/lib/admin/commission-status";

const TONE: Record<CommissionStatus, string> = {
  received: "bg-mist text-ink",
  failed: "bg-danger/15 text-danger",
  photos_reviewed: "bg-mist text-ink",
  scheduled: "bg-brass/20 text-brass-deep",
  deposit_paid: "bg-brass/20 text-brass-deep",
  in_progress: "bg-brass/25 text-ink",
  balance_paid: "bg-success/15 text-success",
  revisions: "bg-mist text-ink",
  handed_over: "bg-success/15 text-success",
};

export function StatusBadge({ status }: { status: CommissionStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 font-ui text-xs ${TONE[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

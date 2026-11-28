import type { CommissionStatus } from "@/db/schema";
import { COMMISSION_STATUSES } from "@/db/schema";

export const STATUS_LABELS: Record<CommissionStatus, string> = {
  received: "Received",
  failed: "Failed",
  photos_reviewed: "Photos reviewed",
  scheduled: "Scheduled",
  deposit_paid: "Deposit paid",
  in_progress: "In progress",
  balance_paid: "Balance paid",
  revisions: "Revisions",
  handed_over: "Handed over",
};

/** Artist workflow order (failed kept at end for filters). */
export const STATUS_WORKFLOW: CommissionStatus[] = [
  "received",
  "photos_reviewed",
  "scheduled",
  "deposit_paid",
  "in_progress",
  "balance_paid",
  "revisions",
  "handed_over",
  "failed",
];

export function isCommissionStatus(value: string): value is CommissionStatus {
  return (COMMISSION_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(status: CommissionStatus) {
  return STATUS_LABELS[status];
}

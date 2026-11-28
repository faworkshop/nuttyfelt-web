import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  commissionFiles,
  commissionRequests,
  type CommissionStatus,
} from "@/db/schema";

export async function listCommissions(input?: {
  status?: CommissionStatus;
  limit?: number;
}) {
  const db = getDb();
  const limit = input?.limit ?? 100;
  const where = input?.status
    ? eq(commissionRequests.status, input.status)
    : undefined;

  return db
    .select({
      id: commissionRequests.id,
      createdAt: commissionRequests.createdAt,
      status: commissionRequests.status,
      failureReason: commissionRequests.failureReason,
      displayName: commissionRequests.displayName,
      email: commissionRequests.email,
      catName: commissionRequests.catName,
      locale: commissionRequests.locale,
      location: commissionRequests.location,
      country: commissionRequests.country,
      publicity: commissionRequests.publicity,
      scheduledMonth: commissionRequests.scheduledMonth,
      notifyEmailSentAt: commissionRequests.notifyEmailSentAt,
      confirmEmailSentAt: commissionRequests.confirmEmailSentAt,
    })
    .from(commissionRequests)
    .where(where)
    .orderBy(desc(commissionRequests.createdAt))
    .limit(limit);
}

export async function countCommissionsByStatus() {
  const db = getDb();
  const rows = await db
    .select({
      status: commissionRequests.status,
      total: count(),
    })
    .from(commissionRequests)
    .groupBy(commissionRequests.status);

  return Object.fromEntries(rows.map((row) => [row.status, row.total])) as Partial<
    Record<CommissionStatus, number>
  >;
}

export async function getCommission(id: string) {
  const db = getDb();
  const [[request], files] = await Promise.all([
    db
      .select()
      .from(commissionRequests)
      .where(eq(commissionRequests.id, id))
      .limit(1),
    db
      .select()
      .from(commissionFiles)
      .where(eq(commissionFiles.requestId, id))
      .orderBy(commissionFiles.createdAt),
  ]);

  if (!request) return null;
  return { request, files };
}

export async function updateCommissionStatus(
  id: string,
  status: CommissionStatus,
) {
  const db = getDb();
  const [updated] = await db
    .update(commissionRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(commissionRequests.id, id))
    .returning({ id: commissionRequests.id, status: commissionRequests.status });
  return updated ?? null;
}

export async function updateCommissionAdminFields(
  id: string,
  fields: {
    photosSufficient?: boolean | null;
    photoNotes?: string | null;
    scheduledMonth?: string | null;
    depositPaidAt?: Date | null;
    balancePaidAt?: Date | null;
    revisionCount?: number;
    handoverNotes?: string | null;
    adminNotes?: string | null;
    status?: CommissionStatus;
  },
) {
  const db = getDb();
  const [updated] = await db
    .update(commissionRequests)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(commissionRequests.id, id)))
    .returning({ id: commissionRequests.id });
  return updated ?? null;
}

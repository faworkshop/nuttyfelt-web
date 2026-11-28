"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPage } from "@/lib/admin/auth";
import { isCommissionStatus } from "@/lib/admin/commission-status";
import {
  updateCommissionAdminFields,
  updateCommissionStatus,
} from "@/lib/admin/commissions";

export async function setCommissionStatusAction(formData: FormData) {
  await requireAdminPage();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isCommissionStatus(status)) {
    throw new Error("Invalid status update");
  }

  const updated = await updateCommissionStatus(id, status);
  if (!updated) throw new Error("Commission not found");

  revalidatePath("/admin/commissions");
  revalidatePath(`/admin/commissions/${id}`);
}

export async function saveCommissionAdminAction(formData: FormData) {
  await requireAdminPage();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing commission id");

  const photosRaw = String(formData.get("photosSufficient") ?? "");
  const photosSufficient =
    photosRaw === "yes" ? true : photosRaw === "no" ? false : null;

  const revisionRaw = String(formData.get("revisionCount") ?? "0");
  const revisionCount = Math.max(0, Math.min(2, Number(revisionRaw) || 0));

  const depositChecked = formData.get("depositPaid") === "on";
  const balanceChecked = formData.get("balancePaid") === "on";
  const previousDeposit = emptyToNull(formData.get("previousDepositPaidAt"));
  const previousBalance = emptyToNull(formData.get("previousBalancePaidAt"));

  const updated = await updateCommissionAdminFields(id, {
    photosSufficient,
    photoNotes: emptyToNull(formData.get("photoNotes")),
    scheduledMonth: emptyToNull(formData.get("scheduledMonth")),
    depositPaidAt: depositChecked
      ? previousDeposit
        ? new Date(previousDeposit)
        : new Date()
      : null,
    balancePaidAt: balanceChecked
      ? previousBalance
        ? new Date(previousBalance)
        : new Date()
      : null,
    revisionCount,
    handoverNotes: emptyToNull(formData.get("handoverNotes")),
    adminNotes: emptyToNull(formData.get("adminNotes")),
  });

  if (!updated) throw new Error("Commission not found");

  revalidatePath("/admin/commissions");
  revalidatePath(`/admin/commissions/${id}`);
}

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

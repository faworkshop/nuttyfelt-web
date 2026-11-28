"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin/auth";
import {
  clearWorkImageHomeHero,
  deleteWork,
  deleteWorkImage,
  reorderWorks,
  setWorkImageCover,
  setWorkImageHomeHero,
  updateWork,
} from "@/lib/admin/works";

function adminPath(path: string, locale: string) {
  return locale === "en" ? `/en${path}` : path;
}

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function updateWorkAction(formData: FormData) {
  await requireAdminPage();

  const id = String(formData.get("id") ?? "").trim();
  const titleZh = String(formData.get("titleZh") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  if (!id || !titleZh || !titleEn) {
    throw new Error("Missing required fields");
  }

  const featuredOnHome = formData.get("featuredOnHome") === "on";
  const featuredRankRaw = String(formData.get("featuredRank") ?? "").trim();
  const featuredRank = featuredOnHome
    ? Math.max(0, Number(featuredRankRaw) || 0)
    : null;
  const sortOrder = Math.max(0, Number(formData.get("sortOrder") ?? 0) || 0);

  const updated = await updateWork(id, {
    titleZh,
    titleEn,
    captionZh: emptyToNull(formData.get("captionZh")),
    captionEn: emptyToNull(formData.get("captionEn")),
    visible: formData.get("visible") === "on",
    featuredOnHome,
    featuredRank,
    sortOrder,
  });

  if (!updated) throw new Error("Work not found");

  revalidatePath("/admin/works");
  revalidatePath(`/admin/works/${id}`);
  revalidatePath("/works");
  revalidatePath(`/works/${id}`);
  revalidatePath("/");
}

export async function deleteWorkAction(formData: FormData) {
  await requireAdminPage();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing id");

  await deleteWork(id);
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath(`/works/${id}`);
  revalidatePath("/");
  redirect(adminPath("/admin/works", await getLocale()));
}

export async function deleteWorkImageAction(formData: FormData) {
  await requireAdminPage();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const workId = String(formData.get("workId") ?? "").trim();
  if (!imageId || !workId) throw new Error("Missing image");

  await deleteWorkImage(imageId);
  revalidatePath("/admin/works");
  revalidatePath(`/admin/works/${workId}`);
  revalidatePath("/works");
  revalidatePath(`/works/${workId}`);
  revalidatePath("/");
}

export async function setWorkImageCoverAction(formData: FormData) {
  await requireAdminPage();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const workId = String(formData.get("workId") ?? "").trim();
  if (!imageId || !workId) throw new Error("Missing image");

  const updated = await setWorkImageCover(imageId);
  if (!updated) throw new Error("Image not found");

  revalidatePath("/admin/works");
  revalidatePath(`/admin/works/${workId}`);
  revalidatePath("/works");
  revalidatePath(`/works/${workId}`);
  revalidatePath("/");
}

export async function setWorkImageHomeHeroAction(formData: FormData) {
  await requireAdminPage();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const workId = String(formData.get("workId") ?? "").trim();
  if (!imageId || !workId) throw new Error("Missing image");

  const updated = await setWorkImageHomeHero(imageId);
  if (!updated) throw new Error("Image not found");

  revalidatePath("/admin/works");
  revalidatePath(`/admin/works/${workId}`);
  revalidatePath("/");
}

export async function clearWorkImageHomeHeroAction(formData: FormData) {
  await requireAdminPage();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const workId = String(formData.get("workId") ?? "").trim();
  if (!imageId || !workId) throw new Error("Missing image");

  await clearWorkImageHomeHero(imageId);
  revalidatePath("/admin/works");
  revalidatePath(`/admin/works/${workId}`);
  revalidatePath("/");
}

export async function moveWorkAction(formData: FormData) {
  await requireAdminPage();
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) {
    throw new Error("Invalid reorder");
  }

  const { listWorksAdmin } = await import("@/lib/admin/works");
  const rows = await listWorksAdmin();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error("Work not found");

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= rows.length) return;

  const ordered = rows.map((row) => row.id);
  [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];
  await reorderWorks(ordered);

  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/");
}

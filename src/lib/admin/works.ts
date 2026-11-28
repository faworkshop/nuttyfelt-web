import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { workImages, works, type Work, type WorkImage } from "@/db/schema";
import type { AppLocale } from "@/i18n/routing";
import { studioPublicPath } from "@/lib/studio-uploads";

export type WorkWithImages = Work & { images: WorkImage[] };

export type WorkView = Work & {
  images: WorkImage[];
  imageUrl: string | null;
  imageUrls: string[];
  title: string;
  caption: string | null;
};

function coverKey(images: WorkImage[]) {
  return images[0]?.storageKey ?? null;
}

export function presentWork(work: WorkWithImages, locale: AppLocale): WorkView {
  const imageUrls = work.images.map((image) => studioPublicPath(image.storageKey));
  const key = coverKey(work.images);
  return {
    ...work,
    title: locale === "en" ? work.titleEn : work.titleZh,
    caption: locale === "en" ? work.captionEn : work.captionZh,
    imageUrl: key ? studioPublicPath(key) : null,
    imageUrls,
  };
}

async function attachImages(rows: Work[]): Promise<WorkWithImages[]> {
  if (rows.length === 0) return [];
  const db = getDb();
  const ids = rows.map((row) => row.id);
  const images = await db
    .select()
    .from(workImages)
    .where(inArray(workImages.workId, ids))
    .orderBy(asc(workImages.sortOrder), asc(workImages.createdAt));

  const byWork = new Map<string, WorkImage[]>();
  for (const image of images) {
    const list = byWork.get(image.workId) ?? [];
    list.push(image);
    byWork.set(image.workId, list);
  }

  return rows.map((row) => ({
    ...row,
    images: byWork.get(row.id) ?? [],
  }));
}

export async function listWorksAdmin() {
  const db = getDb();
  const rows = await db
    .select()
    .from(works)
    .orderBy(asc(works.sortOrder), desc(works.createdAt));
  return attachImages(rows);
}

export async function listVisibleWorks() {
  const db = getDb();
  const rows = await db
    .select()
    .from(works)
    .where(eq(works.visible, true))
    .orderBy(asc(works.sortOrder), desc(works.createdAt));
  return attachImages(rows);
}

export async function listHomeFeaturedWorks(limit = 3) {
  const db = getDb();
  const rows = await db
    .select()
    .from(works)
    .where(and(eq(works.visible, true), eq(works.featuredOnHome, true)))
    .orderBy(asc(works.featuredRank), asc(works.sortOrder))
    .limit(limit);
  return attachImages(rows);
}

export async function getWork(id: string) {
  const db = getDb();
  const [row] = await db.select().from(works).where(eq(works.id, id)).limit(1);
  if (!row) return null;
  const [withImages] = await attachImages([row]);
  return withImages ?? null;
}

/** Public detail — hidden works 404. */
export async function getVisibleWork(id: string) {
  const work = await getWork(id);
  if (!work || !work.visible) return null;
  return work;
}

export async function listWorkImages(workId: string) {
  const db = getDb();
  return db
    .select()
    .from(workImages)
    .where(eq(workImages.workId, workId))
    .orderBy(asc(workImages.sortOrder), asc(workImages.createdAt));
}

export async function createWork(input: {
  titleZh: string;
  titleEn: string;
  captionZh?: string | null;
  captionEn?: string | null;
  visible?: boolean;
  featuredOnHome?: boolean;
}) {
  const db = getDb();
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${works.sortOrder}), -1)` })
    .from(works);

  const [created] = await db
    .insert(works)
    .values({
      titleZh: input.titleZh,
      titleEn: input.titleEn,
      captionZh: input.captionZh ?? null,
      captionEn: input.captionEn ?? null,
      visible: input.visible ?? true,
      featuredOnHome: input.featuredOnHome ?? false,
      featuredRank: input.featuredOnHome ? 0 : null,
      sortOrder: (max ?? -1) + 1,
    })
    .returning();

  return { ...created, images: [] as WorkImage[] };
}

export async function updateWork(
  id: string,
  fields: Partial<{
    titleZh: string;
    titleEn: string;
    captionZh: string | null;
    captionEn: string | null;
    sortOrder: number;
    visible: boolean;
    featuredOnHome: boolean;
    featuredRank: number | null;
  }>,
) {
  const db = getDb();
  const [updated] = await db
    .update(works)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(works.id, id))
    .returning();
  return updated ?? null;
}

export async function addWorkImage(input: {
  workId: string;
  storageKey: string;
  contentType: string;
}) {
  const db = getDb();
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${workImages.sortOrder}), -1)` })
    .from(workImages)
    .where(eq(workImages.workId, input.workId));

  const [created] = await db
    .insert(workImages)
    .values({
      workId: input.workId,
      storageKey: input.storageKey,
      contentType: input.contentType,
      sortOrder: (max ?? -1) + 1,
    })
    .returning();

  await db
    .update(works)
    .set({ updatedAt: new Date() })
    .where(eq(works.id, input.workId));

  return created;
}

export async function deleteWorkImage(imageId: string) {
  const db = getDb();
  const [deleted] = await db
    .delete(workImages)
    .where(eq(workImages.id, imageId))
    .returning();
  if (deleted) {
    await db
      .update(works)
      .set({ updatedAt: new Date() })
      .where(eq(works.id, deleted.workId));
  }
  return deleted ?? null;
}

export async function setWorkImageCover(imageId: string) {
  const db = getDb();
  const [image] = await db
    .select()
    .from(workImages)
    .where(eq(workImages.id, imageId))
    .limit(1);
  if (!image) return null;

  const siblings = await listWorkImages(image.workId);
  await Promise.all(
    siblings.map((sibling, index) =>
      db
        .update(workImages)
        .set({
          sortOrder: sibling.id === imageId ? 0 : index + 1,
        })
        .where(eq(workImages.id, sibling.id)),
    ),
  );

  await db
    .update(works)
    .set({ updatedAt: new Date() })
    .where(eq(works.id, image.workId));

  return image;
}

/** Public home full-bleed hero. Only set when parent work is visible. */
export async function getHomeHeroImageUrl() {
  const db = getDb();
  const [row] = await db
    .select({
      storageKey: workImages.storageKey,
    })
    .from(workImages)
    .innerJoin(works, eq(workImages.workId, works.id))
    .where(and(eq(workImages.homeHero, true), eq(works.visible, true)))
    .limit(1);

  return row ? studioPublicPath(row.storageKey) : null;
}

export async function setWorkImageHomeHero(imageId: string) {
  const db = getDb();
  const [image] = await db
    .select()
    .from(workImages)
    .where(eq(workImages.id, imageId))
    .limit(1);
  if (!image) return null;

  await db.update(workImages).set({ homeHero: false }).where(eq(workImages.homeHero, true));
  await db
    .update(workImages)
    .set({ homeHero: true })
    .where(eq(workImages.id, imageId));
  await db
    .update(works)
    .set({ updatedAt: new Date() })
    .where(eq(works.id, image.workId));

  return image;
}

export async function clearWorkImageHomeHero(imageId: string) {
  const db = getDb();
  const [image] = await db
    .update(workImages)
    .set({ homeHero: false })
    .where(eq(workImages.id, imageId))
    .returning();
  if (image) {
    await db
      .update(works)
      .set({ updatedAt: new Date() })
      .where(eq(works.id, image.workId));
  }
  return image ?? null;
}

export async function deleteWork(id: string) {
  const db = getDb();
  const [deleted] = await db.delete(works).where(eq(works.id, id)).returning();
  return deleted ?? null;
}

export async function reorderWorks(orderedIds: string[]) {
  const db = getDb();
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(works)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(works.id, id)),
    ),
  );
}

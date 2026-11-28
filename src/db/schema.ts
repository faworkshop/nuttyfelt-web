import {
  bigint,
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const localeEnum = pgEnum("locale", ["zh-Hant", "en"]);

export const locationEnum = pgEnum("location", ["hk", "other"]);

export const coatLengthEnum = pgEnum("coat_length", ["short", "long"]);

export const publicityEnum = pgEnum("publicity", ["tag", "no-tag"]);

export const livingStatusEnum = pgEnum("living_status", [
  "with",
  "passed",
  "skip",
]);

/** Artist-managed lifecycle. `failed` is intake/storage/email failure. */
export const requestStatusEnum = pgEnum("request_status", [
  "received",
  "failed",
  "photos_reviewed",
  "scheduled",
  "deposit_paid",
  "in_progress",
  "balance_paid",
  "revisions",
  "handed_over",
]);

export const fileGroupEnum = pgEnum("file_group", ["basic", "extra"]);

export const COMMISSION_STATUSES = requestStatusEnum.enumValues;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const commissionRequests = pgTable("commission_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  locale: localeEnum("locale").notNull(),
  status: requestStatusEnum("status").notNull().default("received"),
  failureReason: text("failure_reason"),

  email: varchar("email", { length: 320 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  instagram: varchar("instagram", { length: 200 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 100 }).notNull(),
  location: locationEnum("location").notNull(),
  country: varchar("country", { length: 120 }),

  catName: varchar("cat_name", { length: 200 }).notNull(),
  coatLength: coatLengthEnum("coat_length").notNull(),
  features: text("features").notNull(),
  foundVia: varchar("found_via", { length: 40 }),
  sexBreed: varchar("sex_breed", { length: 200 }),
  hopeDate: varchar("hope_date", { length: 200 }),
  stories: text("stories"),

  /** Private — never expose in public APIs, logs, or marketing exports */
  livingStatus: livingStatusEnum("living_status"),

  agreedTerms: boolean("agreed_terms").notNull(),
  agreedHandmade: boolean("agreed_handmade").notNull(),
  publicity: publicityEnum("publicity").notNull(),

  notifyEmailSentAt: timestamp("notify_email_sent_at", { withTimezone: true }),
  confirmEmailSentAt: timestamp("confirm_email_sent_at", { withTimezone: true }),

  /** Admin fields (phase 2) */
  photosSufficient: boolean("photos_sufficient"),
  photoNotes: text("photo_notes"),
  scheduledMonth: varchar("scheduled_month", { length: 40 }),
  depositPaidAt: timestamp("deposit_paid_at", { withTimezone: true }),
  balancePaidAt: timestamp("balance_paid_at", { withTimezone: true }),
  revisionCount: integer("revision_count").notNull().default(0),
  handoverNotes: text("handover_notes"),
  adminNotes: text("admin_notes"),
});

export const commissionFiles = pgTable("commission_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

  requestId: uuid("request_id")
    .notNull()
    .references(() => commissionRequests.id, { onDelete: "cascade" }),

  group: fileGroupEnum("group").notNull(),
  storageKey: text("storage_key").notNull(),
  originalFilename: varchar("original_filename", { length: 500 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  contentType: varchar("content_type", { length: 120 }).notNull(),
});

/** Public Works showcase entries (studio marketing images only). */
export const works = pgTable("works", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  titleZh: varchar("title_zh", { length: 200 }).notNull(),
  titleEn: varchar("title_en", { length: 200 }).notNull(),
  captionZh: text("caption_zh"),
  captionEn: text("caption_en"),

  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  featuredOnHome: boolean("featured_on_home").notNull().default(false),
  /** Lower sorts first among home featured; null if not featured */
  featuredRank: integer("featured_rank"),
});

/** Studio photos for a work. Lowest sort_order is the cover (home/works cards). */
export const workImages = pgTable("work_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

  workId: uuid("work_id")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),

  /** R2 key under studio/ — never a commissions/ client path */
  storageKey: text("storage_key").notNull(),
  contentType: varchar("content_type", { length: 120 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  /** At most one image site-wide should be true — drives the home full-bleed hero. */
  homeHero: boolean("home_hero").notNull().default(false),
});

export type CommissionRequest = typeof commissionRequests.$inferSelect;
export type NewCommissionRequest = typeof commissionRequests.$inferInsert;
export type CommissionFile = typeof commissionFiles.$inferSelect;
export type NewCommissionFile = typeof commissionFiles.$inferInsert;
export type Work = typeof works.$inferSelect;
export type NewWork = typeof works.$inferInsert;
export type WorkImage = typeof workImages.$inferSelect;
export type NewWorkImage = typeof workImages.$inferInsert;

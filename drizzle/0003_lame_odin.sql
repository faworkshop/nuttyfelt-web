CREATE TABLE "work_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"work_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"content_type" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "work_images" ADD CONSTRAINT "work_images_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "work_images" ("work_id", "storage_key", "content_type", "sort_order")
SELECT "id", "storage_key", coalesce("content_type", 'image/jpeg'), 0
FROM "works"
WHERE "storage_key" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "works" DROP COLUMN "storage_key";--> statement-breakpoint
ALTER TABLE "works" DROP COLUMN "content_type";
CREATE TABLE "works" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title_zh" varchar(200) NOT NULL,
	"title_en" varchar(200) NOT NULL,
	"caption_zh" text,
	"caption_en" text,
	"storage_key" text,
	"content_type" varchar(120),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"featured_on_home" boolean DEFAULT false NOT NULL,
	"featured_rank" integer
);

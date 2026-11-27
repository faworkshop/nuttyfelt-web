CREATE TYPE "public"."coat_length" AS ENUM('short', 'long');--> statement-breakpoint
CREATE TYPE "public"."file_group" AS ENUM('basic', 'extra');--> statement-breakpoint
CREATE TYPE "public"."living_status" AS ENUM('with', 'passed', 'skip');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('zh-Hant', 'en');--> statement-breakpoint
CREATE TYPE "public"."location" AS ENUM('hk', 'other');--> statement-breakpoint
CREATE TYPE "public"."publicity" AS ENUM('tag', 'no-tag');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('received', 'failed');--> statement-breakpoint
CREATE TABLE "commission_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" uuid NOT NULL,
	"group" "file_group" NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" varchar(500) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"content_type" varchar(120) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locale" "locale" NOT NULL,
	"status" "request_status" DEFAULT 'received' NOT NULL,
	"failure_reason" text,
	"email" varchar(320) NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"instagram" varchar(200) NOT NULL,
	"whatsapp" varchar(100) NOT NULL,
	"location" "location" NOT NULL,
	"country" varchar(120),
	"cat_name" varchar(200) NOT NULL,
	"coat_length" "coat_length" NOT NULL,
	"features" text NOT NULL,
	"found_via" varchar(40),
	"sex_breed" varchar(200),
	"hope_date" varchar(200),
	"stories" text,
	"living_status" "living_status",
	"agreed_terms" boolean NOT NULL,
	"agreed_handmade" boolean NOT NULL,
	"publicity" "publicity" NOT NULL,
	"notify_email_sent_at" timestamp with time zone,
	"confirm_email_sent_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "commission_files" ADD CONSTRAINT "commission_files_request_id_commission_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."commission_requests"("id") ON DELETE cascade ON UPDATE no action;
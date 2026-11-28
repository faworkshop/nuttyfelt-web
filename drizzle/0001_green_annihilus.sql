ALTER TYPE "public"."request_status" ADD VALUE 'photos_reviewed';--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'scheduled';--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'deposit_paid';--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'in_progress';--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'balance_paid';--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'revisions';--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'handed_over';--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "photos_sufficient" boolean;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "photo_notes" text;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "scheduled_month" varchar(40);--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "deposit_paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "balance_paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "revision_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "handover_notes" text;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD COLUMN "admin_notes" text;
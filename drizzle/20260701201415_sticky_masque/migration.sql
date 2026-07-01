ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_pkey";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "new_id" DROP NOT NULL;
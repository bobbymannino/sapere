ALTER TABLE "workspaces" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "chk_workspaces_description_length" CHECK (char_length("description") <= 1000);
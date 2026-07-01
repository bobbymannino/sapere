CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"orderable_title" text GENERATED ALWAYS AS (regexp_replace(lower("documents"."title"), '[^a-z0-9]', '', 'g')) STORED,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_documents_title_length" CHECK (char_length("title") >= 3 and char_length("title") <= 64),
	CONSTRAINT "chk_documents_slug_length" CHECK (char_length("slug") >= 3 and char_length("slug") <= 32),
	CONSTRAINT "chk_documents_slug_valid" CHECK ("slug" ~ '^[a-z0-9_.-]+$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_workspace_slug_unique" ON "documents" ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "workspaces_workspace_created_at_idx" ON "documents" ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "workspaces_workspace_updated_at_idx" ON "documents" ("workspace_id","updated_at");--> statement-breakpoint
CREATE INDEX "workspaces_workspace_orderable_title_idx" ON "documents" ("workspace_id","orderable_title");--> statement-breakpoint
CREATE INDEX "workspaces_workspace_title_idx" ON "documents" ("workspace_id","title");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;
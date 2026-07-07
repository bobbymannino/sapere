CREATE TABLE "pinned_documents" (
	"document_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"pinned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pinned_workspaces" (
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"pinned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "pinned_at";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "pinned_at";--> statement-breakpoint
CREATE UNIQUE INDEX "pinned_documents_document_id_user_id_idx" ON "pinned_documents" ("document_id","user_id");--> statement-breakpoint
CREATE INDEX "pinned_documents_user_id_idx" ON "pinned_documents" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pinned_workspaces_workspace_id_user_id_idx" ON "pinned_workspaces" ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "pinned_workspaces_user_id_idx" ON "pinned_workspaces" ("user_id");--> statement-breakpoint
ALTER TABLE "pinned_documents" ADD CONSTRAINT "pinned_documents_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pinned_documents" ADD CONSTRAINT "pinned_documents_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pinned_workspaces" ADD CONSTRAINT "pinned_workspaces_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pinned_workspaces" ADD CONSTRAINT "pinned_workspaces_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"action" text NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"actor_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"workspace_id" uuid,
	"document_id" uuid,
	"user_id" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_audit_logs_action_length" CHECK (char_length("action") >= 3 and char_length("action") <= 64),
	CONSTRAINT "chk_audit_logs_status_valid" CHECK ("status" in ('success', 'failure')),
	CONSTRAINT "chk_audit_logs_actor_type_valid" CHECK ("actor_type" in ('user', 'admin'))
);
--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;
CREATE TABLE "workspaces" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workspaces_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"ownerId" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_workspaces_slug_length" CHECK (length("slug") > 0 and length("slug") <= 32),
	CONSTRAINT "chk_workspaces_slug_valid" CHECK ("slug" ~ '^[a-z0-9_.]$'),
	CONSTRAINT "chk_workspaces_title_length" CHECK (length("title") > 0 and length("title") <= 64)
);
--> statement-breakpoint
CREATE INDEX "workspaces_owner_created_at_idx" ON "workspaces" ("ownerId","created_at");--> statement-breakpoint
CREATE INDEX "workspaces_owner_updated_at_idx" ON "workspaces" ("ownerId","updated_at");--> statement-breakpoint
CREATE INDEX "workspaces_owner_title_idx" ON "workspaces" ("ownerId","title");--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_ownerId_users_id_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id");
-- better-auth 1.7 scopes account identity by issuer.
-- Add nullable first so existing rows can be backfilled, then enforce NOT NULL.
ALTER TABLE "accounts" ADD COLUMN "issuer" text;--> statement-breakpoint
-- Mirrors createLocalAccountIssuer(providerId) from @better-auth/core.
UPDATE "accounts" SET "issuer" = 'local:' || "provider_id" WHERE "issuer" IS NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_issuer_account_id_unique" ON "accounts" ("issuer","account_id");

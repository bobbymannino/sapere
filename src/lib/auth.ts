import { getRequestEvent } from "$app/server";
import { db } from "$db";
import { recordAuditEvent } from "$db/audit";
import * as schema from "$db/schema";
import type { AuditAction } from "$lib/audit-actions";
import { redisSecondaryStorage } from "$lib/auth-redis";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { lastLoginMethod, username } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";

/** Auth endpoints that establish a new session, keyed by the method used to authenticate. */
const AUTHENTICATION_ACTIONS: Record<string, AuditAction> = {
  "/sign-up/email": "user.signup.email",
  "/sign-in/email": "user.login.email",
  "/sign-in/username": "user.login.username",
  "/passkey/verify-authentication": "user.login.passkey",
};

/** Passkey endpoints that change the user's registered credentials. */
const PASSKEY_ACTIONS: Record<string, AuditAction> = {
  "/passkey/verify-registration": "user.passkey.added",
  "/passkey/delete-passkey": "user.passkey.removed",
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    transaction: true,
    usePlural: true,
    schema,
  }),
  secondaryStorage: redisSecondaryStorage,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    passkey(),
    lastLoginMethod({
      storeInDatabase: true,
      customResolveMethod: (ctx) => {
        if (ctx.path === "/sign-in/username") return "username";

        return null;
      },
    }),
    sveltekitCookies(getRequestEvent),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email" && ctx.path !== "/update-user") return;

      if (!ctx.body.username) {
        throw new APIError("BAD_REQUEST", {
          message: "Username is required",
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const action = AUTHENTICATION_ACTIONS[ctx.path];
      if (action) {
        // Only set once the endpoint actually authenticated the user; a failed attempt leaves it null.
        const user = ctx.context.newSession?.user;
        if (!user) return;

        await recordAuditEvent({ action, actorId: user.id, userId: user.id });
        return;
      }

      const passkeyAction = PASSKEY_ACTIONS[ctx.path];
      if (!passkeyAction) return;

      // These run on an existing session, and a rejected request returns an APIError instead of a result.
      const userId = ctx.context.session?.user.id;
      if (!userId || ctx.context.returned instanceof APIError) return;

      await recordAuditEvent({
        action: passkeyAction,
        actorId: userId,
        userId,
        metadata: { passkeyId: ctx.body?.id ?? null, name: ctx.body?.name ?? null },
      });
    }),
  },
});

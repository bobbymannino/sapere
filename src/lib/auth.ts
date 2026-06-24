import { getRequestEvent } from "$app/server";
import { db } from "$db";
import * as schema from "$db/schema";
import { redisSecondaryStorage } from "$lib/auth-redis";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { lastLoginMethod, username } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    transaction: true,
    usePlural: true,
    schema,
  }),
  // secondaryStorage: redisSecondaryStorage,
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
  },
});

import { getRequestEvent } from "$app/server";
import { db } from "$db";
import * as schema from "$db/schema";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    transaction: true,
    usePlural: true,
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [passkey(), sveltekitCookies(getRequestEvent)],
});

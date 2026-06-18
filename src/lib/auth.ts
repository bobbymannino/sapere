import { getRequestEvent } from "$app/server";
import { db } from "$db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    transaction: true,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [sveltekitCookies(getRequestEvent)],
});

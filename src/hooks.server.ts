import { building } from "$app/env";
import { auth } from "$lib/auth";
import type { Handle } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.session = null;

  const session = await auth.api.getSession({ headers: event.request.headers });
  if (session) event.locals.session = session;

  return svelteKitHandler({ event, resolve, auth, building });
};

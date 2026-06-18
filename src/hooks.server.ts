import { building } from "$app/env";
import { auth } from "$lib/auth";
import type { Handle } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = null;
  event.locals.session = null;

  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

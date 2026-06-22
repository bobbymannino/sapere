import { building } from "$app/env";
import { auth } from "$lib/auth";
import type { Handle } from "@sveltejs/kit";
import { isAuthPath, svelteKitHandler } from "better-auth/svelte-kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.session = null;

  if (!building && !isAuthPath(event.url.toString(), auth.options)) {
    event.locals.session = await auth.api.getSession({
      headers: event.request.headers,
    });
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

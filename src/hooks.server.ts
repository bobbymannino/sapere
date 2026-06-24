import { building } from "$app/env";
import { auth } from "$lib/auth";
import type { Handle } from "@sveltejs/kit";
import { isAuthPath, svelteKitHandler } from "better-auth/svelte-kit";

type AuthSession = typeof auth.$Infer.Session | null;
type AppSession = NonNullable<App.Locals["session"]>;

function hasUsername(session: AuthSession): session is AppSession {
  return typeof session?.user.username === "string" && session.user.username.length > 0;
}

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.session = null;

  if (!building && !isAuthPath(event.url.toString(), auth.options)) {
    const session = await auth.api.getSession({
      headers: event.request.headers,
    });
    event.locals.session = hasUsername(session) ? session : null;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

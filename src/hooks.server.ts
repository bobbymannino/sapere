import { building } from "$app/env";
import { auth } from "$lib/auth";
import * as Sentry from "@sentry/sveltekit";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { isAuthPath, svelteKitHandler } from "better-auth/svelte-kit";

type AuthSession = typeof auth.$Infer.Session | null;
type AppSession = NonNullable<App.Locals["session"]>;

function hasUsername(session: AuthSession): session is AppSession {
  return typeof session?.user.username === "string" && session.user.username.length > 0;
}

const authHandle: Handle = async ({ event, resolve }) => {
  event.locals.session = null;

  if (!building && !isAuthPath(event.url.toString(), auth.options)) {
    const session = await auth.api.getSession({
      headers: event.request.headers,
    });
    event.locals.session = hasUsername(session) ? session : null;
  }

  Sentry.setUser(event.locals.session ? { id: event.locals.session.user.id } : null);

  return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = sequence(Sentry.sentryHandle(), authHandle);
export const handleError = Sentry.handleErrorWithSentry();

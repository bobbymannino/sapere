import { UnauthorizedApiError } from "$lib/api/errors";
import { me } from "$lib/server/api";
import { getSessionTokenFromCookies } from "$lib/server/session";

export const handle = async ({ event, resolve }) => {
  event.locals.user = null;
  event.locals.token = getSessionTokenFromCookies();

  if (event.locals.token) {
    const user = await me();
    user.match(
      (user) => (event.locals.user = user),
      (err) => {
        if (err instanceof UnauthorizedApiError) event.locals.token = null;
      },
    );
  }

  return resolve(event);
};

import { me } from "$lib/server/api";
import { getSessionTokenFromCookies } from "$lib/server/session";

export const handle = async ({ event, resolve }) => {
  event.locals.user = null;
  event.locals.token = getSessionTokenFromCookies();

  if (event.locals.token) {
    const user = await me();
    user.match(
      (user) => (event.locals.user = user),
      () => (event.locals.token = null),
    );
  }

  return resolve(event);
};

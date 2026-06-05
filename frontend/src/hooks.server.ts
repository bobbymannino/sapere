import { getSessionTokenFromCookies } from "$lib/server/session";

export const handle = async ({ event, resolve }) => {
  event.locals.token = getSessionTokenFromCookies();

  return resolve(event);
};

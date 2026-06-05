import { dev } from "$app/environment";
import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";

const COOKIE_SESSION = "session";

export function getSessionTokenFromCookies() {
  return getRequestEvent().cookies.get(COOKIE_SESSION) || null;
}

export function setSessionTokenInCookies(token: string, expiresAt: Date) {
  getRequestEvent().cookies.set(COOKIE_SESSION, token, {
    expires: expiresAt,
    path: "/",
    sameSite: "lax",
    httpOnly: !dev,
    secure: true,
  });
}

export function requireGuest() {
  const { locals } = getRequestEvent();
  if (locals.user) redirect(303, "/");
}

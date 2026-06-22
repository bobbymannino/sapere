import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";

export function requireUser() {
  const { locals, url } = getRequestEvent();
  if (!locals.session) {
    url.searchParams.append("redirect", url.pathname);
    redirect(303, `/login?${url.searchParams.toString()}`);
  }
  return locals.session;
}

export function requireAnon() {
  const { locals, url } = getRequestEvent();
  if (locals.session) redirect(303, `/?${url.searchParams.toString()}`);
}

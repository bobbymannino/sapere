import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
  const session = requireUser();
  return { session };
};

function requireUser() {
  const { locals, url } = getRequestEvent();
  if (!locals.session) {
    url.searchParams.append("redirect", url.pathname);
    redirect(303, `/login?${url.searchParams.toString()}`);
  }
  return locals.session;
}

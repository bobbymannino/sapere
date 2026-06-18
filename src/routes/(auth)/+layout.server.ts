import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
  requireAnon();
};

function requireAnon() {
  const { locals, url } = getRequestEvent();
  if (locals.session) redirect(303, `/?${url.searchParams.toString()}`);
}

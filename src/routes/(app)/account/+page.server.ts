import { requireUser } from "$lib/server/auth-utils";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  requireUser();
  return { breadcrumbs: [{ label: "Account" }] };
};

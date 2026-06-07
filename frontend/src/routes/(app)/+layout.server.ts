import { requireUser } from "$lib/server/session";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
  const user = requireUser();
  return { user };
};

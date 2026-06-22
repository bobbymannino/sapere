import { requireUser } from "$lib/server/auth-utils";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
  const session = requireUser();
  return { session };
};

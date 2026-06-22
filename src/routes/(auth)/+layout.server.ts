import { requireAnon } from "$lib/server/auth-utils";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
  requireAnon();
};

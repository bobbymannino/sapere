import { resolve } from "$app/paths";
import { listActorsLogs } from "$db/audit";
import { requireUser } from "$lib/server/auth-utils";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  const { user } = requireUser();
  const logs = listActorsLogs({ actorId: user.id });
  return {
    logs,
    breadcrumbs: [{ label: "Account", href: resolve("/(app)/account") }, { label: "Audit" }],
  };
};

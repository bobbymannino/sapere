import { resolve } from "$app/paths";
import { listActorsLogs } from "$db/audit";
import { requireUser } from "$lib/server/auth-utils";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
  const { user } = requireUser();
  const metadata = url.searchParams.get("metadata")?.trim() || undefined;
  const logs = listActorsLogs({ actorId: user.id, metadata });
  return {
    metadata,
    logs,
    breadcrumbs: [{ label: "Account", href: resolve("/(app)/account") }, { label: "Audit" }],
  };
};

import { listWorkspaces } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const { user } = requireUser();

  const workspaces = await listWorkspaces({ ownerId: user.id, orderBy: url.searchParams.get("sort") });
  return { workspaces };
};

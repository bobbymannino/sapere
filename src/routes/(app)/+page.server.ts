import { listWorkspaces } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const { user } = requireUser();

  const workspaces = await listWorkspaces({
    ownerId: user.id,
    sortBy: url.searchParams.get("sortBy"),
    sortDir: url.searchParams.get("sortDir"),
    page: url.searchParams.get("page"),
    perPage: url.searchParams.get("perPage"),
  });
  return { workspaces };
};

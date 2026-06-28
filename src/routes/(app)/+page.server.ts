import { listWorkspaces } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const { user } = requireUser();

  const sortBy = url.searchParams.get("sortBy") ?? undefined;
  const sortDir = url.searchParams.get("sortDir") ?? undefined;
  const workspaces = await listWorkspaces({
    ownerId: user.id,
    sortBy,
    sortDir,
    page: url.searchParams.get("page"),
    perPage: url.searchParams.get("perPage"),
  });
  return {
    sortBy,
    sortDir,
    workspaces,
    breadcrumbs: [{ label: "Workspaces" }],
  };
};

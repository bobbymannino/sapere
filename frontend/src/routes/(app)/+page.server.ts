import { api } from "$lib/server/api";
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  await parent();
  const workspaces = await api.workspaces.list();
  if (workspaces.isErr()) error(workspaces.error.status, workspaces.error.message);
  return { workspaces: workspaces.value };
};

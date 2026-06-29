import { listWorkspaceCommands } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  const session = requireUser();
  const commandWorkspaces = await listWorkspaceCommands({ ownerId: session.user.id });

  return { session, commandWorkspaces };
};

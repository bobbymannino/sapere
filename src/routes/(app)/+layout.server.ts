import { listRecentDocuments } from "$db/documents";
import { listWorkspaceCommands, listRecentWorkspaces, listRecentPinnedThings } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  const session = requireUser();
  const commandWorkspaces = listWorkspaceCommands({ ownerId: session.user.id });
  const recentWorkspaces = listRecentWorkspaces({ ownerId: session.user.id });
  const recentDocuments = listRecentDocuments({ ownerId: session.user.id });
  const recentPinnedThings = listRecentPinnedThings({ userId: session.user.id });

  return { session, commandWorkspaces, recentWorkspaces, recentDocuments, recentPinnedThings };
};

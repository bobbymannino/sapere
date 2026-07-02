import { query } from "$app/server";
import { listRecentDocuments } from "$db/documents";
import { WorkspaceIdSchema } from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";

export const getRecentWorkspaceDocuments = query(WorkspaceIdSchema, (workspaceId) => {
  const { user } = requireUser();
  return listRecentDocuments({ ownerId: user.id, workspaceId });
});

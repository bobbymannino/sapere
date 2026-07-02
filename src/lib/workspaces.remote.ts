import { command } from "$app/server";
import { deleteWorkspace } from "$db/workspaces";
import { WorkspaceIdSchema } from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";

export const deleteWorkspaceCommand = command(WorkspaceIdSchema, async (workspaceId) => {
  const { user } = requireUser();
  const workspace = await deleteWorkspace({ ownerId: user.id, workspaceId });
  if (!workspace) error(404, "Workspace not found");
});

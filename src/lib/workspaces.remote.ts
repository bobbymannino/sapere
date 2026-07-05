import { command } from "$app/server";
import { deleteWorkspace, setWorkspacePinned } from "$db/workspaces";
import { WorkspaceIdSchema } from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";

export const deleteWorkspaceCommand = command(WorkspaceIdSchema, async (workspaceId) => {
  const { user } = requireUser();
  const workspace = await deleteWorkspace({ ownerId: user.id, workspaceId });
  if (!workspace) error(404, "Workspace not found");
});

import * as v from "valibot";

const SetWorkspacePinnedSchema = v.object({
  workspaceId: WorkspaceIdSchema,
  pinned: v.boolean(),
});

export const setWorkspacePinnedCommand = command(SetWorkspacePinnedSchema, async ({ workspaceId, pinned }) => {
  const { user } = requireUser();
  const workspace = await setWorkspacePinned({
    ownerId: user.id,
    workspaceId,
    pinned,
  });
  if (!workspace) error(404, "Workspace not found");
  return workspace;
});

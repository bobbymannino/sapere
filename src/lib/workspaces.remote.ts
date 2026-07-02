import { command } from "$app/server";
import { deleteWorkspace } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";
import * as v from "valibot";

const UuidSchema = v.pipe(v.string(), v.uuid());

export const deleteWorkspaceCommand = command(UuidSchema, async (workspaceId) => {
  const { user } = requireUser();
  const workspace = await deleteWorkspace({ ownerId: user.id, workspaceId });
  if (!workspace) error(404, "Workspace not found");
});

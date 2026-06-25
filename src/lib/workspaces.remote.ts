import { command } from "$app/server";
import { deleteWorkspace } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";
import * as v from "valibot";

const PositiveIntegerSchema = v.pipe(v.number(), v.minValue(1, "Value must be 1 or more"));

export const deleteWorkspaceCommand = command(PositiveIntegerSchema, async (workspaceId) => {
  const { user } = requireUser();
  const workspace = await deleteWorkspace({ ownerId: user.id, workspaceId });
  if (!workspace) error(404, "Workspace not found");
});

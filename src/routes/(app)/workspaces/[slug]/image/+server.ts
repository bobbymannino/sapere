import { findWorkspaceBySlug } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { files } from "$lib/server/files";
import { error } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { user } = requireUser();
  const workspace = await findWorkspaceBySlug({ ownerId: user.id, slug: params.slug });

  if (!workspace?.image || !(await files.exists(workspace.image))) {
    error(404, "Workspace image not found");
  }

  const image = await files.download(workspace.image, { as: "stream" });

  return new Response(image.stream(), {
    headers: {
      "cache-control": "private, max-age=3600",
      "content-length": image.size.toString(),
      "content-type": image.type,
      ...(image.etag ? { etag: image.etag } : {}),
    },
  });
};

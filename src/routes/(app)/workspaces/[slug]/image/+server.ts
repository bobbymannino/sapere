import { findWorkspaceBySlug } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { files } from "$lib/server/files";
import { error as httpError } from "@sveltejs/kit";
import { FilesError, type StoredFile } from "files-sdk";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { user } = requireUser();
  const workspace = await findWorkspaceBySlug({ ownerId: user.id, slug: params.slug });
  const imageKey = workspace?.image;

  if (!imageKey) {
    httpError(404, "Workspace image not found");
  }

  let image: StoredFile;
  try {
    image = await files.download(imageKey);
  } catch (error) {
    if (error instanceof FilesError && error.code === "NotFound") {
      httpError(404, "Workspace image not found");
    }

    throw error;
  }

  return new Response(image.stream(), {
    headers: {
      "cache-control": "private, max-age=3600",
      "content-type": image.type,
      ...(image.etag ? { etag: image.etag } : {}),
    },
  });
};

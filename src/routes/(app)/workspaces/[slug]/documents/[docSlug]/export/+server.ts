import { findDocumentBySlug } from "$db/documents";
import { requireUser } from "$lib/server/auth-utils";
import { error as httpError } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { user } = requireUser();
  const document = await findDocumentBySlug({
    userId: user.id,
    workspaceSlug: params.slug,
    documentSlug: params.docSlug,
  });
  if (!document) httpError(404, "Document not found");

  // Slugs are already safe for a filename, so there is nothing to strip here.
  const filename = `${document.slug}.md`;

  return new Response(document.content, {
    headers: {
      "cache-control": "private, no-store",
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
};

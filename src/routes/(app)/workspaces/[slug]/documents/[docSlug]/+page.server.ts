import { resolve } from "$app/paths";
import { findDocumentBySlug } from "$db/documents";
import { findWorkspaceBySlug } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { user } = requireUser();

  const workspace = await findWorkspaceBySlug({
    ownerId: user.id,
    slug: params.slug,
  });
  if (!workspace) error(404, "Workspace not found");
  const document = await findDocumentBySlug({
    userId: user.id,
    workspaceSlug: params.slug,
    documentSlug: params.docSlug,
  });
  if (!document) error(404, "Document not found");

  return {
    workspace,
    document,
    breadcrumbs: [
      {
        label: "Workspaces",
        href: resolve("/(app)/workspaces"),
      },
      {
        label: workspace.title,
        href: resolve("/(app)/workspaces/[slug]", { slug: params.slug }),
      },
      {
        label: "Documents",
        href: resolve("/(app)/workspaces/[slug]/documents", { slug: params.slug }),
      },
      {
        label: document.title,
      },
    ],
  };
};

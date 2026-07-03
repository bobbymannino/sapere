import { resolve } from "$app/paths";
import { findDocumentBySlug } from "$db/documents";
import { error } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { workspace, user, commands } = await parent();
  const document = await findDocumentBySlug({
    userId: user.id,
    workspaceSlug: params.slug,
    documentSlug: params.docSlug,
  });
  if (!document) error(404, "Document not found");

  return {
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

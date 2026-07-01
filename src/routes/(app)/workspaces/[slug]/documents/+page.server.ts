import { resolve } from "$app/paths";
import { findWorkspaceBySlug } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { user } = requireUser();

  const workspace = await findWorkspaceBySlug({ ownerId: user.id, slug: params.slug });
  if (!workspace) error(404, "Workspace not found");
  return {
    workspace,
    breadcrumbs: [
      { label: "Workspaces", href: resolve("/(app)/workspaces") },
      { label: workspace.title, href: resolve("/(app)/workspaces/[slug]", { slug: workspace.slug }) },
      { label: "Documents" },
    ],
  };
};

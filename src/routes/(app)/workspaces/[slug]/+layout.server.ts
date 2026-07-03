import { resolve } from "$app/paths";
import { findWorkspaceBySlug } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
  const { user } = requireUser();

  const workspace = await findWorkspaceBySlug({ ownerId: user.id, slug: params.slug });
  if (!workspace) error(404, "Workspace not found");

  return {
    commands: [
      {
        group: workspace.title,
        id: `${params.slug}-new-document`,
        label: "New Document",
        icon: "new",
        href: resolve("/(app)/workspaces/[slug]/documents/new", { slug: params.slug }),
      },
      {
        group: workspace.title,
        id: `${params.slug}-edit`,
        label: "Edit Workspace",
        icon: "edit",
        href: resolve("/(app)/workspaces/[slug]/edit", { slug: params.slug }),
      },
    ],
  };
};

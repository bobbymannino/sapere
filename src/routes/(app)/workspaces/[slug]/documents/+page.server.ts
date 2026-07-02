import { resolve } from "$app/paths";
import { listDocuments } from "$db/documents";
import { findWorkspaceBySlug } from "$db/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url }) => {
  const { user } = requireUser();

  const workspace = await findWorkspaceBySlug({ ownerId: user.id, slug: params.slug });
  if (!workspace) error(404, "Workspace not found");

  const sortBy = url.searchParams.get("sortBy") ?? undefined;
  const sortDir = url.searchParams.get("sortDir") ?? undefined;
  const documents = await listDocuments({
    workspaceId: workspace.id,
    sortBy,
    sortDir,
    page: url.searchParams.get("page"),
    perPage: url.searchParams.get("perPage"),
  });

  return {
    workspace,
    sortBy,
    sortDir,
    documents,
    breadcrumbs: [
      { label: "Workspaces", href: resolve("/(app)/workspaces") },
      { label: workspace.title, href: resolve("/(app)/workspaces/[slug]", { slug: workspace.slug }) },
      { label: "Documents" },
    ],
  };
};

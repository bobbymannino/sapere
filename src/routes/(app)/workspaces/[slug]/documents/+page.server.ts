import { resolve } from "$app/paths";
import { listDocuments } from "$db/documents";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent, url }) => {
  const { workspace } = await parent();

  const sortBy = url.searchParams.get("sortBy") ?? undefined;
  const sortDir = url.searchParams.get("sortDir") ?? undefined;
  const search = url.searchParams.get("search")?.trim() || undefined;
  const documents = await listDocuments({
    workspaceId: workspace.id,
    sortBy,
    sortDir,
    search,
    page: url.searchParams.get("page"),
    perPage: url.searchParams.get("perPage"),
  });

  return {
    sortBy,
    sortDir,
    search,
    documents,
    breadcrumbs: [
      { label: "Workspaces", href: resolve("/(app)/workspaces") },
      { label: workspace.title, href: resolve("/(app)/workspaces/[slug]", { slug: workspace.slug }) },
      { label: "Documents" },
    ],
  };
};

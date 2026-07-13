import { resolve } from "$app/paths";
import { createDocument, DocumentSlugUsedError } from "$db/documents";
import { findWorkspaceBySlug } from "$db/workspaces";
import { DocumentSlugSchema, DocumentTitleSchema } from "$lib/schemas/documents";
import { requireUser } from "$lib/server/auth-utils";
import { error, fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";

import type { Actions, PageServerLoad } from "./$types";

async function loadWorkspace(ownerId: string, slug: string) {
  const workspace = await findWorkspaceBySlug({ ownerId, slug });
  if (!workspace) error(404, "Workspace not found");
  return workspace;
}

export const load: PageServerLoad = async ({ parent }) => {
  const { workspace } = await parent();

  return {
    breadcrumbs: [
      { label: "Workspaces", href: resolve("/(app)/workspaces") },
      { label: workspace.title, href: resolve("/(app)/workspaces/[slug]", { slug: workspace.slug }) },
      { label: "Documents", href: resolve("/(app)/workspaces/[slug]/documents", { slug: workspace.slug }) },
      { label: "New" },
    ],
  };
};

const Schema = v.object({
  title: DocumentTitleSchema,
  slug: DocumentSlugSchema,
});

export const actions: Actions = {
  default: async ({ params, request }) => {
    const { user } = requireUser();
    const workspace = await loadWorkspace(user.id, params.slug);
    const formData = await request.formData();

    const parsedResult = v.safeParse(Schema, {
      title: formData.get("title"),
      slug: formData.get("slug"),
    });
    if (!parsedResult.success) return fail(400, { valiErrors: v.flatten(parsedResult.issues) });

    const { title, slug } = parsedResult.output;
    try {
      await createDocument({ userId: user.id, workspaceId: workspace.id, title, slug });
      redirect(303, resolve("/(app)/workspaces/[slug]/documents/[docSlug]", { slug: workspace.slug, docSlug: slug }));
    } catch (error) {
      if (error instanceof DocumentSlugUsedError) {
        return fail(400, { valiErrors: { nested: { slug: ["Slug is already taken"] } } });
      }
      throw error;
    }
  },
};

import { resolve } from "$app/paths";
import { DocumentSlugUsedError, findDocumentBySlug, updateDocument } from "$db/documents";
import { DocumentSlugSchema, DocumentTitleSchema } from "$lib/schemas/documents";
import { requireUser } from "$lib/server/auth-utils";
import { error, fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";

import type { Actions, PageServerLoad } from "./$types";

async function loadDocument(userId: string, workspaceSlug: string, documentSlug: string) {
  const document = await findDocumentBySlug({ userId, workspaceSlug, documentSlug });
  if (!document) error(404, "Document not found");
  return document;
}

export const load: PageServerLoad = async ({ parent, params }) => {
  const { user, workspace } = await parent();
  const document = await loadDocument(user.id, params.slug, params.docSlug);

  return {
    document,
    breadcrumbs: [
      { label: "Workspaces", href: resolve("/(app)/workspaces") },
      { label: workspace.title, href: resolve("/(app)/workspaces/[slug]", { slug: workspace.slug }) },
      { label: "Documents", href: resolve("/(app)/workspaces/[slug]/documents", { slug: workspace.slug }) },
      {
        label: document.title,
        href: resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
          slug: workspace.slug,
          docSlug: document.slug,
        }),
      },
      { label: "Edit" },
    ],
  };
};

const MetadataSchema = v.object({
  title: DocumentTitleSchema,
  slug: DocumentSlugSchema,
});

export const actions: Actions = {
  update: async ({ params, request }) => {
    const { user } = requireUser();
    const formData = await request.formData();

    const parsedResult = v.safeParse(MetadataSchema, {
      title: formData.get("title"),
      slug: formData.get("slug"),
    });
    if (!parsedResult.success) return fail(400, { valiErrors: v.flatten(parsedResult.issues) });

    const { title, slug } = parsedResult.output;
    try {
      const document = await updateDocument({
        userId: user.id,
        workspaceSlug: params.slug,
        currentDocumentSlug: params.docSlug,
        title,
        slug,
      });
      if (!document) error(404, "Document not found");
      redirect(
        303,
        resolve("/(app)/workspaces/[slug]/documents/[docSlug]", { slug: params.slug, docSlug: document.slug }),
      );
    } catch (error) {
      if (error instanceof DocumentSlugUsedError) {
        return fail(400, { valiErrors: { nested: { slug: ["Slug is already taken"] } } });
      }
      throw error;
    }
  },
};

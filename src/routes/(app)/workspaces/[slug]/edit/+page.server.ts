import { resolve } from "$app/paths";
import { findWorkspaceBySlug, SlugUsedError, updateWorkspace } from "$db/workspaces";
import {
  WorkspaceDescriptionSchema,
  WorkspaceImageSchema,
  WorkspaceRemoveImageSchema,
  WorkspaceSlugSchema,
  WorkspaceTitleSchema,
} from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { isBodySizeLimitError } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { user } = requireUser();

  const workspace = await findWorkspaceBySlug({ ownerId: user.id, slug: params.slug });
  if (!workspace) error(404, "Workspace not found");
  return {
    workspace,
    breadcrumbs: [
      { label: "Workspaces", href: "/workspaces" },
      { label: workspace.title, href: `/workspaces/${workspace.slug}` },
      { label: "Edit" },
    ],
  };
};

const Schema = v.object({
  title: WorkspaceTitleSchema,
  slug: WorkspaceSlugSchema,
  description: WorkspaceDescriptionSchema,
  image: WorkspaceImageSchema,
  removeImage: WorkspaceRemoveImageSchema,
});

export const actions: Actions = {
  default: async ({ params, request }) => {
    const { user } = requireUser();

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      if (isBodySizeLimitError(error)) {
        return fail(400, {
          valiErrors: { nested: { image: ["Form reached max body size, please upload a smaller image"] } },
        });
      }
      throw error;
    }

    const parsedResult = v.safeParse(Schema, {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      image: formData.get("image"),
      removeImage: formData.get("removeImage") ?? "false",
    });
    if (!parsedResult.success) return fail(400, { valiErrors: v.flatten(parsedResult.issues) });

    const { title, slug, description, image, removeImage } = parsedResult.output;
    try {
      const workspace = await updateWorkspace({
        ownerId: user.id,
        currentSlug: params.slug,
        title,
        slug,
        description,
        image,
        removeImage,
      });
      if (!workspace) error(404, "Workspace not found");
      redirect(303, resolve("/(app)/workspaces/[slug]", { slug: workspace.slug }));
    } catch (error) {
      if (error instanceof SlugUsedError) {
        return fail(400, { valiErrors: { nested: { slug: ["Slug is already taken"] } } });
      }
      throw error;
    }
  },
};

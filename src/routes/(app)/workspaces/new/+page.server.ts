import { resolve } from "$app/paths";
import { createWorkspace, SlugUsedError } from "$db/workspaces";
import {
  WorkspaceDescriptionSchema,
  WorkspaceImageSchema,
  WorkspaceSlugSchema,
  WorkspaceTitleSchema,
} from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";

import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";

export const load: PageServerLoad = () => {
  requireUser();
  return { breadcrumbs: [{ label: "Workspaces", href: "/workspaces" }, { label: "New" }] };
};

const Schema = v.object({
  title: WorkspaceTitleSchema,
  slug: WorkspaceSlugSchema,
  description: WorkspaceDescriptionSchema,
  image: WorkspaceImageSchema,
});

export const actions: Actions = {
  default: async ({ request }) => {
    const { user } = requireUser();

    const formData = await request.formData();
    const parsedResult = v.safeParse(Schema, {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      image: formData.get("image"),
    });
    if (!parsedResult.success) return fail(400, { valiErrors: v.flatten(parsedResult.issues) });

    const { title, slug, description, image } = parsedResult.output;
    try {
      await createWorkspace({ slug, title, description, image, ownerId: user.id });
      redirect(303, resolve("/(app)/workspaces/[slug]", { slug }));
    } catch (error) {
      if (error instanceof SlugUsedError) {
        return fail(400, { valiErrors: { nested: { slug: ["Slug is already taken"] } } });
      }
      throw error;
    }
  },
};

import { validate } from "$lib/schemas";
import { api } from "$lib/server/api/index.js";
import { requireUser } from "$lib/server/session";
import { redirect } from "@sveltejs/kit";
import * as v from "valibot";

export const load: PageServerLoad = () => {
  requireUser();
};

import type { Actions, PageServerLoad } from "./$types";

const Schema = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  slug: v.string(),
});

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export const actions: Actions = {
  default: async ({ request }) => {
    requireUser();

    const formData = await request.formData();
    const form = {
      title: formValue(formData, "title"),
      description: formValue(formData, "description"),
      slug: formValue(formData, "slug"),
    };
    const result = validate(Schema, form);

    if (result.isErr())
      return {
        ...form,
        error: result.error,
      };

    const { title, description, slug } = result.value;
    const workspace = await api.workspaces.create({ title, description, slug });
    if (workspace.isErr()) return { ...form, error: workspace.error };

    redirect(303, `/workspaces/${workspace.value.slug}-${workspace.value.id}`);
  },
};

import { validate } from "$lib/schemas";
import { login } from "$lib/server/api/index.js";
import { requireGuest, setSessionTokenInCookies } from "$lib/server/session.js";
import { redirect } from "@sveltejs/kit";
import * as v from "valibot";

import type { Actions } from "./$types";

export const load = () => {
  requireGuest();
};

const Schema = v.object({
  email: v.string(),
  password: v.string(),
});

export const actions: Actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData();
    const result = validate(Schema, {
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (result.isErr()) return { email: formData.get("email"), error: result.error };
    const { email, password } = result.value;
    const user = await login(email.includes("@") ? { email, password } : { username: email, password });
    if (user.isErr()) return { email, error: user.error };
    setSessionTokenInCookies(user.value.token, user.value.sessionExpiresAt);
    redirect(303, url.searchParams.get("redirectTo") ?? "/");
  },
};

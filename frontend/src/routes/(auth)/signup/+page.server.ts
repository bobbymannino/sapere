import { validate } from "$lib/schemas";
import { api } from "$lib/server/api/index.js";
import { requireGuest, setSessionTokenInCookies } from "$lib/server/session.js";
import { redirect } from "@sveltejs/kit";
import * as v from "valibot";

import type { Actions } from "./$types";

export const load = () => {
  requireGuest();
};

const Schema = v.object({
  email: v.string(),
  username: v.string(),
  password: v.string(),
  confirmPassword: v.string(),
});

export const actions: Actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData();
    const result = validate(Schema, {
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (result.isErr())
      return {
        email: formData.get("email"),
        username: formData.get("username"),
        error: result.error,
      };
    const { email, username, password, confirmPassword } = result.value;
    const user = await api.auth.signup({ email, username, password, confirmPassword });
    if (user.isErr()) return { email, username, error: user.error };
    setSessionTokenInCookies(user.value.token, user.value.sessionExpiresAt);
    redirect(303, url.searchParams.get("redirectTo") ?? "/");
  },
};

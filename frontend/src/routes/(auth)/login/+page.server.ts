import { login } from "$lib/server/api/index.js";
import { setSessionTokenInCookies } from "$lib/server/session.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  await parent();
};

export const actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData();

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const user = await login(
      email.includes("@") ? { email, password } : { username: email, password },
    );
    if (user.isErr()) {
      return { success: false, error: JSON.stringify(user.error) };
    }
    setSessionTokenInCookies(user.value.token, user.value.sessionExpiresAt);
    redirect(303, url.searchParams.get("redirectTo") ?? "/");
  },
};

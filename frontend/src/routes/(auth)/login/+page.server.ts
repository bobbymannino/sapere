import { login } from "$lib/server/api/index.js";
import { requireGuest, setSessionTokenInCookies } from "$lib/server/session.js";
import { redirect } from "@sveltejs/kit";

export const load = () => {
  requireGuest();
};

export const actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const user = await login(
      email.includes("@") ? { email, password } : { username: email, password },
    );
    if (user.isErr()) return { email, error: user.error };
    setSessionTokenInCookies(user.value.token, user.value.sessionExpiresAt);
    redirect(303, url.searchParams.get("redirectTo") ?? "/");
  },
};

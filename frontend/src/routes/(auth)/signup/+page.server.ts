import { signup } from "$lib/server/api/index.js";
import { requireGuest, setSessionTokenInCookies } from "$lib/server/session.js";
import { redirect } from "@sveltejs/kit";

export const load = () => {
  requireGuest();
};

export const actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "");
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const user = await signup({ email, username, password, confirmPassword });
    if (user.isErr()) return { email, username, error: user.error };
    setSessionTokenInCookies(user.value.token, user.value.sessionExpiresAt);
    redirect(303, url.searchParams.get("redirectTo") ?? "/");
  },
};

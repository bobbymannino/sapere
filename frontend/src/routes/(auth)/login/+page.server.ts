import { login } from "$lib/server/api/index.js";
import { setSessionTokenInCookies } from "$lib/server/session.js";

export const actions = {
  default: async ({ request }) => {
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
    return { success: true, user: user.value };
  },
};

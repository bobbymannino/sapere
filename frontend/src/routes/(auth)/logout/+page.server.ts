import { api } from "$lib/server/api";
import { deleteSessionTokenInCookies, requireUser } from "$lib/server/session";
import { redirect } from "@sveltejs/kit";

export const load = async () => {
  requireUser();
  await api.auth.logout();
  deleteSessionTokenInCookies();
  redirect(303, "/login");
};

import { logout } from "$lib/server/api";
import { deleteSessionTokenInCookies, requireUser } from "$lib/server/session";
import { redirect } from "@sveltejs/kit";

export const load = async () => {
  requireUser();
  await logout();
  deleteSessionTokenInCookies();
  redirect(303, "/login");
};

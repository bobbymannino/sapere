import { deleteSessionTokenInCookies, requireUser } from "$lib/server/session";
import { redirect } from "@sveltejs/kit";

export const load = () => {
  requireUser();
  deleteSessionTokenInCookies();
  redirect(303, "/login");
};

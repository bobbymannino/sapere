import { requireGuest } from "$lib/server/session";

export const load = () => {
  requireGuest();
  return { user: null };
};

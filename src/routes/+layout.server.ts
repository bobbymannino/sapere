import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, cookies }) => {
  const sidebarOpen = (cookies.get("sidebar_state") ?? "true") === "true";

  return { session: locals.session, sidebarOpen };
};

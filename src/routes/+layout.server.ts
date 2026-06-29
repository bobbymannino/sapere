import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, cookies, request }) => {
  const sidebarOpen = (cookies.get("sidebar_state") ?? "true") === "true";
  const userAgent = request.headers.get("user-agent") || "";
  const isMac = /Macintosh|Mac OS X/i.test(userAgent);

  return { session: locals.session, sidebarOpen, isMac };
};

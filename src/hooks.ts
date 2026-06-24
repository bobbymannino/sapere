import type { Reroute } from "@sveltejs/kit";

export const reroute: Reroute = ({ url }) => {
  // if (/^\/workspaces\/?$/.test(url.pathname)) return "/";
};

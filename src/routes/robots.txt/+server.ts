import { dev } from "$app/env";
import { PUBLIC_URL } from "$app/env/public";

import type { RequestHandler } from "./$types";

const disallowedPaths = ["/account", "/login", "/signup", "/workspaces"];

export const GET: RequestHandler = () => {
  const sitemapUrl = new URL("/sitemap.xml", PUBLIC_URL).toString();
  const body = [
    "User-agent: *",
    ...disallowedPaths.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "cache-control": dev ? "no-store" : "public, max-age=3600",
      "content-type": "text/plain; charset=utf-8",
    },
  });
};

import { PUBLIC_URL } from "$app/env/public";
import { dev } from "$app/environment";
import { resolve } from "$app/paths";

import type { RequestHandler } from "./$types";

type SitemapEntry = {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: Date | string;
  priority?: number;
};

// Authenticated routes and auth screens are omitted because they require a session or set noindex.
const indexableRoutes: SitemapEntry[] = [
  {
    path: resolve("/(auth)/signup"),
    lastmod: new Date(),
    priority: 0.2,
  },
  {
    path: resolve("/(auth)/login"),
    lastmod: new Date(),
    priority: 0.2,
  },
];

export const GET: RequestHandler = () => {
  const body = renderSitemap(
    indexableRoutes.map((entry) => ({
      ...entry,
      loc: new URL(entry.path, PUBLIC_URL).toString(),
    })),
  );

  return new Response(body, {
    headers: {
      "cache-control": dev ? "no-store" : "public, max-age=3600",
      "content-type": "application/xml; charset=utf-8",
    },
  });
};

function renderSitemap(entries: Array<SitemapEntry & { loc: string }>) {
  const urls = entries.map(renderUrl).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>\n`;
}

function renderUrl(entry: SitemapEntry & { loc: string }) {
  const lastmod = formatDate(entry.lastmod);
  const priority = formatPriority(entry.priority);

  return [
    "\n  <url>",
    `\n    <loc>${escapeXml(entry.loc)}</loc>`,
    lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "",
    entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : "",
    priority ? `\n    <priority>${priority}</priority>` : "",
    "\n  </url>",
  ].join("");
}

function formatDate(value: Date | string | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function formatPriority(value: number | undefined) {
  if (value === undefined) return null;
  const priority = Math.min(Math.max(value, 0), 1);
  return priority.toFixed(1);
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

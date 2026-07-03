import { resolve } from "$app/paths";
import { findDocumentBySlug } from "$db/documents";
import type { CommandBarCommand } from "$lib/command-bar";
import { error } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { workspace, user, commands } = await parent();
  const document = await findDocumentBySlug({
    userId: user.id,
    workspaceSlug: params.slug,
    documentSlug: params.docSlug,
  });
  if (!document) error(404, "Document not found");

  const pinCommand = {
    group: document.title,
    action: {
      type: "set-document-pinned",
      pinned: !document.pinnedAt,
      documentSlug: params.docSlug,
      workspaceSlug: params.slug,
    },
    icon: document.pinnedAt ? "unpin" : "pin",
    id: `${document.slug}-${document.pinnedAt ? "unpin" : "pin"}`,
    label: document.pinnedAt ? "Unpin Document" : "Pin Document",
  } satisfies CommandBarCommand;

  return {
    document,
    commands: [pinCommand, ...commands],
    breadcrumbs: [
      {
        label: "Workspaces",
        href: resolve("/(app)/workspaces"),
      },
      {
        label: workspace.title,
        href: resolve("/(app)/workspaces/[slug]", { slug: params.slug }),
      },
      {
        label: "Documents",
        href: resolve("/(app)/workspaces/[slug]/documents", { slug: params.slug }),
      },
      {
        label: document.title,
      },
    ],
  };
};

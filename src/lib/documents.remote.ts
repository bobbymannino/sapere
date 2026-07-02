import { command, query } from "$app/server";
import { listRecentDocuments, setDocumentPinned } from "$db/documents";
import { DocumentSlugSchema } from "$lib/schemas/documents";
import { WorkspaceIdSchema, WorkspaceSlugSchema } from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";
import * as v from "valibot";

const SetDocumentPinnedSchema = v.object({
  workspaceSlug: WorkspaceSlugSchema,
  documentSlug: DocumentSlugSchema,
  pinned: v.boolean(),
});

export const getRecentWorkspaceDocuments = query(WorkspaceIdSchema, (workspaceId) => {
  const { user } = requireUser();
  return listRecentDocuments({ ownerId: user.id, workspaceId });
});

export const setDocumentPinnedCommand = command(
  SetDocumentPinnedSchema,
  async ({ workspaceSlug, documentSlug, pinned }) => {
    const { user } = requireUser();
    const document = await setDocumentPinned({
      userId: user.id,
      workspaceSlug,
      documentSlug,
      pinned,
    });

    if (!document) error(404, "Document not found");
    return document;
  },
);

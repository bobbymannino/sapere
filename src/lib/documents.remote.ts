import { command, query } from "$app/server";
import { listRecentDocuments, setDocumentPinned } from "$db/documents";
import { DocumentIdSchema } from "$lib/schemas/documents";
import { WorkspaceIdSchema } from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";
import * as v from "valibot";

const SetDocumentPinnedSchema = v.object({
  documentId: DocumentIdSchema,
  pinned: v.boolean(),
});

export const getRecentWorkspaceDocuments = query(WorkspaceIdSchema, (workspaceId) => {
  const { user } = requireUser();
  return listRecentDocuments({ ownerId: user.id, workspaceId });
});

export const setDocumentPinnedCommand = command(SetDocumentPinnedSchema, async ({ documentId, pinned }) => {
  const { user } = requireUser();
  const document = await setDocumentPinned({
    userId: user.id,
    documentId,
    pinned,
  });
  if (!document) error(404, "Document not found");
  return document;
});

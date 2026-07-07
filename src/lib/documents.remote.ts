import { command, query } from "$app/server";
import { deleteDocument, listRecentDocuments, setDocumentPinned, updateDocumentContent } from "$db/documents";
import { DocumentContentSchema, DocumentIdSchema, DocumentSlugSchema } from "$lib/schemas/documents";
import { WorkspaceIdSchema, WorkspaceSlugSchema } from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";
import * as v from "valibot";

export const getRecentWorkspaceDocuments = query(WorkspaceIdSchema, (workspaceId) => {
  const { user } = requireUser();
  return listRecentDocuments({ ownerId: user.id, workspaceId });
});

const SetDocumentPinnedSchema = v.object({
  documentId: DocumentIdSchema,
  pinned: v.boolean(),
});

export const setDocumentPinnedCommand = command(SetDocumentPinnedSchema, async ({ documentId, pinned }) => {
  const { user } = requireUser();
  const document = await setDocumentPinned({
    userId: user.id,
    documentId,
    pinned,
  });
  if (!document) error(404, "Document not found");
});

const DeleteDocumentSchema = v.object({
  workspaceSlug: WorkspaceSlugSchema,
  documentSlug: DocumentSlugSchema,
});

export const deleteDocumentCommand = command(DeleteDocumentSchema, async ({ workspaceSlug, documentSlug }) => {
  const { user } = requireUser();
  const document = await deleteDocument({
    userId: user.id,
    workspaceSlug,
    documentSlug,
  });
  if (!document) error(404, "Document not found");
});

const SaveDocumentContentSchema = v.object({
  workspaceSlug: WorkspaceSlugSchema,
  documentSlug: DocumentSlugSchema,
  content: DocumentContentSchema,
});

export const saveDocumentContent = command(
  SaveDocumentContentSchema,
  async ({ workspaceSlug, documentSlug, content }) => {
    const { user } = requireUser();
    const document = await updateDocumentContent({
      userId: user.id,
      workspaceSlug,
      documentSlug,
      content,
    });
    if (!document) error(404, "Document not found");
    return {
      content: document.content,
      updatedAt: document.updatedAt.toISOString(),
    };
  },
);

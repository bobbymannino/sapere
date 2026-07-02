import { command } from "$app/server";
import { deleteDocument as deleteDocumentRecord, updateDocumentContent } from "$db/documents";
import { DocumentContentSchema, DocumentSlugSchema } from "$lib/schemas/documents";
import { WorkspaceSlugSchema } from "$lib/schemas/workspaces";
import { requireUser } from "$lib/server/auth-utils";
import { error } from "@sveltejs/kit";
import * as v from "valibot";

const DeleteDocumentSchema = v.object({
  workspaceSlug: WorkspaceSlugSchema,
  documentSlug: DocumentSlugSchema,
});

const SaveDocumentContentSchema = v.object({
  workspaceSlug: WorkspaceSlugSchema,
  documentSlug: DocumentSlugSchema,
  content: DocumentContentSchema,
});

export const deleteDocumentCommand = command(DeleteDocumentSchema, async ({ workspaceSlug, documentSlug }) => {
  const { user } = requireUser();
  const document = await deleteDocumentRecord({
    userId: user.id,
    workspaceSlug,
    documentSlug,
  });

  if (!document) error(404, "Document not found");
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

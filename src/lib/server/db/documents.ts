import { db as mdb } from "$db";
import { isUniqueConstraintError } from "$db/errors";
import type { OrderByTarget, Ordered, PaginationArgs, Paginated } from "$db/pagination";
import { buildOrderClause, buildPaginatedResult, buildPagination } from "$db/pagination";
import { sqlNow } from "$db/utils";
import * as s from "$lib/server/db/schema";
import { and, count, desc, eq, or, sql } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

type CommonArgs = {
  db?: BunSQLDatabase;
};

const documentCardSelection = {
  id: s.documents.id,
  title: s.documents.title,
  slug: s.documents.slug,
  pinnedAt: s.documents.pinnedAt,
  content: s.documents.content,
  updatedAt: s.documents.updatedAt,
  createdAt: s.documents.createdAt,
};

type DocumentSortKey = "updatedAt" | "createdAt" | "title";

const documentOrderColumns = {
  createdAt: s.documents.createdAt,
  title: [s.documents.orderableTitle, s.documents.id],
  updatedAt: s.documents.updatedAt,
} satisfies Record<DocumentSortKey, OrderByTarget | OrderByTarget[]>;

export type DocumentCardSelection = Pick<typeof s.documents.$inferSelect, keyof typeof documentCardSelection>;

type ListDocumentArgs = CommonArgs &
  Ordered<DocumentSortKey> &
  PaginationArgs & {
    workspaceId: typeof s.documents.$inferSelect.workspaceId;
    search?: Nullable<string>;
  };

export async function listDocuments(args: Prettify<ListDocumentArgs>): Promise<Paginated<DocumentCardSelection>> {
  const db = args.db ?? mdb;
  const orderBy = [
    sql`${desc(s.documents.pinnedAt)} nulls last`,
    ...buildOrderClause(args, {
      columns: documentOrderColumns,
      defaultSortBy: "updatedAt",
      defaultSortDir: "desc",
    }),
  ];
  const pagination = buildPagination(args);
  const search = args.search?.trim();
  const searchFilter = search
    ? or(
        sql`position(lower(${search}) in lower(${s.documents.title})) > 0`,
        sql`position(lower(${search}) in lower(${s.documents.content})) > 0`,
      )
    : undefined;
  const where = and(eq(s.documents.workspaceId, args.workspaceId), searchFilter);

  const [spaces, totalRows] = await Promise.all([
    db
      .select(documentCardSelection)
      .from(s.documents)
      .where(where)
      .orderBy(...orderBy)
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({ total: count() }).from(s.documents).where(where),
  ]);

  return buildPaginatedResult(spaces, totalRows[0]?.total ?? 0, pagination);
}

const recentDocumentSelection = {
  id: s.documents.id,
  title: s.documents.title,
  slug: s.documents.slug,
  updatedAt: s.documents.updatedAt,
  workspaceSlug: s.workspaces.slug,
};

export type RecentDocumentSelection = {
  id: typeof s.documents.$inferSelect.id;
  title: typeof s.documents.$inferSelect.title;
  slug: typeof s.documents.$inferSelect.slug;
  updatedAt: typeof s.documents.$inferSelect.updatedAt;
  workspaceSlug: typeof s.workspaces.$inferSelect.slug;
};

type ListRecentDocumentsArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  workspaceId?: typeof s.workspaces.$inferSelect.id;
  limit?: number;
};

/**
 * @param args.limit @default 4
 */
export async function listRecentDocuments(args: Prettify<ListRecentDocumentsArgs>): Promise<RecentDocumentSelection[]> {
  const db = args.db ?? mdb;

  const filters = [eq(s.workspaces.ownerId, args.ownerId)];
  if (args.workspaceId) filters.push(eq(s.workspaces.id, args.workspaceId));

  return db
    .select(recentDocumentSelection)
    .from(s.documents)
    .innerJoin(s.workspaces, eq(s.documents.workspaceId, s.workspaces.id))
    .where(and(...filters))
    .orderBy(desc(s.documents.updatedAt))
    .limit(args.limit || 4);
}

type CreateDocumentArgs = CommonArgs & {
  workspaceId: typeof s.documents.$inferSelect.workspaceId;
  title: typeof s.documents.$inferInsert.title;
  slug: typeof s.documents.$inferInsert.slug;
};

export class DocumentSlugUsedError extends Error {
  constructor(slug: string) {
    super(`Document slug "${slug}" is already in use`);
    this.name = "DocumentSlugUsedError";
  }
}

export async function createDocument(args: Prettify<CreateDocumentArgs>) {
  const db = args.db ?? mdb;

  try {
    return await db.transaction(async (tx) => {
      const [[document]] = await Promise.all([
        tx
          .insert(s.documents)
          .values({
            workspaceId: args.workspaceId,
            title: args.title,
            slug: args.slug,
            content: `# ${args.title}\n\nDear diary...`,
          })
          .returning({ id: s.documents.id, slug: s.documents.slug }),
        tx.update(s.workspaces).set({ updatedAt: sqlNow }).where(eq(s.workspaces.id, args.workspaceId)),
      ]);
      if (!document) throw new Error("Failed to create document");
      return document;
    });
  } catch (error) {
    if (isDocumentSlugUniqueError(error)) throw new DocumentSlugUsedError(args.slug);
    throw error;
  }
}

function isDocumentSlugUniqueError(error: unknown) {
  return isUniqueConstraintError(error, "workspaces_workspace_slug_unique");
}

const documentSelection = {
  id: s.documents.id,
  title: s.documents.title,
  slug: s.documents.slug,
  pinnedAt: s.documents.pinnedAt,
  content: s.documents.content,
  updatedAt: s.documents.updatedAt,
  createdAt: s.documents.createdAt,
};

export type DocumentSelection = Pick<typeof s.documents.$inferSelect, keyof typeof documentSelection>;

type UpdateDocumentContentArgs = CommonArgs & {
  userId: typeof s.users.$inferSelect.id;
  workspaceSlug: typeof s.workspaces.$inferSelect.slug;
  documentSlug: typeof s.documents.$inferSelect.slug;
  content: typeof s.documents.$inferInsert.content;
};

export async function updateDocumentContent(args: Prettify<UpdateDocumentContentArgs>) {
  const db = args.db ?? mdb;

  return db.transaction(async (tx) => {
    const [document] = await tx
      .select({ id: s.documents.id, workspaceId: s.documents.workspaceId })
      .from(s.documents)
      .innerJoin(s.workspaces, eq(s.documents.workspaceId, s.workspaces.id))
      .where(
        and(
          eq(s.workspaces.slug, args.workspaceSlug),
          eq(s.documents.slug, args.documentSlug),
          eq(s.workspaces.ownerId, args.userId),
        ),
      )
      .limit(1);
    if (!document) return null;

    const [[updated]] = await Promise.all([
      tx
        .update(s.documents)
        .set({ content: args.content, updatedAt: sqlNow })
        .where(eq(s.documents.id, document.id))
        .returning({ content: s.documents.content, updatedAt: s.documents.updatedAt }),
      tx.update(s.workspaces).set({ updatedAt: sqlNow }).where(eq(s.workspaces.id, document.workspaceId)),
    ]);
    if (!updated) throw new Error("Failed to update document content");

    return updated;
  });
}

type SetDocumentPinnedArgs = CommonArgs & {
  userId: typeof s.users.$inferSelect.id;
  documentId: typeof s.documents.$inferSelect.id;
  pinned: boolean;
};

export async function setDocumentPinned(args: Prettify<SetDocumentPinnedArgs>) {
  const db = args.db ?? mdb;

  if (args.pinned) {
    const [doc] = await db
      .insert(s.pinnedDocuments)
      .values({ documentId: args.documentId, userId: args.userId })
      .onConflictDoNothing()
      .returning();
    return doc;
  }

  const [doc] = await db
    .delete(s.pinnedDocuments)
    .where(and(eq(s.pinnedDocuments.documentId, args.documentId), eq(s.pinnedDocuments.userId, args.userId)))
    .returning();
  return doc;
}

type UpdateDocumentArgs = CommonArgs & {
  userId: typeof s.users.$inferSelect.id;
  workspaceSlug: typeof s.workspaces.$inferSelect.slug;
  currentDocumentSlug: typeof s.documents.$inferSelect.slug;
  title: typeof s.documents.$inferInsert.title;
  slug: typeof s.documents.$inferInsert.slug;
};

export async function updateDocument(args: Prettify<UpdateDocumentArgs>) {
  const db = args.db ?? mdb;

  try {
    return db.transaction(async (tx) => {
      const [document] = await tx
        .select({ id: s.documents.id, workspaceId: s.documents.workspaceId })
        .from(s.documents)
        .innerJoin(s.workspaces, eq(s.documents.workspaceId, s.workspaces.id))
        .where(
          and(
            eq(s.workspaces.slug, args.workspaceSlug),
            eq(s.documents.slug, args.currentDocumentSlug),
            eq(s.workspaces.ownerId, args.userId),
          ),
        )
        .limit(1);
      if (!document) return null;

      const [[updated]] = await Promise.all([
        tx
          .update(s.documents)
          .set({ title: args.title, slug: args.slug, updatedAt: sqlNow })
          .where(eq(s.documents.id, document.id))
          .returning({ id: s.documents.id, slug: s.documents.slug }),
        tx.update(s.workspaces).set({ updatedAt: sqlNow }).where(eq(s.workspaces.id, document.workspaceId)),
      ]);
      if (!updated) throw new Error("Failed to update document");

      return updated;
    });
  } catch (error) {
    if (isDocumentSlugUniqueError(error)) throw new DocumentSlugUsedError(args.slug);
    throw error;
  }
}

type DeleteDocumentArgs = CommonArgs & {
  userId: typeof s.users.$inferSelect.id;
  workspaceSlug: typeof s.workspaces.$inferSelect.slug;
  documentSlug: typeof s.documents.$inferSelect.slug;
};

export async function deleteDocument(args: Prettify<DeleteDocumentArgs>) {
  const db = args.db ?? mdb;

  return db.transaction(async (tx) => {
    const [document] = await tx
      .select({ id: s.documents.id, workspaceId: s.documents.workspaceId })
      .from(s.documents)
      .innerJoin(s.workspaces, eq(s.documents.workspaceId, s.workspaces.id))
      .where(
        and(
          eq(s.workspaces.slug, args.workspaceSlug),
          eq(s.documents.slug, args.documentSlug),
          eq(s.workspaces.ownerId, args.userId),
        ),
      )
      .limit(1);
    if (!document) return null;

    const [[deleted]] = await Promise.all([
      tx.delete(s.documents).where(eq(s.documents.id, document.id)).returning({ id: s.documents.id }),
      tx.update(s.workspaces).set({ updatedAt: sqlNow }).where(eq(s.workspaces.id, document.workspaceId)),
    ]);
    if (!deleted) throw new Error("Failed to delete document");

    return deleted;
  });
}

type FindDocumentBySlugArgs = CommonArgs & {
  userId: typeof s.users.$inferSelect.id;
  documentSlug: typeof s.documents.$inferSelect.slug;
  workspaceSlug: typeof s.workspaces.$inferSelect.slug;
};

export async function findDocumentBySlug(args: FindDocumentBySlugArgs) {
  const db = args.db ?? mdb;

  const [workspace] = await db
    .select(documentSelection)
    .from(s.documents)
    .innerJoin(s.workspaces, eq(s.documents.workspaceId, s.workspaces.id))
    .where(
      and(
        eq(s.workspaces.slug, args.workspaceSlug),
        eq(s.documents.slug, args.documentSlug),
        eq(s.workspaces.ownerId, args.userId),
      ),
    )
    .limit(1);
  return workspace ?? null;
}

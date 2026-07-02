import { db as mdb, PostgresErrorCodes } from "$db";
import type { OrderByTarget, Ordered, PaginationArgs, Paginated } from "$db/pagination";
import { buildOrderClause, buildPaginatedResult, buildPagination } from "$db/pagination";
import * as s from "$lib/server/db/schema";
import { and, count, desc, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

type CommonArgs = {
  db?: BunSQLDatabase;
};

const documentCardSelection = {
  id: s.documents.id,
  title: s.documents.title,
  slug: s.documents.slug,
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
  };

export async function listDocuments(args: Prettify<ListDocumentArgs>): Promise<Paginated<DocumentCardSelection>> {
  const db = args.db ?? mdb;
  const orderBy = buildOrderClause(args, {
    columns: documentOrderColumns,
    defaultSortBy: "updatedAt",
    defaultSortDir: "desc",
  });
  const pagination = buildPagination(args);
  const where = eq(s.documents.workspaceId, args.workspaceId);

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
  limit?: number;
};

/**
 * @param args.limit @default 4
 */
export async function listRecentDocuments(args: Prettify<ListRecentDocumentsArgs>): Promise<RecentDocumentSelection[]> {
  const db = args.db ?? mdb;

  return db
    .select(recentDocumentSelection)
    .from(s.documents)
    .innerJoin(s.workspaces, eq(s.documents.workspaceId, s.workspaces.id))
    .where(eq(s.workspaces.ownerId, args.ownerId))
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
    return db.transaction(async (tx) => {
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
        tx
          .update(s.workspaces)
          .set({ updatedAt: sql`now()` })
          .where(eq(s.workspaces.id, args.workspaceId)),
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
  return (
    (error instanceof DrizzleQueryError &&
      error.cause instanceof Bun.SQL.PostgresError &&
      error.cause.errno === PostgresErrorCodes.Unique &&
      error.cause.constraint?.includes("slug")) ??
    false
  );
}

const documentSelection = {
  id: s.documents.id,
  title: s.documents.title,
  slug: s.documents.slug,
  content: sql<string>`left(${s.documents.content}, 50)`,
  updatedAt: s.documents.updatedAt,
  createdAt: s.documents.createdAt,
};

export type DocumentSelection = Pick<typeof s.documents.$inferSelect, keyof typeof documentSelection>;

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

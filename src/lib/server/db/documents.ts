import { db as mdb } from "$db";
import type { OrderByTarget, Ordered, PaginationArgs, Paginated } from "$db/pagination";
import { buildOrderClause, buildPaginatedResult, buildPagination } from "$db/pagination";
import * as s from "$lib/server/db/schema";
import { count, eq } from "drizzle-orm";
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

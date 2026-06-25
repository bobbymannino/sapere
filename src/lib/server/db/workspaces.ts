import { db as mdb, PostgresErrorCodes } from "$db";
import type { OrderByTarget, Ordered, PaginationArgs, Paginated } from "$db/pagination";
import { buildOrderClause, buildPaginatedResult, buildPagination } from "$db/pagination";
import * as s from "$lib/server/db/schema";
import { files, deleteFileIfExists, fileTypeToExtension } from "$lib/server/files";
import { and, count, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

type CommonArgs = {
  db?: BunSQLDatabase;
};

const workspaceCardSelection = {
  id: s.workspaces.id,
  title: s.workspaces.title,
  slug: s.workspaces.slug,
  description: s.workspaces.description,
  image: s.workspaces.image,
  updatedAt: s.workspaces.updatedAt,
  createdAt: s.workspaces.createdAt,
};

type WorkspaceSortKey = "updatedAt" | "createdAt" | "title";

const workspaceOrderColumns = {
  createdAt: s.workspaces.createdAt,
  title: sql<string>`lower(${s.workspaces.title})`,
  updatedAt: s.workspaces.updatedAt,
} satisfies Record<WorkspaceSortKey, OrderByTarget>;

export type WorkspaceCardSelection = Pick<typeof s.workspaces.$inferSelect, keyof typeof workspaceCardSelection>;

type ListWorkspacesArgs = CommonArgs &
  Ordered<WorkspaceSortKey> &
  PaginationArgs & {
    ownerId: typeof s.workspaces.$inferSelect.ownerId;
  };

export async function listWorkspaces(args: Prettify<ListWorkspacesArgs>): Promise<Paginated<WorkspaceCardSelection>> {
  const db = args.db ?? mdb;
  const orderBy = buildOrderClause(args, {
    columns: workspaceOrderColumns,
    defaultSortBy: "updatedAt",
    defaultSortDir: "desc",
  });
  const pagination = buildPagination(args);
  const where = eq(s.workspaces.ownerId, args.ownerId);

  const [spaces, totalRows] = await Promise.all([
    db
      .select(workspaceCardSelection)
      .from(s.workspaces)
      .where(where)
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({ total: count() }).from(s.workspaces).where(where),
  ]);

  return buildPaginatedResult(spaces, totalRows[0]?.total ?? 0, pagination);
}

type FindWorkspaceBySlugArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  slug: typeof s.workspaces.$inferSelect.slug;
};

export async function findWorkspaceBySlug(args: Prettify<FindWorkspaceBySlugArgs>) {
  const db = args.db ?? mdb;

  const [space] = await db
    .select(workspaceCardSelection)
    .from(s.workspaces)
    .where(and(eq(s.workspaces.ownerId, args.ownerId), eq(s.workspaces.slug, args.slug)))
    .limit(1);
  return space ?? null;
}

type CreateWorkspaceArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  title: typeof s.workspaces.$inferInsert.title;
  slug: typeof s.workspaces.$inferInsert.slug;
  description: typeof s.workspaces.$inferInsert.description;
  image: File | null | undefined;
};

export class SlugUsedError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" is already in use`);
    this.name = "SlugUsedError";
  }
}

export async function createWorkspace(args: Prettify<CreateWorkspaceArgs>) {
  const db = args.db ?? mdb;

  try {
    return await db.transaction(async (tx) => {
      const [space] = await tx
        .insert(s.workspaces)
        .values({
          ownerId: args.ownerId,
          title: args.title,
          slug: args.slug,
          description: args.description,
        })
        .returning({ id: s.workspaces.id });
      if (!space) throw new Error("Failed to create workspace");

      if (args.image) {
        const image = await files.upload(
          `workspaces/${space.id}/image.${fileTypeToExtension(args.image.type)}`,
          args.image,
        );

        await tx.update(s.workspaces).set({ image: image.key }).where(eq(s.workspaces.id, space.id));
      }

      return space;
    });
  } catch (error) {
    if (isWorkspaceSlugUniqueError(error)) throw new SlugUsedError(args.slug);
    throw error;
  }
}
      }



function isWorkspaceSlugUniqueError(error: unknown) {
  return (
    (error instanceof DrizzleQueryError &&
      error.cause instanceof Bun.SQL.PostgresError &&
      error.cause.errno === PostgresErrorCodes.Unique &&
      error.cause.constraint?.includes("slug")) ??
    false
  );
}

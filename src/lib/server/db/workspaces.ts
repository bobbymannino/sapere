import { db as mdb, PostgresErrorCodes } from "$db";
import * as s from "$lib/server/db/schema";
import { files } from "$lib/server/files";
import { and, asc, desc, DrizzleQueryError, eq } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";
import type { PgColumn } from "drizzle-orm/pg-core";

type CommonArgs = {
  db?: BunSQLDatabase;
};

type WorkspaceSortKey = LiteralUnion<"updatedAt" | "createdAt" | "title">;
type WorkspaceSortOrder = LiteralUnion<"asc" | "desc">;

const workspaceCardSelection = {
  id: s.workspaces.id,
  title: s.workspaces.title,
  slug: s.workspaces.slug,
  description: s.workspaces.description,
  image: s.workspaces.image,
  updatedAt: s.workspaces.updatedAt,
  createdAt: s.workspaces.createdAt,
};

export type WorkspaceCardSelection = Pick<typeof s.workspaces.$inferSelect, keyof typeof workspaceCardSelection>;

type ListWorkspacesArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  /** @default desc */
  order?: Nullable<WorkspaceSortOrder>;
  /** @default updatedAt */
  sort?: Nullable<WorkspaceSortKey>;
};

export async function listWorkspaces(args: Prettify<ListWorkspacesArgs>) {
  const db = args.db ?? mdb;
  const direction = args.order === "asc" ? asc : desc;

  let sortKey: PgColumn = s.workspaces.updatedAt;
  if (args.sort === "title") sortKey = s.workspaces.title;
  else if (args.sort === "createdAt") sortKey = s.workspaces.createdAt;

  const spaces = await db
    .select(workspaceCardSelection)
    .from(s.workspaces)
    .where(eq(s.workspaces.ownerId, args.ownerId))
    .orderBy(direction(sortKey));

  return spaces;
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
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof Bun.SQL.PostgresError) {
        if (error.cause.errno === PostgresErrorCodes.Unique) {
          if (error.cause.constraint?.includes("slug")) {
            throw new SlugUsedError(args.slug);
          }
        }
      }
    }
    throw error;
  }
}

function fileTypeToExtension(type: string) {
  switch (type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

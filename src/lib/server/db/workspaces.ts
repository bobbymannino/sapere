import { db as mdb } from "$db";
import * as s from "$lib/server/db/schema";
import { files } from "$lib/server/files";
import { and, asc, desc, DrizzleQueryError, eq } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

type CommonArgs = {
  db?: BunSQLDatabase;
};

type LiteralUnion<T extends string> = T | (string & {});
type Nullable<T> = T | null;

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
  /** @default -updatedAt */
  orderBy?: Nullable<LiteralUnion<"updatedAt" | "-updatedAt" | "createdAt" | "-createdAt" | "title" | "-title">>;
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
};

export async function listWorkspaces(args: ListWorkspacesArgs) {
  const db = args.db ?? mdb;
  let orderBy = desc(s.workspaces.updatedAt);
  if (args.orderBy) {
    if (args.orderBy === "title") orderBy = asc(s.workspaces.title);
    else if (args.orderBy === "-title") orderBy = desc(s.workspaces.title);
    else if (args.orderBy === "createdAt") orderBy = asc(s.workspaces.createdAt);
    else if (args.orderBy === "-createdAt") orderBy = desc(s.workspaces.createdAt);
    else if (args.orderBy === "updatedAt") orderBy = asc(s.workspaces.updatedAt);
  }

  const spaces = await db
    .select(workspaceCardSelection)
    .from(s.workspaces)
    .where(eq(s.workspaces.ownerId, args.ownerId))
    .orderBy(orderBy);

  return spaces;
}

type FindWorkspaceBySlugArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  slug: typeof s.workspaces.$inferSelect.slug;
};

export async function findWorkspaceBySlug(args: FindWorkspaceBySlugArgs) {
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

export async function createWorkspace(args: CreateWorkspaceArgs) {
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

const PostgresErrorCodes = {
  Unique: "23505",
  Check: "23514",
  NotNull: "23502",
};

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

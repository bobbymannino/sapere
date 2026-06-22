import { db as mdb } from "$db";
import { and, asc, desc, eq } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

import * as s from "./schema";

type CommonArgs = {
  db?: BunSQLDatabase;
};

type LiteralUnion<T extends string> = T | (string & {});
type Nullable<T> = T | null;

const workspaceCardSelection = {
  id: s.workspaces.id,
  title: s.workspaces.title,
  slug: s.workspaces.slug,
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

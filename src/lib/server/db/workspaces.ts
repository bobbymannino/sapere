import { db as mdb } from "$db";
import { recordAuditEvent } from "$db/audit";
import { isUniqueConstraintError } from "$db/errors";
import type { OrderByTarget, Ordered, PaginationArgs, Paginated } from "$db/pagination";
import { buildOrderClause, buildPaginatedResult, buildPagination } from "$db/pagination";
import * as s from "$lib/server/db/schema";
import { files, deleteFileIfExists, fileTypeToExtension } from "$lib/server/files";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";
import { union } from "drizzle-orm/pg-core";

type CommonArgs = {
  db?: BunSQLDatabase;
};

const workspaceCardSelection = {
  id: s.workspaces.id,
  title: s.workspaces.title,
  slug: s.workspaces.slug,
  description: s.workspaces.description,
  image: s.workspaces.image,
  pinnedAt: s.pinnedWorkspaces.pinnedAt,
  updatedAt: s.workspaces.updatedAt,
  createdAt: s.workspaces.createdAt,
};

export type WorkspaceCardSelection = Pick<
  typeof s.workspaces.$inferSelect,
  "id" | "title" | "slug" | "description" | "image" | "updatedAt" | "createdAt"
> & {
  pinnedAt: Date | null;
};

type WorkspaceSortKey = "updatedAt" | "createdAt" | "title";

const workspaceOrderColumns = {
  createdAt: s.workspaces.createdAt,
  title: [s.workspaces.orderableTitle, s.workspaces.id],
  updatedAt: s.workspaces.updatedAt,
} satisfies Record<WorkspaceSortKey, OrderByTarget | OrderByTarget[]>;

type ListWorkspacesArgs = CommonArgs &
  Ordered<WorkspaceSortKey> &
  PaginationArgs & {
    ownerId: typeof s.workspaces.$inferSelect.ownerId;
  };

export async function listWorkspaces(args: Prettify<ListWorkspacesArgs>): Promise<Paginated<WorkspaceCardSelection>> {
  const db = args.db ?? mdb;
  const orderBy = [
    sql`${desc(s.pinnedWorkspaces.pinnedAt)} nulls last`,
    ...buildOrderClause(args, {
      columns: workspaceOrderColumns,
      defaultSortBy: "updatedAt",
      defaultSortDir: "desc",
    }),
  ];
  const pagination = buildPagination(args);
  const where = eq(s.workspaces.ownerId, args.ownerId);

  const [spaces, totalRows] = await Promise.all([
    db
      .select(workspaceCardSelection)
      .from(s.workspaces)
      .leftJoin(
        s.pinnedWorkspaces,
        and(eq(s.pinnedWorkspaces.workspaceId, s.workspaces.id), eq(s.pinnedWorkspaces.userId, args.ownerId)),
      )
      .where(where)
      .orderBy(...orderBy)
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({ total: count() }).from(s.workspaces).where(where),
  ]);

  return buildPaginatedResult(spaces, totalRows[0]?.total ?? 0, pagination);
}

const workspaceCommandSelection = {
  id: s.workspaces.id,
  title: s.workspaces.title,
  slug: s.workspaces.slug,
};

export type WorkspaceCommandSelection = Pick<typeof s.workspaces.$inferSelect, keyof typeof workspaceCommandSelection>;

type ListWorkspaceCommandsArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
};

export async function listWorkspaceCommands(
  args: Prettify<ListWorkspaceCommandsArgs>,
): Promise<WorkspaceCommandSelection[]> {
  const db = args.db ?? mdb;

  return db
    .select(workspaceCommandSelection)
    .from(s.workspaces)
    .where(eq(s.workspaces.ownerId, args.ownerId))
    .orderBy(s.workspaces.orderableTitle, s.workspaces.id);
}

const recentWorkspaceSelection = {
  id: s.workspaces.id,
  title: s.workspaces.title,
  slug: s.workspaces.slug,
  pinnedAt: s.pinnedWorkspaces.pinnedAt,
  updatedAt: s.workspaces.updatedAt,
};

export type RecentWorkspaceSelection = Pick<typeof s.workspaces.$inferSelect, "id" | "title" | "slug" | "updatedAt"> & {
  pinnedAt: Date | null;
};

type ListRecentWorkspacesArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  limit?: number;
};

/**
 * @param args.limit @default 4
 */
export async function listRecentWorkspaces(
  args: Prettify<ListRecentWorkspacesArgs>,
): Promise<RecentWorkspaceSelection[]> {
  const db = args.db ?? mdb;

  return db
    .select(recentWorkspaceSelection)
    .from(s.workspaces)
    .leftJoin(
      s.pinnedWorkspaces,
      and(eq(s.pinnedWorkspaces.workspaceId, s.workspaces.id), eq(s.pinnedWorkspaces.userId, args.ownerId)),
    )
    .where(eq(s.workspaces.ownerId, args.ownerId))
    .orderBy(desc(s.workspaces.updatedAt))
    .limit(args.limit || 4);
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
    .leftJoin(
      s.pinnedWorkspaces,
      and(eq(s.pinnedWorkspaces.workspaceId, s.workspaces.id), eq(s.pinnedWorkspaces.userId, args.ownerId)),
    )
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

      await recordAuditEvent({
        db: tx,
        action: "workspace.created",
        actorId: args.ownerId,
        workspaceId: space.id,
        metadata: { title: args.title, slug: args.slug, hasImage: Boolean(args.image) },
      });

      return space;
    });
  } catch (error) {
    if (isWorkspaceSlugUniqueError(error)) throw new SlugUsedError(args.slug);
    throw error;
  }
}

type UpdateWorkspaceArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  currentSlug: typeof s.workspaces.$inferSelect.slug;
  title: typeof s.workspaces.$inferInsert.title;
  slug: typeof s.workspaces.$inferInsert.slug;
  description: typeof s.workspaces.$inferInsert.description;
  image: File | null | undefined;
  removeImage: boolean;
};

export async function updateWorkspace(args: Prettify<UpdateWorkspaceArgs>) {
  const db = args.db ?? mdb;

  try {
    const result = await db.transaction(async (tx) => {
      const [previous] = await tx
        .select({ title: s.workspaces.title, slug: s.workspaces.slug, description: s.workspaces.description })
        .from(s.workspaces)
        .where(and(eq(s.workspaces.ownerId, args.ownerId), eq(s.workspaces.slug, args.currentSlug)))
        .limit(1);
      if (!previous) return null;

      const [updated] = await tx
        .update(s.workspaces)
        .set({ title: args.title, slug: args.slug, description: args.description })
        .where(and(eq(s.workspaces.ownerId, args.ownerId), eq(s.workspaces.slug, args.currentSlug)))
        .returning({ id: s.workspaces.id, slug: s.workspaces.slug, image: s.workspaces.image });
      if (!updated) return null;

      let newImage = updated.image;
      let imageChanged = false;

      if (args.image) {
        const image = await files.upload(
          `workspaces/${updated.id}/image.${fileTypeToExtension(args.image.type)}`,
          args.image,
        );

        newImage = image.key;
        imageChanged = true;
        await tx.update(s.workspaces).set({ image: newImage }).where(eq(s.workspaces.id, updated.id));
      } else if (args.removeImage) {
        newImage = null;
        imageChanged = true;
        await tx.update(s.workspaces).set({ image: null }).where(eq(s.workspaces.id, updated.id));
      }

      const changed = [
        previous.title !== args.title && "title",
        previous.slug !== args.slug && "slug",
        previous.description !== args.description && "description",
        imageChanged && "image",
      ].filter((field): field is string => Boolean(field));

      await recordAuditEvent({
        db: tx,
        action: "workspace.updated",
        actorId: args.ownerId,
        workspaceId: updated.id,
        metadata: { title: args.title, slug: args.slug, changed },
      });

      return {
        imageChanged,
        oldImage: updated.image,
        workspace: { id: updated.id, slug: updated.slug, image: newImage },
      };
    });

    if (result?.imageChanged && result.oldImage && result.oldImage !== result.workspace.image) {
      await deleteFileIfExists(result.oldImage);
    }

    return result?.workspace ?? null;
  } catch (error) {
    if (isWorkspaceSlugUniqueError(error)) throw new SlugUsedError(args.slug);
    throw error;
  }
}

type SetWorkspacePinnedArgs = CommonArgs & {
  userId: typeof s.users.$inferSelect.id;
  workspaceId: typeof s.workspaces.$inferSelect.id;
  pinned: boolean;
};

export async function setWorkspacePinned(args: Prettify<SetWorkspacePinnedArgs>) {
  const db = args.db ?? mdb;

  if (args.pinned) {
    const [space] = await db
      .insert(s.pinnedWorkspaces)
      .values({ userId: args.userId, workspaceId: args.workspaceId })
      .onConflictDoNothing()
      .returning();
    return space ?? null;
  }

  const [space] = await db
    .delete(s.pinnedWorkspaces)
    .where(and(eq(s.pinnedWorkspaces.userId, args.userId), eq(s.pinnedWorkspaces.workspaceId, args.workspaceId)))
    .returning();
  return space ?? null;
}

type DeleteWorkspaceArgs = CommonArgs & {
  ownerId: typeof s.workspaces.$inferSelect.ownerId;
  workspaceId: typeof s.workspaces.$inferSelect.id;
};

export async function deleteWorkspace(args: Prettify<DeleteWorkspaceArgs>) {
  const db = args.db ?? mdb;

  const workspace = await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(s.workspaces)
      .where(and(eq(s.workspaces.ownerId, args.ownerId), eq(s.workspaces.id, args.workspaceId)))
      .returning({
        id: s.workspaces.id,
        title: s.workspaces.title,
        slug: s.workspaces.slug,
        image: s.workspaces.image,
      });
    if (!deleted) return null;

    // The workspace row is gone, so it can't be referenced; keep its identity in metadata.
    await recordAuditEvent({
      db: tx,
      action: "workspace.deleted",
      actorId: args.ownerId,
      metadata: { workspaceId: deleted.id, title: deleted.title, slug: deleted.slug },
    });

    return deleted;
  });

  if (!workspace) return null;
  if (workspace.image) void deleteFileIfExists(workspace.image);
  return { id: workspace.id, image: workspace.image };
}

function isWorkspaceSlugUniqueError(error: unknown) {
  return isUniqueConstraintError(error, "workspaces_owner_slug_unique");
}

type ListRecentPinnedThingsArgs = CommonArgs & {
  userId: typeof s.users.$inferSelect.id;
};

type RecentPinnedThingType = "workspace" | "document";

export async function listRecentPinnedThings(args: ListRecentPinnedThingsArgs) {
  const db = args.db ?? mdb;

  return await union(
    db
      .select({
        id: s.workspaces.id,
        title: s.workspaces.title,
        workspaceSlug: s.workspaces.slug,
        documentSlug: sql<string | null>`null`,
        pinnedAt: s.pinnedWorkspaces.pinnedAt,
        updatedAt: s.workspaces.updatedAt,
        type: sql<RecentPinnedThingType>`'workspace'`.as("type"),
      })
      .from(s.pinnedWorkspaces)
      .innerJoin(s.workspaces, eq(s.pinnedWorkspaces.workspaceId, s.workspaces.id))
      .where(and(eq(s.workspaces.ownerId, args.userId), eq(s.pinnedWorkspaces.userId, args.userId))),
    db
      .select({
        id: s.documents.id,
        title: s.documents.title,
        workspaceSlug: s.workspaces.slug,
        documentSlug: s.documents.slug,
        pinnedAt: s.pinnedDocuments.pinnedAt,
        updatedAt: s.documents.updatedAt,
        type: sql<RecentPinnedThingType>`'document'`.as("type"),
      })
      .from(s.pinnedDocuments)
      .innerJoin(s.documents, eq(s.pinnedDocuments.documentId, s.documents.id))
      .innerJoin(s.workspaces, eq(s.documents.workspaceId, s.workspaces.id))
      .where(and(eq(s.workspaces.ownerId, args.userId), eq(s.pinnedDocuments.userId, args.userId))),
  )
    .orderBy(({ updatedAt }) => desc(updatedAt))
    .limit(5);
}

export type RecentPinnedThingSelection = Awaited<ReturnType<typeof listRecentPinnedThings>>[number];

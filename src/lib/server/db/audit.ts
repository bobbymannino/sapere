import { getRequestEvent } from "$app/server";
import { db as mdb } from "$db";
import type { AuditAction } from "$lib/audit-actions";
import * as s from "$lib/server/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

type RecordAuditEventArgs = {
  db?: BunSQLDatabase;

  action: AuditAction;
  status?: s.AuditStatus;

  /** Defaults to the current request's user. */
  actorId?: typeof s.users.$inferSelect.id;
  /** @default user */
  actorType?: s.ActorType;

  /** Subjects of the event; set whichever the action touches. */
  workspaceId?: typeof s.workspaces.$inferSelect.id | null;
  documentId?: typeof s.documents.$inferSelect.id | null;
  userId?: typeof s.users.$inferSelect.id | null;

  metadata?: Record<string, unknown>;
};

/**
 * Writes a single audit row. Pass `db` with a transaction handle to make the event
 * atomic with the change it describes.
 *
 * The actor, IP, and user agent come from the current request when available, so callers
 * only pass what the request can't tell them.
 */
export async function recordAuditEvent(args: Prettify<RecordAuditEventArgs>) {
  const db = args.db ?? mdb;
  const event = tryGetRequestEvent();

  const actorId = args.actorId ?? event?.locals.session?.user.id;
  if (!actorId) throw new Error(`Cannot record audit event "${args.action}" without an actor`);

  const [entry] = await db
    .insert(s.auditLogs)
    .values({
      action: args.action,
      status: args.status ?? "success",
      actorId,
      actorType: args.actorType ?? "user",
      ipAddress: event?.getClientAddress() ?? null,
      userAgent: event?.request.headers.get("user-agent") ?? null,
      workspaceId: args.workspaceId ?? null,
      documentId: args.documentId ?? null,
      userId: args.userId ?? null,
      metadata: args.metadata ?? {},
    })
    .returning({ id: s.auditLogs.id });

  return entry ?? null;
}

/** `getRequestEvent` throws when called outside a request (jobs, seeds, migrations). */
function tryGetRequestEvent() {
  try {
    return getRequestEvent();
  } catch {
    return null;
  }
}

type ListActorsLogsArgs = {
  db?: BunSQLDatabase;
  /** Defaults to the current request's user. */
  actorId?: typeof s.users.$inferSelect.id;
  /** Case-insensitive substring match against the log's metadata. */
  metadata?: Nullable<string>;
};

export type ActorAuditLog = {
  id: typeof s.auditLogs.$inferSelect.id;
  action: typeof s.auditLogs.$inferSelect.action;
  userAgent: typeof s.auditLogs.$inferSelect.userAgent;
  metadata: typeof s.auditLogs.$inferSelect.metadata;
  createdAt: typeof s.auditLogs.$inferSelect.createdAt;
};

export async function listActorsLogs(args: ListActorsLogsArgs): Promise<ActorAuditLog[]> {
  const db = args.db ?? mdb;
  const actorId = args.actorId ?? tryGetRequestEvent()?.locals.session?.user.id;
  if (!actorId) throw new Error("actorId is missing");

  const metadata = args.metadata?.trim();
  const metadataFilter = metadata
    ? sql`position(lower(${metadata}) in lower(${s.auditLogs.metadata}::text)) > 0`
    : undefined;

  return db
    .select({
      id: s.auditLogs.id,
      action: s.auditLogs.action,
      userAgent: s.auditLogs.userAgent,
      metadata: s.auditLogs.metadata,
      createdAt: s.auditLogs.createdAt,
    })
    .from(s.auditLogs)
    .where(and(eq(s.auditLogs.actorId, actorId), eq(s.auditLogs.actorType, "user"), metadataFilter))
    .orderBy(desc(s.auditLogs.createdAt));
}

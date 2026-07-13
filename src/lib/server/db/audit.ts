import { getRequestEvent } from "$app/server";
import { db as mdb } from "$db";
import * as s from "$lib/server/db/schema";
import { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

export const AUDIT_ACTIONS = ["workspace.created"] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

type RecordAuditEventArgs = {
  db?: BunSQLDatabase;

  action: AuditAction;
  status?: s.AuditStatus;

  /** Defaults to the current request's user. */
  actorId?: typeof s.users.$inferSelect.id;
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

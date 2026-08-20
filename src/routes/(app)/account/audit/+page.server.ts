import { resolve } from "$app/paths";
import { listActorsLogs } from "$db/audit";
import { AUDIT_ACTIONS, type AuditAction } from "$lib/audit-actions";
import { requireUser } from "$lib/server/auth-utils";

import type { PageServerLoad } from "./$types";

/** Action keys whose rendered title matches the search, so "Created Workspace" finds "workspace.created". */
function actionsMatchingTitle(search: string): AuditAction[] {
  const needle = search.toLowerCase();
  return Object.entries(AUDIT_ACTIONS)
    .filter(([, details]) => details.title.toLowerCase().includes(needle))
    .map(([action]) => action as AuditAction);
}

export const load: PageServerLoad = ({ url }) => {
  const { user } = requireUser();
  const search = url.searchParams.get("q")?.trim() || undefined;
  const sortBy = url.searchParams.get("sortBy") ?? undefined;
  const sortDir = url.searchParams.get("sortDir") ?? undefined;
  const logs = listActorsLogs({
    actorId: user.id,
    search,
    actions: search ? actionsMatchingTitle(search) : undefined,
    sortBy,
    sortDir,
    page: url.searchParams.get("page"),
    perPage: url.searchParams.get("perPage"),
  });
  return {
    search,
    sortBy,
    sortDir,
    logs,
    breadcrumbs: [{ label: "Account", href: resolve("/(app)/account") }, { label: "Audit" }],
  };
};

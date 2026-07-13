export const AUDIT_ACTIONS = { "workspace.created": "Created Workspace" } as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export function auditActionTitle(action: AuditAction) {
  return AUDIT_ACTIONS[action];
}

export const AUDIT_ACTIONS = {
  "user.signup.email": "Signed Up with Email",
  "user.login.email": "Logged In with Email",
  "user.login.username": "Logged In with Username",
  "user.login.passkey": "Logged In with Passkey",
  "workspace.created": "Created Workspace",
  "workspace.deleted": "Deleted Workspace",
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export function auditActionTitle(action: AuditAction) {
  return AUDIT_ACTIONS[action];
}

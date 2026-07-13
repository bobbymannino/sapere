import {
  EnterIcon,
  type IconComponent,
  KeyIcon,
  MarkdownIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  WorkspaceIcon,
} from "$lib/icons";

type AuditActionDetails = {
  title: string;
  description: string;
  icon: IconComponent;
};

export const AUDIT_ACTIONS = {
  "user.signup.email": {
    title: "Signed Up with Email",
    description: "An account was created with an email address and password.",
    icon: UserIcon,
  },
  "user.login.email": {
    title: "Logged In with Email",
    description: "A session was started with an email address and password.",
    icon: EnterIcon,
  },
  "user.login.username": {
    title: "Logged In with Username",
    description: "A session was started with a username and password.",
    icon: EnterIcon,
  },
  "user.login.passkey": {
    title: "Logged In with Passkey",
    description: "A session was started with a registered passkey.",
    icon: KeyIcon,
  },
  "user.passkey.added": {
    title: "Added Passkey",
    description: "A new passkey was registered to the account.",
    icon: KeyIcon,
  },
  "user.passkey.removed": {
    title: "Removed Passkey",
    description: "A passkey was removed from the account and can no longer be used to log in.",
    icon: TrashIcon,
  },
  "workspace.created": {
    title: "Created Workspace",
    description: "A new workspace was created.",
    icon: WorkspaceIcon,
  },
  "workspace.updated": {
    title: "Updated Workspace",
    description: "A workspace's details were changed.",
    icon: PencilIcon,
  },
  "workspace.deleted": {
    title: "Deleted Workspace",
    description: "A workspace and its documents were deleted.",
    icon: TrashIcon,
  },
  "document.created": {
    title: "Created Document",
    description: "A new document was created in a workspace.",
    icon: MarkdownIcon,
  },
  "document.updated": {
    title: "Updated Document",
    description: "A document's title or slug was changed.",
    icon: PencilIcon,
  },
  "document.deleted": {
    title: "Deleted Document",
    description: "A document was deleted from a workspace.",
    icon: TrashIcon,
  },
} as const satisfies Record<string, AuditActionDetails>;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export function auditAction(action: AuditAction) {
  return AUDIT_ACTIONS[action];
}

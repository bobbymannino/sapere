export type CommandBarCommandIcon = "workspace" | "markdown" | "new" | "edit" | "pin" | "unpin" | "user" | "exit";

type CommandBarSignOutAction = { type: "sign-out" };

type CommandBarSetDocumentPinnedAction = {
  type: "set-document-pinned";
  workspaceSlug: string;
  documentSlug: string;
  pinned: boolean;
};

export type CommandBarAction = CommandBarSignOutAction | CommandBarSetDocumentPinnedAction;

type CommandBarCommandBase = {
  id: string;
  group: string;
  label: string;
  icon: CommandBarCommandIcon;
};

export type CommandBarCommand = CommandBarCommandBase &
  (
    | {
        href: string;
        action?: never;
      }
    | {
        action: CommandBarAction;
        href?: never;
      }
  );

export type CommandBarActionCommand = Extract<CommandBarCommand, { action: CommandBarAction }>;

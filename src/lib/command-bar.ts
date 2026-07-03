export type CommandBarCommandIcon = "workspace" | "markdown" | "new" | "edit" | "pin" | "unpin";

export type CommandBarAction = {
  type: "set-document-pinned";
  workspaceSlug: string;
  documentSlug: string;
  pinned: boolean;
};

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

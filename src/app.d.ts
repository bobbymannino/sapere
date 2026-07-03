import type { auth } from "$lib/auth";
import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";

import type { CommandBarCommand } from "./routes/(app)/command-bar.svelte";

type Session = typeof auth.$Infer.Session & { user: { username: string } };

type BreadcrumbItem = { label: string; href?: string };

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: null | Session;
    }
    interface PageData {
      session: null | Session;
      breadcrumbs?: BreadcrumbItem[];
      commands?: CommandBarCommand[];
      isMac: boolean;
    }
    interface PageState {
      editWorkspace?: WorkspaceCardSelection;
    }
    // interface Platform {}
  }

  type LiteralUnion<T extends string> = T | (string & {});
  type Nullable<T> = T | null;
  type Prettify<T> = {
    [K in keyof T]: T[K];
  } & {};
}

export {};

import * as auth from "./auth";
import * as workspaces from "./workspaces";

export const api = { auth, workspaces };

export type { User } from "./auth";

export type {
  CreateWorkspaceBody,
  ListWorkspacesOptions,
  ListWorkspacesResponse,
  Workspace,
  WorkspaceSortBy,
} from "./workspaces";

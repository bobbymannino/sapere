import { ApiError } from "$lib/api/errors";
import { err, type Result } from "neverthrow";
import * as v from "valibot";

import { apiJson, validateBody } from "./client";

const workspaceSchema = v.object({
  id: v.number(),
  authorId: v.number(),
  ownerId: v.number(),
  title: v.string(),
  slug: v.string(),
  createdAt: v.pipe(v.string(), v.toDate()),
  updatedAt: v.pipe(v.string(), v.toDate()),
});

export type Workspace = v.InferOutput<typeof workspaceSchema>;

const listWorkspacesResponseSchema = v.object({
  items: v.array(workspaceSchema),
  page: v.number(),
  pageSize: v.number(),
  total: v.number(),
  totalPages: v.number(),
});

export type ListWorkspacesResponse = v.InferOutput<typeof listWorkspacesResponseSchema>;

const workspaceSortBySchema = v.picklist(["-createdAt", "createdAt", "-updatedAt", "updatedAt", "-title", "title"]);

export type WorkspaceSortBy = v.InferOutput<typeof workspaceSortBySchema>;

const listWorkspacesOptionsSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  pageSize: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100))),
  sortBy: v.optional(workspaceSortBySchema),
});

export type ListWorkspacesOptions = v.InferInput<typeof listWorkspacesOptionsSchema>;

const createWorkspaceBodySchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, "Workspace title is required"),
    v.maxLength(100, "Workspace title must be at most 100 characters long"),
    v.regex(/^[a-zA-Z0-9 _:-]+$/, "Workspace title contains invalid characters"),
  ),
  slug: v.pipe(
    v.string(),
    v.minLength(1, "Workspace slug is required"),
    v.maxLength(50, "Workspace slug must be at most 50 characters long"),
    v.regex(/^[a-z0-9-]+$/, "Workspace slug must only contain lowercase letters, numbers, and hyphens"),
  ),
});

export type CreateWorkspaceBody = v.InferInput<typeof createWorkspaceBodySchema>;

function buildWorkspacesPath(options: ListWorkspacesOptions) {
  const searchParams = new URLSearchParams();

  if (options.page !== undefined) searchParams.set("page", String(options.page));
  if (options.pageSize !== undefined) searchParams.set("pageSize", String(options.pageSize));
  if (options.sortBy !== undefined) searchParams.set("sortBy", options.sortBy);

  const query = searchParams.toString();
  return query ? `/workspaces?${query}` : "/workspaces";
}

export async function list(options: ListWorkspacesOptions = {}): Promise<Result<ListWorkspacesResponse, ApiError>> {
  const parsedOptions = validateBody(listWorkspacesOptionsSchema, options);
  if (parsedOptions.isErr()) return err(parsedOptions.error);

  return apiJson(buildWorkspacesPath(parsedOptions.value), listWorkspacesResponseSchema, {
    authenticated: true,
  });
}

export async function create(body: CreateWorkspaceBody): Promise<Result<Workspace, ApiError>> {
  const parsedBody = validateBody(createWorkspaceBodySchema, body);
  if (parsedBody.isErr()) return err(parsedBody.error);

  return apiJson("/workspaces", workspaceSchema, {
    authenticated: true,
    method: "POST",
    body: parsedBody.value,
  });
}

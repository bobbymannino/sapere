import { getRequestEvent } from "$app/server";
import { API_BASE } from "$env/static/private";
import {
  ApiError,
  handleHttpError,
  UnauthorizedApiError,
  UnknownApiError,
  valibotIssuesToApiError,
} from "$lib/api/errors";
import { err, ok, type Result } from "neverthrow";
import * as v from "valibot";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  authenticated?: boolean;
  body?: object;
};

function getHeaders(options: ApiRequestOptions, token: string | null) {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.authenticated) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function apiFetch(path: string, options: ApiRequestOptions = {}): Promise<Result<Response, ApiError>> {
  const { fetch, locals } = getRequestEvent();
  const token = locals.token;

  if (options.authenticated && !token) {
    return err(new UnauthorizedApiError("Invalid or missing token"));
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: getHeaders(options, token),
    });

    if (!response.ok) {
      return err(await handleHttpError(response));
    }

    return ok(response);
  } catch (error) {
    return err(new UnknownApiError("Failed to execute API request", error));
  }
}

export function validateBody<TSchema extends v.GenericSchema>(
  schema: TSchema,
  body: v.InferInput<TSchema>,
): Result<v.InferOutput<TSchema>, ApiError> {
  const parsed = v.safeParse(schema, body);
  return parsed.success ? ok(parsed.output) : err(valibotIssuesToApiError(parsed.issues));
}

export async function apiJson<TSchema extends v.GenericSchema>(
  path: string,
  responseSchema: TSchema,
  options?: ApiRequestOptions,
): Promise<Result<v.InferOutput<TSchema>, ApiError>> {
  const response = await apiFetch(path, options);
  if (response.isErr()) return err(response.error);

  try {
    const json = await response.value.json();
    return validateBody(responseSchema, json);
  } catch (error) {
    return err(new UnknownApiError("Failed to parse API response", error));
  }
}

export async function apiEmpty(path: string, options?: ApiRequestOptions): Promise<Result<null, ApiError>> {
  const response = await apiFetch(path, options);
  return response.isOk() ? ok(null) : err(response.error);
}

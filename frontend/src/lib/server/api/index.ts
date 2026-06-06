import { getRequestEvent } from "$app/server";
import { API_BASE } from "$env/static/private";
import {
  ApiError,
  handleHttpError,
  UnauthorizedApiError,
  UnknownApiError,
  valibotIssuesToApiError,
} from "$lib/api/errors";
import { emailSchema, passwordSchema, usernameSchema } from "$lib/schemas";
import { err, ResultAsync, ok, okAsync, Result } from "neverthrow";
import * as v from "valibot";

const loginBodySchema = v.union([
  v.object({
    username: usernameSchema,
    password: passwordSchema,
  }),
  v.object({
    email: emailSchema,
    password: passwordSchema,
  }),
]);

type LoginBody = v.InferInput<typeof loginBodySchema>;

const loginResponseSchema = v.object({
  id: v.number(),
  token: v.string(),
  sessionExpiresAt: v.pipe(v.string(), v.toDate()),
});

type LoginResponse = v.InferOutput<typeof loginResponseSchema>;

export async function login(body: LoginBody) {
  const { fetch } = getRequestEvent();

  const parsedBody = v.safeParse(loginBodySchema, body);
  if (!parsedBody.success)
    return err(valibotIssuesToApiError(parsedBody.issues));
  const response = await ResultAsync.fromPromise(
    fetch(`${API_BASE}/auth/login/email`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }),
    (err) => new UnknownApiError("Failed to execute API request", err),
  );
  return await response.asyncAndThen<LoginResponse, ApiError>((res) => {
    return res.ok
      ? ResultAsync.fromSafePromise(res.json()).andThen((json) => {
          const parsed = v.safeParse(loginResponseSchema, json);
          return parsed.success
            ? ok<LoginResponse, ApiError>(parsed.output)
            : err<LoginResponse, ApiError>(
                valibotIssuesToApiError(parsed.issues),
              );
        })
      : ResultAsync.fromSafePromise(handleHttpError(res)).andThen<
          LoginResponse,
          ApiError
        >(err);
  });
}

const signupBodySchema = v.pipe(
  v.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: v.string(),
  }),
  v.check(
    (body) => body.password === body.confirmPassword,
    "Passwords do not match",
  ),
);

type SignupBody = v.InferInput<typeof signupBodySchema>;

export async function signup(body: SignupBody) {
  const { fetch } = getRequestEvent();

  const parsedBody = v.safeParse(signupBodySchema, body);
  if (!parsedBody.success)
    return err(valibotIssuesToApiError(parsedBody.issues));
  const response = await ResultAsync.fromPromise(
    fetch(`${API_BASE}/auth/signup/email`, {
      method: "POST",
      body: JSON.stringify({
        email: body.email,
        username: body.username,
        password: body.password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
    (err) => new UnknownApiError("Failed to execute API request", err),
  );
  return await response.asyncAndThen<LoginResponse, ApiError>((res) => {
    return res.ok
      ? ResultAsync.fromSafePromise(res.json()).andThen((json) => {
          const parsed = v.safeParse(loginResponseSchema, json);
          return parsed.success
            ? ok<LoginResponse, ApiError>(parsed.output)
            : err<LoginResponse, ApiError>(
                valibotIssuesToApiError(parsed.issues),
              );
        })
      : ResultAsync.fromSafePromise(handleHttpError(res)).andThen<
          LoginResponse,
          ApiError
        >(err);
  });
}

export async function logout(): Promise<Result<null, ApiError>> {
  const { fetch, locals } = getRequestEvent();

  const { token } = locals;
  if (!token) return err(new UnauthorizedApiError("Invalid or missing token"));

  const response = await ResultAsync.fromPromise(
    fetch(`${API_BASE}/auth/logout`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
    (err) => new UnknownApiError("Failed to execute API request", err),
  );
  return await response.asyncAndThen<null, ApiError>((res) => {
    return res.ok
      ? okAsync<null, ApiError>(null)
      : ResultAsync.fromSafePromise(handleHttpError(res)).andThen<
          null,
          ApiError
        >(err);
  });
}

const userSchema = v.object({
  id: v.number(),
  email: v.string(),
  username: v.string(),
  createdAt: v.pipe(v.string(), v.toDate()),
  updatedAt: v.pipe(v.string(), v.toDate()),
});

export type User = v.InferOutput<typeof userSchema>;

export async function me(): Promise<Result<User, ApiError>> {
  const { fetch, locals } = getRequestEvent();

  const { token } = locals;
  if (!token) return err(new UnauthorizedApiError("Invalid or missing token"));

  const response = await ResultAsync.fromPromise(
    fetch(`${API_BASE}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
    (err) => new UnknownApiError("Failed to execute API request", err),
  );
  return await response.asyncAndThen<User, ApiError>((res) => {
    return res.ok
      ? ResultAsync.fromSafePromise(res.json()).andThen((json) => {
          const parsed = v.safeParse(userSchema, json);
          return parsed.success
            ? ok<User, ApiError>(parsed.output)
            : err<User, ApiError>(valibotIssuesToApiError(parsed.issues));
        })
      : ResultAsync.fromSafePromise(handleHttpError(res)).andThen<
          User,
          ApiError
        >(err);
  });
}

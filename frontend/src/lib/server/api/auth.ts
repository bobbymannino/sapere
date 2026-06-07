import { ApiError } from "$lib/api/errors";
import { emailSchema, passwordSchema, usernameSchema } from "$lib/schemas";
import { err, type Result } from "neverthrow";
import * as v from "valibot";

import { apiEmpty, apiJson, validateBody } from "./client";

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

const sessionResponseSchema = v.object({
  id: v.number(),
  token: v.string(),
  sessionExpiresAt: v.pipe(v.string(), v.toDate()),
});

type SessionResponse = v.InferOutput<typeof sessionResponseSchema>;

const signupBodySchema = v.pipe(
  v.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: v.string(),
  }),
  v.check((body) => body.password === body.confirmPassword, "Passwords do not match"),
);

type SignupBody = v.InferInput<typeof signupBodySchema>;

const userSchema = v.object({
  id: v.number(),
  email: v.string(),
  username: v.string(),
  createdAt: v.pipe(v.string(), v.toDate()),
  updatedAt: v.pipe(v.string(), v.toDate()),
});

export type User = v.InferOutput<typeof userSchema>;

export async function login(body: LoginBody): Promise<Result<SessionResponse, ApiError>> {
  const parsedBody = validateBody(loginBodySchema, body);
  if (parsedBody.isErr()) return err(parsedBody.error);

  return apiJson("/auth/login/email", sessionResponseSchema, {
    method: "POST",
    body: parsedBody.value,
  });
}

export async function signup(body: SignupBody): Promise<Result<SessionResponse, ApiError>> {
  const parsedBody = validateBody(signupBodySchema, body);
  if (parsedBody.isErr()) return err(parsedBody.error);

  return apiJson("/auth/signup/email", sessionResponseSchema, {
    method: "POST",
    body: {
      email: parsedBody.value.email,
      username: parsedBody.value.username,
      password: parsedBody.value.password,
    },
  });
}

export function logout(): Promise<Result<null, ApiError>> {
  return apiEmpty("/auth/logout", {
    authenticated: true,
    method: "DELETE",
  });
}

export function me(): Promise<Result<User, ApiError>> {
  return apiJson("/auth/me", userSchema, {
    authenticated: true,
  });
}

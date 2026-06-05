import { getRequestEvent } from "$app/server";
import * as v from "valibot";
import { API_BASE } from "$env/static/private";
import { emailSchema, passwordSchema, usernameSchema } from "$lib/schemas";
import { err, ResultAsync, ok } from "neverthrow";
import {
  ApiError,
  handleHttpError,
  UnknownApiError,
  valibotIssuesToApiError,
} from "./errors";

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
  session_expires_at: v.pipe(v.string(), v.toDate()),
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

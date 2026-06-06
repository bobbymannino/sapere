import * as v from "valibot";

export const usernameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3, "Username must be at least 3 characters long"),
  v.maxLength(32, "Username must be at most 32 characters long"),
  v.regex(
    /^[a-zA-Z0-9_]{3,32}$/,
    "Username must only contain letters, numbers, and underscores",
  ),
);

export const emailSchema = v.pipe(v.string(), v.trim(), v.email());

export const passwordSchema = v.pipe(
  v.string(),
  v.minLength(8, "Password must be at least 8 characters long"),
  v.maxLength(255, "Password must be at most 255 characters long"),
  v.regex(
    /^[a-zA-Z0-9_!@#$%^&*()_+=-]{8,255}$/,
    "Password must only contain letters, numbers, and special characters",
  ),
);

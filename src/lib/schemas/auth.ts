import * as v from "valibot";

export const UsernameSchema = v.pipe(
  v.string("Username must be a string"),
  v.nonEmpty("Please enter a username"),
  v.minLength(3, "Username must be 3 or more characters"),
  v.maxLength(30, "Username must be 30 or less characters"),
  v.regex(/^[a-z0-9_.]+$/, "Username must only contain lowercase letters, numbers, underscores, and dots"),
);

export const EmailSchema = v.pipe(
  v.string("Email must be a string"),
  v.nonEmpty("Please enter an email"),
  v.email("Invalid email address"),
);

export const NameSchema = v.pipe(v.string("Name must be a string"), v.nonEmpty("Please enter a name"));

export const PasswordSchema = v.pipe(
  v.string("Password must be a string"),
  v.nonEmpty("Please enter a password"),
  v.minLength(8, "Password must be 8 or more characters"),
  v.maxLength(100, "Password must be 100 or less characters"),
);

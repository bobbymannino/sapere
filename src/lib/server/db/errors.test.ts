import { expect, test } from "bun:test";

import { DrizzleQueryError } from "drizzle-orm";

import { isUniqueConstraintError, PostgresErrorCodes } from "./errors";

function wrappedPostgresError(options: ConstructorParameters<typeof Bun.SQL.PostgresError>[1]) {
  return new DrizzleQueryError("insert into documents", [], new Bun.SQL.PostgresError("duplicate key", options));
}

test("recognizes wrapped unique constraint errors by SQLSTATE code", () => {
  const error = wrappedPostgresError({
    code: PostgresErrorCodes.Unique,
    constraint: "workspaces_workspace_slug_unique",
  });

  expect(isUniqueConstraintError(error, "workspaces_workspace_slug_unique")).toBe(true);
});

test("recognizes wrapped unique constraint errors by errno fallback", () => {
  const error = wrappedPostgresError({
    code: "XX000",
    errno: PostgresErrorCodes.Unique,
    constraint: "workspaces_workspace_slug_unique",
  });

  expect(isUniqueConstraintError(error, "workspaces_workspace_slug_unique")).toBe(true);
});

test("ignores unrelated postgres errors", () => {
  const error = wrappedPostgresError({
    code: PostgresErrorCodes.Unique,
    constraint: "users_email_unique",
  });

  expect(isUniqueConstraintError(error, "workspaces_workspace_slug_unique")).toBe(false);
});

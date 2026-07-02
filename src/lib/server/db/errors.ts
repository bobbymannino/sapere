import { DrizzleQueryError } from "drizzle-orm";

export const PostgresErrorCodes = {
  Unique: "23505",
  Check: "23514",
  NotNull: "23502",
};

type PostgresErrorLike = {
  code?: string;
  errno?: string;
  constraint?: string;
};

function getPostgresError(error: unknown): PostgresErrorLike | null {
  const cause = error instanceof DrizzleQueryError ? error.cause : error;
  return cause instanceof Bun.SQL.PostgresError ? cause : null;
}

export function isUniqueConstraintError(error: unknown, constraint: string) {
  const postgresError = getPostgresError(error);
  return (
    postgresError !== null &&
    (postgresError.code === PostgresErrorCodes.Unique || postgresError.errno === PostgresErrorCodes.Unique) &&
    postgresError.constraint === constraint
  );
}

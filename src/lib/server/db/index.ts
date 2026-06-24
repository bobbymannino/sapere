import { drizzle } from "drizzle-orm/bun-sql/postgres";

export const db = drizzle(Bun.env.DATABASE_URL ?? "");

export const PostgresErrorCodes = {
  Unique: "23505",
  Check: "23514",
  NotNull: "23502",
};

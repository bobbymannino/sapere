import { sql } from "drizzle-orm";

export const sqlNow = sql<Date>`now()`;

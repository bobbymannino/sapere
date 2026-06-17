import { DATABASE_URL } from "$app/env/private";
import { drizzle } from "drizzle-orm/bun-sql/postgres";

export const db = drizzle(DATABASE_URL);

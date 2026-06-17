import { defineEnvVars } from "@sveltejs/kit/hooks";
import * as v from "valibot";

const databaseUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("postgres://"));

export const variables = defineEnvVars({
  DATABASE_URL: {
    schema: databaseUrlSchema,
    description: "Postgres database connection URL",
  },
});

import { defineEnvVars } from "@sveltejs/kit/hooks";
import * as v from "valibot";

const DatabaseUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("postgres://"));

export const variables = defineEnvVars({
  DATABASE_URL: {
    schema: DatabaseUrlSchema,
    description: "Postgres database connection URL",
  },
});

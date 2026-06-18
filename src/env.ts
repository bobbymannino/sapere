import { defineEnvVars } from "@sveltejs/kit/hooks";
import * as v from "valibot";

const DatabaseUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("postgres://"));

const AppNameSchema = v.pipe(v.string(), v.minLength(1));

export const variables = defineEnvVars({
  DATABASE_URL: {
    schema: DatabaseUrlSchema,
    description: "Postgres database connection URL",
  },
  APP_NAME: {
    schema: AppNameSchema,
    description: "The name of the project",
    public: true,
    static: true,
  },
});

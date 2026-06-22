import { defineEnvVars } from "@sveltejs/kit/hooks";
import * as v from "valibot";

const DatabaseUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("postgres://"));

const BetterAuthSecretSchema = v.pipe(v.string(), v.minLength(32));

const BetterAuthUrlSchema = v.pipe(v.string(), v.url());

const AppNameSchema = v.pipe(v.string(), v.minLength(1));

export const variables = defineEnvVars({
  DATABASE_URL: {
    schema: DatabaseUrlSchema,
    description: "Postgres database connection URL",
  },
  BETTER_AUTH_SECRET: {
    schema: BetterAuthSecretSchema,
    description: "Secret value used for encryption and hashing",
  },
  BETTER_AUTH_URL: {
    schema: BetterAuthUrlSchema,
    description: "Base URL of your app",
  },
  PUBLIC_BASE_URL: {
    public: true,
    schema: v.pipe(
      v.string(),
      v.check((v) => {
        console.log("public base url:");
        console.log(v);
        return true;
      }),
    ),
  },
  APP_NAME: {
    schema: AppNameSchema,
    description: "The name of the project",
    public: true,
    static: true,
  },
});

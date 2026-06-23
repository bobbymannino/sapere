import { dev } from "$app/env";
import { defineEnvVars } from "@sveltejs/kit/hooks";
import * as v from "valibot";

const DatabaseUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("postgres://"));

const BetterAuthSecretSchema = v.pipe(v.string(), v.minLength(32));

const BetterAuthUrlSchema = v.pipe(v.string(), v.url());

const AppNameSchema = v.pipe(v.string(), v.minLength(1));

const MinioEndpointUrlSchema = v.pipe(v.string(), v.minLength(32));

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
  APP_NAME: {
    schema: AppNameSchema,
    description: "The name of the project",
    public: true,
    static: true,
  },
  S3_ENDPOINT_URL: {
    description: "The S3 endpoint URL to use for file storage",
    schema: dev ? v.optional(MinioEndpointUrlSchema) : MinioEndpointUrlSchema,
  },
  S3_ACCESS_KEY_ID: {
    description: "The S3 access key ID to use for file storage",
    schema: dev ? v.optional(v.string()) : v.string(),
  },
  S3_SECRET_ACCESS_KEY: {
    description: "The S3 secret access key to use for file storage",
    schema: dev ? v.optional(v.string()) : v.string(),
  },
});

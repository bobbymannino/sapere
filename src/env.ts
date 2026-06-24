import { dev, building } from "$app/env";
import { defineEnvVars } from "@sveltejs/kit/hooks";
import * as v from "valibot";

const AppNameSchema = v.pipe(v.string(), v.minLength(1));

const DatabaseUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("postgres://"));
const RedisUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("redis://"));

const BetterAuthSecretSchema = v.pipe(v.string(), v.minLength(32));
const BetterAuthUrlSchema = v.pipe(v.string(), v.url());

const MinioEndpointUrlSchema = v.pipe(v.string(), v.url());
const MinioAccessKeyIdSchema = v.pipe(v.string(), v.minLength(16));
const MinioSecretAccessKeySchema = v.pipe(v.string(), v.minLength(16));

export const variables = defineEnvVars({
  DATABASE_URL: {
    schema: DatabaseUrlSchema,
    description: "Postgres database connection URL",
  },
  REDIS_URL: {
    schema: RedisUrlSchema,
    description: "Redis-compatible Dragonfly connection URL",
  },
  BETTER_AUTH_SECRET: {
    schema: BetterAuthSecretSchema,
    description: "Secret value used for encryption and hashing",
  },
  BETTER_AUTH_URL: {
    schema: building ? v.optional(BetterAuthUrlSchema) : BetterAuthUrlSchema,
    description: "Base URL of your app",
  },
  APP_NAME: {
    schema: AppNameSchema,
    description: "The name of the project",
    public: true,
    static: true,
  },
  MINIO_ENDPOINT_URL: {
    description: "The minio endpoint URL to use for file storage",
    schema: dev ? v.optional(MinioEndpointUrlSchema) : MinioEndpointUrlSchema,
  },
  MINIO_ACCESS_KEY_ID: {
    description: "The minio access key ID to use for file storage",
    schema: dev ? v.optional(MinioAccessKeyIdSchema) : MinioAccessKeyIdSchema,
  },
  MINIO_SECRET_ACCESS_KEY: {
    description: "The minio secret access key to use for file storage",
    schema: dev ? v.optional(MinioSecretAccessKeySchema) : MinioSecretAccessKeySchema,
  },
});

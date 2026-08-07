import { dev } from "$app/env";
import { defineEnvVars } from "@sveltejs/kit/env";
import * as v from "valibot";

const AppNameSchema = v.pipe(v.string(), v.minLength(1));
const PublicUrlSchema = v.pipe(v.string(), v.url());

const DatabaseUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("postgres://"));
const RedisUrlSchema = v.pipe(v.string(), v.url(), v.startsWith("redis://"));

const BetterAuthSecretSchema = v.pipe(v.string(), v.minLength(32));
const BetterAuthUrlSchema = v.pipe(v.string(), v.url());
const BodySizeLimitSchema = v.pipe(
  v.string(),
  v.regex(/^(?:Infinity|\d+(?:\.\d+)?[KMGkmg]?)$/, "Use bytes or a K, M, or G suffix, e.g. 6M"),
);

const MinioEndpointUrlSchema = v.pipe(v.string(), v.url());
const MinioAccessKeyIdSchema = v.pipe(v.string(), v.minLength(16));
const MinioSecretAccessKeySchema = v.pipe(v.string(), v.minLength(16));

const SentryDsnSchema = v.pipe(v.string(), v.url());

const UuidV4Schema = v.pipe(v.string(), v.uuid());

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
    schema: BetterAuthUrlSchema,
    description: "Base URL of your app",
  },
  APP_NAME: {
    schema: AppNameSchema,
    description: "The name of the project",
    public: true,
    static: true,
  },
  PUBLIC_URL: {
    schema: PublicUrlSchema,
    description: "Canonical public URL for SEO metadata, robots.txt, and sitemap.xml",
    public: true,
    static: true,
  },
  BODY_SIZE_LIMIT: {
    schema: v.optional(BodySizeLimitSchema, "10M"),
    static: true,
    description: "Node adapter request body limit. Keep this above the 5MB workspace image validation limit.",
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
  UMAMI_WEBSITE_ID: {
    description: "The website ID for your Umami project",
    public: true,
    static: true,
    schema: v.optional(UuidV4Schema),
  },
  SENTRY_DSN: {
    description: "The DSN url for a Sentry compatible service",
    public: true,
    static: true,
    schema: v.optional(SentryDsnSchema),
  },
});

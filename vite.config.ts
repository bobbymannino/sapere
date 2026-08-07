import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-node";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    plugins: [
      sentrySvelteKit({
        telemetry: false,
        sentryUrl: env.SENTRY_URL,
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
      tailwindcss(),
      enhancedImages(),
      sveltekit({
        compilerOptions: {
          // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
          runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
          experimental: {
            async: true,
          },
        },
        adapter: adapter(),
        alias: {
          $db: "./src/lib/server/db/index.ts",
          "$db/*": "./src/lib/server/db/*",
        },
        experimental: {
          explicitEnvironmentVariables: true,
          instrumentation: {
            server: true,
          },
          remoteFunctions: true,
        },
      }),
    ],
    build: {
      sourcemap: true,
    },
  };
});

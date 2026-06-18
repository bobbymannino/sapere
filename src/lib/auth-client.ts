import { passkeyClient } from "@better-auth/passkey/client";
import { lastLoginMethodClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
  plugins: [usernameClient(), passkeyClient(), lastLoginMethodClient()],
});

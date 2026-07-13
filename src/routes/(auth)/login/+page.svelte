<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import Meta from "$lib/components/meta.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import CardContent from "$lib/components/ui/card/card-content.svelte";
  import CardFooter from "$lib/components/ui/card/card-footer.svelte";
  import CardHeader from "$lib/components/ui/card/card-header.svelte";
  import CardTitle from "$lib/components/ui/card/card-title.svelte";
  import { slide } from "svelte/transition";

  import LoginForm from "./login-form.svelte";

  const lastLoginMethod = $derived(authClient.getLastUsedLoginMethod());
</script>

<Meta title="Login" description="Log in to your account." robots="noindex,nofollow" />

<CardHeader>
  <CardTitle>Login</CardTitle>
</CardHeader>

<CardContent>
  <LoginForm />
</CardContent>

<CardFooter class="flex-col gap-2">
  <p class="text-center">
    Not got an account? <a
      class="hover:text-primary underline"
      href="{resolve('/(auth)/signup')}?{page.url.searchParams.toString()}"
    >
      Signup
    </a>
  </p>

  {#if lastLoginMethod}
    <div in:slide>
      <Badge variant="secondary">Last Login Method: {lastLoginMethod}</Badge>
    </div>
  {/if}
</CardFooter>

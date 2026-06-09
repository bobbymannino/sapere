<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { UnauthorizedApiError, UnprocessableEntityApiError } from "$lib/api/errors";
  import Alert from "$lib/components/alert.svelte";
  import Button from "$lib/components/button.svelte";
  import InputField from "$lib/components/input-field.svelte";
  import Logo from "$lib/components/logo.svelte";

  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();

  let pending = $state(false);
  const signupHref = $derived(`${resolve("/signup")}${page.url.search}`);
</script>

<div class="flex-center min-h-svh p-6">
  <form
    method="post"
    use:enhance={() => {
      if (pending) return;
      pending = true;
      return async ({ update }) => {
        await update();
        pending = false;
      };
    }}
    class="card max-w-md"
  >
    <Logo />

    <h1>Login</h1>

    <InputField
      id="email"
      required
      name="email"
      type="text"
      label="Email or username"
      defaultValue={form?.email}
      placeholder="johnsmith@email.com"
      error={form?.error}
      errorNames={["username", "email"]}
    />

    <InputField
      id="password"
      required
      name="password"
      type="password"
      label="Password"
      placeholder="Password"
      error={form?.error}
    />

    {#if form?.error instanceof UnprocessableEntityApiError}
      {#each form.error.rootErrors as error}
        <Alert type="error">{error}</Alert>
      {/each}
    {/if}

    {#if form?.error instanceof UnauthorizedApiError}
      <Alert type="error">Invalid credentials</Alert>
    {/if}

    <Button type="submit" {pending} disabled={pending}>Login</Button>
    <p class="text-center">
      Not got an account? <a href={signupHref} class="text-primary hover:underline focus:ring-2 focus:outline-none">
        Sign up
      </a>
    </p>
  </form>
</div>

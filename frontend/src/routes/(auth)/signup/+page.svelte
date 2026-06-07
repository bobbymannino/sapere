<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { ConflictApiError, UnprocessableEntityApiError } from "$lib/api/errors";
  import Alert from "$lib/components/alert.svelte";
  import Button from "$lib/components/button.svelte";
  import InputField from "$lib/components/input-field.svelte";
  import Logo from "$lib/components/logo.svelte";

  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();

  let pending = $state(false);
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

    <h1>Sign up</h1>

    <InputField
      id="email"
      required
      name="email"
      type="email"
      label="Email"
      defaultValue={form?.email}
      placeholder="johnsmith@email.com"
      error={form?.error}
    />

    <InputField
      id="username"
      required
      name="username"
      type="text"
      label="Username"
      defaultValue={form?.username}
      placeholder="johnsmith"
      error={form?.error}
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

    <InputField
      id="confirm-password"
      required
      name="confirmPassword"
      type="password"
      label="Confirm Password"
      placeholder="Password"
      error={form?.error}
    />

    {#if form?.error instanceof UnprocessableEntityApiError}
      {#each form.error.rootErrors as error}
        <Alert type="error">{error}</Alert>
      {/each}
    {/if}

    {#if form?.error instanceof ConflictApiError}
      <Alert type="error">{form.error.message}</Alert>
    {/if}

    <Button type="submit" {pending} disabled={pending}>Sign up</Button>
    <p class="text-center">
      Already got an account? <a
        href={resolve("/login")}
        class="text-primary hover:underline focus:ring-2 focus:outline-none">Login</a
      >
    </p>
  </form>
</div>

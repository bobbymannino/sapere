<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { UnauthorizedApiError, UnprocessableEntityApiError } from "$lib/api/errors";
  import Alert from "$lib/components/alert.svelte";
  import Button from "$lib/components/button.svelte";
  import FormErrors from "$lib/components/form-errors.svelte";
  import Input from "$lib/components/input.svelte";
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

    <h1>Login</h1>

    <div class="stack-1">
      <label for="email">Email or username</label>
      <Input
        id="email"
        required
        name="email"
        type="text"
        defaultValue={form?.email}
        placeholder="johnsmith@email.com"
      />
      <FormErrors name="username" error={form?.error} />
      <FormErrors name="email" error={form?.error} />
    </div>

    <div class="stack-1">
      <label for="password">Password</label>
      <Input required type="password" name="password" id="password" placeholder="Password" />
      <FormErrors name="password" error={form?.error} />
    </div>

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
      Not got an account? <a
        href={resolve("/signup")}
        class="text-primary hover:underline focus:ring-2 focus:outline-none">Sign up</a
      >
    </p>
  </form>
</div>

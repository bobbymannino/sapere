<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/button.svelte";
    import Input from "$lib/components/input.svelte";
    import Logo from "$lib/components/logo.svelte";
    import { UnauthorizedApiError } from "$lib/api/errors";
    import Alert from "$lib/components/alert.svelte";
    import type { PageProps } from "./$types";
    import FormErrors from "$lib/components/form-errors.svelte";

    let { form }: PageProps = $props();

    let pending = $state(false);
</script>

<div class="min-h-svh flex-center p-6">
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
        class="stack w-full max-w-md p-6 bg-mantle border border-crust rounded-lg shadow-lg shadow-primary/10"
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
            <Input
                required
                type="password"
                name="password"
                id="password"
                placeholder="Password"
            />
            <FormErrors name="password" error={form?.error} />
        </div>

        <Button type="submit" {pending} disabled={pending}>Login</Button>

        {#if form?.error instanceof UnauthorizedApiError}
            <Alert type="error">Invalid credentials</Alert>
        {/if}
    </form>
</div>

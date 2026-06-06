<script lang="ts">
    import { enhance } from "$app/forms";
    import { resolve } from "$app/paths";
    import {
        ConflictApiError,
        UnprocessableEntityApiError,
    } from "$lib/api/errors";
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
        class="stack bg-mantle border-crust shadow-primary/10 w-full max-w-md rounded-lg border p-6 shadow-lg"
    >
        <Logo />

        <h1>Sign up</h1>

        <div class="stack-1">
            <label for="email">Email</label>
            <Input
                id="email"
                required
                name="email"
                type="email"
                defaultValue={form?.email}
                placeholder="johnsmith@email.com"
            />
            <FormErrors name="email" error={form?.error} />
        </div>

        <div class="stack-1">
            <label for="username">Username</label>
            <Input
                id="username"
                required
                name="username"
                type="text"
                defaultValue={form?.username}
                placeholder="johnsmith"
            />
            <FormErrors name="username" error={form?.error} />
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

        <div class="stack-1">
            <label for="confirm-password">Confirm Password</label>
            <Input
                required
                type="password"
                name="confirmPassword"
                id="confirm-password"
                placeholder="Password"
            />
            <FormErrors name="confirmPassword" error={form?.error} />
        </div>

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
                class="text-primary hover:underline focus:outline-none focus:ring-2"
                >Login</a
            >
        </p>
    </form>
</div>

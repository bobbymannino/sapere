<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import SpinnerIcon from "$lib/icons/spinner-icon.svelte";
    import * as v from "valibot";
    import { NameSchema, UsernameSchema, EmailSchema, PasswordSchema } from "$lib/schemas/auth";
    import Alert from "$lib/components/ui/alert/alert.svelte";
    import ErrorIcon from "$lib/icons/error-icon.svelte";
    import AlertTitle from "$lib/components/ui/alert/alert-title.svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    let formData = $state({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    let pending = $state(false);
    let valiErrors: v.FlatErrors<typeof Schema> = $state({});

    const Schema = v.pipe(
        v.object({
            name: NameSchema,
            username: UsernameSchema,
            email: EmailSchema,
            password: PasswordSchema,
            confirmPassword: PasswordSchema,
        }),
        v.forward(
            v.check((input) => input.password === input.confirmPassword, "Passwords do not match"),
            ["confirmPassword"],
        ),
    );

    async function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
        e.preventDefault();
        pending = true;
        valiErrors = {};

        const parsedResult = v.safeParse(Schema, formData);
        if (!parsedResult.success) {
            valiErrors = v.flatten(parsedResult.issues);
            pending = false;
            return;
        }
        const { name, username, email, password } = parsedResult.output;

        const { error } = await authClient.signUp.email({ name, username, email, password });
        if (error) {
            if (error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
                valiErrors = { nested: { email: ["Email is already taken"] } };
            } else if (error.code === "USERNAME_IS_ALREADY_TAKEN") {
                valiErrors = { nested: { username: ["Username is already taken"] } };
            }
            pending = false;
            return;
        }

        const redirect = page.url.searchParams.get("redirect");
        page.url.searchParams.delete("redirect");
        goto(`${redirect ?? "/"}?${page.url.searchParams.toString()}`);
    }
</script>

<form class="flex flex-col gap-5" onsubmit={handleSubmit}>
    <div class="grid gap-2">
        <Label for="name">Name</Label>
        <Input
            id="name"
            name="name"
            required
            disabled={pending}
            bind:value={formData.name}
            placeholder="Enter your name"
        />
        {#each valiErrors?.nested?.name as error}
            <Alert variant="destructive">
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </div>

    <div class="grid gap-2">
        <Label for="username">Username</Label>
        <Input
            id="username"
            name="username"
            required
            disabled={pending}
            placeholder="Lowercase letters, numbers, underscores and dots"
            bind:value={
                () => formData.username,
                (v) =>
                    (formData.username = v
                        .toLocaleLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_.]+/g, ""))
            }
        />
        {#each valiErrors?.nested?.username as error}
            <Alert variant="destructive">
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </div>

    <div class="grid gap-2">
        <Label for="email">Email</Label>
        <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={pending}
            bind:value={formData.email}
            placeholder="Enter your email"
        />
        {#each valiErrors?.nested?.email as error}
            <Alert variant="destructive">
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </div>

    <div class="grid gap-2">
        <Label for="password">Password</Label>
        <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={pending}
            bind:value={formData.password}
            placeholder="Enter your password"
        />
        {#each valiErrors?.nested?.password as error}
            <Alert variant="destructive">
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </div>

    <div class="grid gap-2">
        <Label for="confirm-password">Confirm Password</Label>
        <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            required
            disabled={pending}
            bind:value={formData.confirmPassword}
            placeholder="Confirm your password"
        />
        {#each valiErrors?.nested?.confirmPassword as error}
            <Alert variant="destructive">
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </div>

    <Button type="submit" disabled={pending}>
        {#if pending}<SpinnerIcon class="animate-spin" />{/if}
        Signup
    </Button>
</form>

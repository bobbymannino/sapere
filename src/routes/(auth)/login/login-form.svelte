<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { SpinnerIcon } from "$lib/icons";
    import * as v from "valibot";
    import { EmailSchema, PasswordSchema, UsernameSchema } from "$lib/schemas/auth";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import FormInput from "$lib/components/form-input.svelte";

    let formData = $state({
        email: "",
        password: "",
    });
    let pending = $state(false);
    let valiErrors: v.FlatErrors<typeof Schema> = $state({});

    const Schema = v.object({
        email: v.union([EmailSchema, UsernameSchema]),
        password: PasswordSchema,
    });

    async function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
        e.preventDefault();
        pending = true;
        valiErrors = {};

        const parsedResult = v.safeParse(Schema, formData);
        if (!parsedResult.success) {
            valiErrors = v.flatten(parsedResult.issues);
            formData.password = "";
            pending = false;
            return;
        }
        const { email, password } = parsedResult.output;

        const { error } = email.includes("@")
            ? await authClient.signIn.email({ email, password })
            : await authClient.signIn.username({ username: email, password });
        if (error) {
            if (["INVALID_EMAIL_OR_PASSWORD", "INVALID_USERNAME_OR_PASSWORD"].includes(error.code ?? "")) {
                valiErrors = { nested: { password: ["Invalid credentials"] } };
            }
            formData.password = "";
            pending = false;
            return;
        }

        const redirect = page.url.searchParams.get("redirect");
        page.url.searchParams.delete("redirect");
        goto(`${redirect ?? "/"}?${page.url.searchParams.toString()}`);
    }
</script>

<form class="flex flex-col gap-5" onsubmit={handleSubmit}>
    <FormInput inputId="email" label="Email or Username" errors={valiErrors?.nested?.email}>
        <Input
            id="email"
            name="email"
            type="text"
            inputmode="email"
            autocomplete="email"
            required
            disabled={pending}
            bind:value={formData.email}
            placeholder="Enter your email or username"
        />
    </FormInput>

    <FormInput inputId="password" label="Password" errors={valiErrors?.nested?.password}>
        <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={pending}
            bind:value={formData.password}
            placeholder="Enter your password"
        />
    </FormInput>

    <Button type="submit" disabled={pending}>
        {#if pending}<SpinnerIcon class="animate-spin" />{/if}
        Log In
    </Button>
</form>

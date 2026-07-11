<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import FormInput from "$lib/components/form-input.svelte";
  import PasswordInput from "$lib/components/password-input.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { SpinnerIcon } from "$lib/icons";
  import { NameSchema, UsernameSchema, EmailSchema, PasswordSchema } from "$lib/schemas/auth";
  import * as v from "valibot";

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
  <FormInput inputId="name" label="Name" errors={valiErrors?.nested?.name}>
    <Input
      id="name"
      name="name"
      required
      autocomplete="name"
      autofocus
      disabled={pending}
      bind:value={formData.name}
      placeholder="Enter your name"
    />
  </FormInput>

  <FormInput inputId="username" label="Username" errors={valiErrors?.nested?.username}>
    <Input
      id="username"
      name="username"
      required
      autocomplete="username"
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
  </FormInput>

  <FormInput inputId="email" label="Email" errors={valiErrors?.nested?.email}>
    <Input
      id="email"
      name="email"
      type="email"
      autocomplete="email"
      required
      disabled={pending}
      bind:value={formData.email}
      placeholder="Enter your email"
    />
  </FormInput>

  <FormInput inputId="password" label="Password" errors={valiErrors?.nested?.password}>
    <PasswordInput
      id="password"
      name="password"
      required
      disabled={pending}
      bind:value={formData.password}
      placeholder="Enter your password"
      autocomplete="new-password"
    />
  </FormInput>

  <FormInput inputId="confirm-password" label="Confirm Password" errors={valiErrors?.nested?.confirmPassword}>
    <PasswordInput
      id="confirm-password"
      name="confirmPassword"
      required
      disabled={pending}
      bind:value={formData.confirmPassword}
      placeholder="Confirm your password"
      autocomplete="new-password"
    />
  </FormInput>

  <Button type="submit" disabled={pending}>
    {#if pending}<SpinnerIcon class="animate-spin" />{/if}
    Sign Up
  </Button>
</form>

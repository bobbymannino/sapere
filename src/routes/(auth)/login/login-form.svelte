<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import FormInput from "$lib/components/form-input.svelte";
  import PasswordInput from "$lib/components/password-input.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { SpinnerIcon } from "$lib/icons";
  import { EmailSchema, PasswordSchema, UsernameSchema } from "$lib/schemas/auth";
  import * as v from "valibot";

  let formData = $state({
    email: "",
    password: "",
  });
  let pending: false | "email" | "passkey" = $state(false);
  let valiErrors: v.FlatErrors<typeof Schema> = $state({});

  const Schema = v.object({
    email: v.union([EmailSchema, UsernameSchema]),
    password: PasswordSchema,
  });

  async function logInWithPasskey() {
    pending = "passkey";
    valiErrors = {};
    const { error } = await authClient.signIn.passkey();
    if (error) {
      valiErrors = {
        nested: {
          password: [error.message ?? "Failed to login with passkey"],
        },
      };
    } else await goto(page.url.searchParams.get("redirect") ?? "/");
    pending = false;
  }

  function loginDev() {
    formData = {
      email: "test@example.com",
      password: "password",
    };
  }

  async function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
    e.preventDefault();
    pending = "email";
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
      spellcheck="false"
      autocapitalize="off"
      autofocus
      required
      disabled={!!pending}
      bind:value={formData.email}
      placeholder="Enter your email or username"
    />
  </FormInput>

  <FormInput inputId="password" label="Password" errors={valiErrors?.nested?.password}>
    <PasswordInput
      id="password"
      name="password"
      required
      disabled={!!pending}
      bind:value={formData.password}
      placeholder="Enter your password"
      autocomplete="current-password"
    />
  </FormInput>

  {#if process.env.NODE_ENV === "development"}
    <Button onclick={loginDev} disabled={!!pending} type="submit">
      {#if pending === "email"}<SpinnerIcon class="animate-spin" />{/if}
      <span>Log In With Dev Credentials</span>
    </Button>
  {/if}

  <Button type="submit" disabled={!!pending}>
    {#if pending === "email"}<SpinnerIcon class="animate-spin" />{/if}
    Log In
  </Button>

  <Button type="button" variant="outline" disabled={!!pending} onclick={logInWithPasskey}>
    {#if pending === "passkey"}<SpinnerIcon class="animate-spin" />{/if}
    Log In with Passkey
  </Button>
</form>

<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();
</script>

<form method="post" use:enhance class="stack p-4 bg-mantle m-4 text-txt">
    {JSON.stringify(form, null, 2)}
    <label for="email">Email or username</label>
    <input
        type="text"
        name="email"
        id="email"
        placeholder="johnsmith@email.com"
        class="border-2 border-crust"
    />

    <label for="password">Password</label>
    <input
        type="password"
        name="password"
        id="password"
        placeholder="Password"
        class="border-2 border-crust"
    />

    <button type="submit">Login</button>
</form>

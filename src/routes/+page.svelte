<script lang="ts">
    import { page } from "$app/state";
    import { authClient } from "$lib/auth-client";
    const session = authClient.useSession();

    const email = "manninobobby@icloud.com";
    const password = "password";

    async function signUp() {
        await authClient.signUp.email({ email, password, name: "bob" });
    }

    async function logIn() {
        await authClient.signIn.email({ email, password });
    }

    async function signOut() {
        await authClient.signOut();
    }

    async function addPasskey() {
        await authClient.passkey.addPasskey();
    }

    async function logInWithPasskey() {
        await authClient.signIn.passkey();
    }
</script>

<div>
    {#if $session.data}
        <div>
            <p>
                {$session.data.user.name}
            </p>
            <button
                onclick={addPasskey}
                class="p-2 bg-mist-100 hover:bg-mist-200"
            >
                add passkey
            </button>
            <button onclick={signOut} class="p-2 bg-mist-100 hover:bg-mist-200">
                Sign Out
            </button>
        </div>
    {:else if $session.isPending || $session.isRefetching}
        Loading...
    {:else}
        <div class="space-x-3">
            <button onclick={signUp} class="p-2 bg-mist-100 hover:bg-mist-200"
                >Signup</button
            >
            <button onclick={logIn} class="p-2 bg-mist-100 hover:bg-mist-200"
                >Login</button
            >
            <button
                onclick={logInWithPasskey}
                class="p-2 bg-mist-100 hover:bg-mist-200"
            >
                Login with Passkey
            </button>
            <button
                onclick={async () => {
                    await $session.refetch();
                }}
                class="p-2 bg-mist-100 hover:bg-mist-200">Refetch</button
            >
        </div>
    {/if}
</div>

<div class="p-3 bg-mist-100">
    <code><pre>{JSON.stringify($session, null, 2)}</pre></code>
</div>

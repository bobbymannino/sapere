<script lang="ts">
    import { page } from "$app/state";
    import { authClient } from "$lib/auth-client";
    const session = authClient.useSession();
    let lastMethod = $state(authClient.getLastUsedLoginMethod());

    const email = "manninobobby@icloud.com";
    const username = "manninobobby";
    const password = "password";

    async function signUp() {
        await authClient.signUp.email({
            email,
            username,
            password,
            name: "bob",
        });
        lastMethod = authClient.getLastUsedLoginMethod();
    }

    async function logIn() {
        await authClient.signIn.email({ email, password });
        lastMethod = authClient.getLastUsedLoginMethod();
    }

    async function logInWithUsername() {
        await authClient.signIn.username({ username, password });
        lastMethod = authClient.getLastUsedLoginMethod();
    }

    async function signOut() {
        await authClient.signOut();
    }

    async function addPasskey() {
        await authClient.passkey.addPasskey();
        lastMethod = authClient.getLastUsedLoginMethod();
    }

    async function logInWithPasskey() {
        await authClient.signIn.passkey();
        lastMethod = authClient.getLastUsedLoginMethod();
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
            <button onclick={signUp} class="p-2 bg-mist-100 hover:bg-mist-200">
                Signup
            </button>
            <button onclick={logIn} class="p-2 bg-mist-100 hover:bg-mist-200">
                {#if lastMethod === "email"}<span class="text-blue-500">LM</span
                    >{/if}
                Login
            </button>
            <button
                onclick={logInWithUsername}
                class="p-2 bg-mist-100 hover:bg-mist-200"
            >
                {#if lastMethod === "username"}<span class="text-blue-500"
                        >LM</span
                    >{/if}
                Login with Username
            </button>
            <button
                onclick={logInWithPasskey}
                class="p-2 bg-mist-100 hover:bg-mist-200"
            >
                {#if lastMethod === "passkey"}<span class="text-blue-500"
                        >LM</span
                    >{/if}
                Login with Passkey
            </button>
        </div>
    {/if}
</div>

<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
<p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore, alias.</p>

<div class="p-3 bg-mist-100">
    <small>Last Method: {lastMethod}</small>
    <code><pre>{JSON.stringify($session, null, 2)}</pre></code>
</div>

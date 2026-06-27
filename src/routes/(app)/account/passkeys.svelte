<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import AlertTitle from "$lib/components/ui/alert/alert-title.svelte";
    import Alert from "$lib/components/ui/alert/alert.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardFooter from "$lib/components/ui/card/card-footer.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import FormInput from "$lib/components/form-input.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { formatDateTime } from "$lib/date-format";
    import { ErrorIcon, SpinnerIcon, TrashIcon } from "$lib/icons";
    import type { Passkey } from "@better-auth/passkey";
    import { onMount } from "svelte";
    import * as v from "valibot";

    const Schema = v.object({
        name: v.pipe(
            v.string("Passkey name must be a string"),
            v.trim(),
            v.maxLength(50, "Passkey name must be 50 or less characters"),
        ),
    });

    let pending = $state(true);
    let deletingId: string | null = $state(null);
    let error = $state("");
    let valiErrors: v.FlatErrors<typeof Schema> = $state({});
    let formData = $state({
        name: "",
    });
    let passkeys: Passkey[] = $state([]);

    async function loadPasskeys() {
        pending = true;
        const { data } = await authClient.passkey.listUserPasskeys();
        if (data) passkeys = data;
        pending = false;
    }

    async function addPasskey(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
        e.preventDefault();
        pending = true;
        error = "";
        valiErrors = {};

        const parsedResult = v.safeParse(Schema, formData);
        if (!parsedResult.success) {
            valiErrors = v.flatten(parsedResult.issues);
            pending = false;
            return;
        }

        const { name } = parsedResult.output;
        const newPasskey = await authClient.passkey.addPasskey(name ? { name } : undefined);
        if (newPasskey.data) await loadPasskeys();
        else error = newPasskey.error.message ?? "Failed to add passkey";
        if (newPasskey.data) formData.name = "";
        pending = false;
    }

    async function deletePasskey(id: string) {
        deletingId = id;
        pending = true;
        error = "";
        const deletedPasskey = await authClient.passkey.deletePasskey({ id });
        if (deletedPasskey.data) await loadPasskeys();
        else error = deletedPasskey.error.message ?? "Failed to delete passkey";
        pending = false;
        deletingId = null;
    }

    onMount(loadPasskeys);
</script>

<Card class="max-w-lg w-full">
    <CardHeader>
        <CardTitle>Passkeys</CardTitle>
    </CardHeader>

    {#if passkeys.length}
        <CardContent>
            <ul class="space-y-5">
                {#each passkeys as p (p.id)}
                    <li class="flex items-center justify-between">
                        <div>
                            <p>ID <b>#{p.id.slice(0, 7)}</b></p>
                            <p>Name <b>{p.name || "Unnamed Passkey"}</b></p>
                            <p>Created <b>{formatDateTime(p.createdAt)}</b></p>
                        </div>
                        <Button
                            variant="destructive"
                            size="icon"
                            disabled={pending}
                            onclick={() => deletePasskey(p.id)}
                        >
                            <span class="sr-only">Delete passkey</span>
                            {#if deletingId === p.id}
                                <SpinnerIcon class="animate-spin" />
                            {:else}
                                <TrashIcon />
                            {/if}
                        </Button>
                    </li>
                {/each}
            </ul>
        </CardContent>
    {/if}

    <CardFooter class="flex-col gap-5">
        <form class="flex w-full flex-col gap-5" onsubmit={addPasskey}>
            <FormInput inputId="passkey-name" label="Passkey name" errors={valiErrors?.nested?.name}>
                <Input
                    id="passkey-name"
                    name="name"
                    type="text"
                    autocomplete="off"
                    maxlength={50}
                    disabled={pending}
                    bind:value={formData.name}
                    placeholder="Name this passkey"
                />
            </FormInput>

            <Button type="submit" class="w-full" disabled={pending}>
                {#if pending}<SpinnerIcon class="animate-spin" />{/if}
                Add Passkey
            </Button>
        </form>
        {#if error}
            <Alert variant="destructive">
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/if}
    </CardFooter>
</Card>

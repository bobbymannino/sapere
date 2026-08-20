<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import FormInput from "$lib/components/form-input.svelte";
  import * as Alert from "$lib/components/ui/alert";
  import * as Button from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Input from "$lib/components/ui/input";
  import { formatDateTime } from "$lib/date-format";
  import { CircleErrorIcon, SpinnerIcon, TrashIcon } from "$lib/icons";
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

  type Status = "deleting" | "adding" | "loading" | false;

  let status: Status = $state("loading");
  let deletingId: string | null = $state(null);
  let passkeyToDelete: Passkey | null = $state(null);
  let deleteOpen = $state(false);
  let error = $state("");
  let valiErrors: v.FlatErrors<typeof Schema> = $state({});
  let formData = $state({
    name: "",
  });
  let passkeys: Passkey[] = $state([]);

  async function loadPasskeys(previousStatus: Status) {
    status = "loading";
    const { data } = await authClient.passkey.listUserPasskeys();
    if (data) passkeys = data;
    status = previousStatus;
  }

  async function addPasskey(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
    e.preventDefault();
    status = "adding";
    error = "";
    valiErrors = {};

    const parsedResult = v.safeParse(Schema, formData);
    if (!parsedResult.success) {
      valiErrors = v.flatten(parsedResult.issues);
      status = false;
      return;
    }

    const { name } = parsedResult.output;
    const newPasskey = await authClient.passkey.addPasskey(name ? { name } : undefined);
    if (newPasskey.data) {
      await loadPasskeys(status);
      formData.name = "";
    } else {
      if ("code" in newPasskey.error && newPasskey.error.code === "SESSION_NOT_FRESH") {
        error = "Session not fresh, log out and log back in to add a passkey";
      } else {
        error = newPasskey.error?.message ?? "Failed to add passkey";
      }
    }
    status = false;
  }

  async function deletePasskey(id: string) {
    deletingId = id;
    status = "deleting";
    error = "";
    const deletedPasskey = await authClient.passkey.deletePasskey({ id });
    if (deletedPasskey.data) {
      await loadPasskeys(status);
      deleteOpen = false;
      passkeyToDelete = null;
    } else error = deletedPasskey.error.message ?? "Failed to delete passkey";
    status = false;
    deletingId = null;
  }

  function openDeleteDialog(passkey: Passkey) {
    error = "";
    passkeyToDelete = passkey;
    deleteOpen = true;
  }

  onMount(() => loadPasskeys(false));
</script>

<Card.Root class="w-full max-w-lg">
  <Card.Header>
    <Card.Title>Passkeys</Card.Title>
  </Card.Header>

  {#if status === "loading"}
    <Card.Content>
      <span class="sr-only">Loading</span>
      <SpinnerIcon class="mx-auto animate-spin" aria-hidden="true" />
    </Card.Content>
  {/if}

  {#if passkeys.length}
    <Card.Content>
      <ul class="space-y-5">
        {#each passkeys as p (p.id)}
          <li class="flex items-center justify-between">
            <div>
              <p>ID <b>#{p.id.slice(0, 7)}</b></p>
              <p>Name <b>{p.name || "Unnamed Passkey"}</b></p>
              <p>Created <b>{formatDateTime(p.createdAt)}</b></p>
            </div>
            <Button.Root variant="destructive" size="icon" disabled={!!status} onclick={() => openDeleteDialog(p)}>
              <span class="sr-only">Delete passkey</span>
              {#if deletingId === p.id}
                <SpinnerIcon class="animate-spin" />
              {:else}
                <TrashIcon />
              {/if}
            </Button.Root>
          </li>
        {/each}
      </ul>
    </Card.Content>
  {/if}

  <Card.Footer class="flex-col gap-5">
    <form class="flex w-full flex-col gap-5" onsubmit={addPasskey}>
      <FormInput inputId="passkey-name" label="Passkey name" errors={valiErrors?.nested?.name}>
        <Input.Root
          id="passkey-name"
          name="name"
          type="text"
          autocomplete="off"
          maxlength={50}
          disabled={!!status}
          bind:value={formData.name}
          placeholder="Name this passkey"
        />
      </FormInput>

      <Button.Root type="submit" class="w-full" disabled={!!status}>
        {#if status === "adding"}<SpinnerIcon class="animate-spin" />{/if}
        Add Passkey
      </Button.Root>
    </form>
    {#if error}
      <Alert.Root variant="destructive">
        <CircleErrorIcon />
        <Alert.Title>{error}</Alert.Title>
      </Alert.Root>
    {/if}
  </Card.Footer>
</Card.Root>

<Dialog.Root bind:open={deleteOpen}>
  <Dialog.Content showCloseButton={!status}>
    <Dialog.Header>
      <Dialog.Title>Delete passkey?</Dialog.Title>
      <Dialog.Description>
        This will remove {passkeyToDelete?.name || "this passkey"} from your account. You will need to register it again to
        use it for sign in.
      </Dialog.Description>
    </Dialog.Header>

    {#if error}
      <Alert.Root variant="destructive">
        <CircleErrorIcon />
        <Alert.Title>{error}</Alert.Title>
      </Alert.Root>
    {/if}

    <Dialog.Footer>
      <Button.Root type="button" variant="outline" disabled={!!status} onclick={() => (deleteOpen = false)}>
        Cancel
      </Button.Root>
      <Button.Root
        type="button"
        variant="destructive"
        disabled={!!status || !passkeyToDelete}
        onclick={() => passkeyToDelete && deletePasskey(passkeyToDelete.id)}
      >
        {#if deletingId === passkeyToDelete?.id}
          <SpinnerIcon class="animate-spin" />
        {:else}
          <TrashIcon />
        {/if}
        Delete
      </Button.Root>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

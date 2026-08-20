<script lang="ts">
  import AlertTitle from "$lib/components/ui/alert/alert-title.svelte";
  import Alert from "$lib/components/ui/alert/alert.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import { CircleErrorIcon } from "$lib/icons";
  import type { Snippet } from "svelte";

  type Props = {
    inputId: string;
    label: string;
    children: Snippet;
    errors?: string[];
  };

  let { inputId, label, children, errors }: Props = $props();
</script>

<div class="grid gap-2">
  <Label for={inputId}>{label}</Label>

  {@render children()}

  {#each errors as error}
    <Alert variant="destructive">
      <CircleErrorIcon />
      <AlertTitle>{error}</AlertTitle>
    </Alert>
  {/each}
</div>

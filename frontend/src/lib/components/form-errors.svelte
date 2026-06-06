<script lang="ts">
  import { UnprocessableEntityApiError, type ApiError } from "$lib/api/errors";

  import Alert from "./alert.svelte";

  type Props = {
    error?: ApiError;
    name: string;
  };

  let { name, error }: Props = $props();
</script>

{#if error && error instanceof UnprocessableEntityApiError && Object.keys(error.errors).includes(name)}
  <ul class="stack-1">
    {#each error.errors[name] as err}
      <Alert type="error">{err}</Alert>
    {/each}
  </ul>
{/if}

<script lang="ts">
    import { resolve } from "$app/paths";
    import Button from "./button.svelte";
</script>

<Button href={resolve("/")} variant="text" size="lg">Sapere</Button>

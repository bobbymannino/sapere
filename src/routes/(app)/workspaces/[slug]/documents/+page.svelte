<script lang="ts">
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<section class="p-5">
    <h1>{data.workspace.title}</h1>
</section>

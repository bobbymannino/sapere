<script lang="ts">
    import type { PageProps } from "./$types";

    let { data, form }: PageProps = $props();
</script>

<h1>{data.workspace.title}</h1>
<p>{data.workspace.updatedAt}</p>

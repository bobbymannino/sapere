<script lang="ts">
    import { auditActionTitle } from "$lib/audit-actions";
    import Empty from "$lib/components/empty.svelte";
    import * as Table from "$lib/components/ui/table";
    import { formatDateTime, formatShortDateTime, toIsoDate } from "$lib/date-format";
    import { SpinnerIcon } from "$lib/icons";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

{#await data.logs}
    <Empty icon={SpinnerIcon} spinningIcon title="Loading Logs" color="primary" />
{:then logs}
    <Table.Root>
        <Table.Caption>A list of your accounts audit logs</Table.Caption>
        <Table.Header>
            <Table.Row>
                <Table.Head>Action</Table.Head>
                <Table.Head>Metadata</Table.Head>
                <Table.Head>User Agent</Table.Head>
                <Table.Head>Timestamp</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each logs as l (l.id)}
                <Table.Row>
                    <Table.Cell>{auditActionTitle(l.action)}</Table.Cell>
                    <Table.Cell>
                        {#if l.action === "workspace.created" && l.metadata.title}
                            Workspace: {l.metadata.title}
                        {:else if l.action === "workspace.deleted" && l.metadata.title}
                            Workspace: {l.metadata.title}
                        {/if}
                    </Table.Cell>
                    <Table.Cell>{l.userAgent}</Table.Cell>
                    <Table.Cell>
                        <time datetime={toIsoDate(l.createdAt)}>{formatDateTime(l.createdAt)}</time>
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
{/await}

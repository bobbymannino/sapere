<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { navigating, page } from "$app/state";
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Dropdown from "$lib/components/ui/dropdown-menu";
  import * as Kbd from "$lib/components/ui/kbd";
  import { isTextFieldTarget, isUnmodifiedKey } from "$lib/utils";

  const sortOptions = [
    { label: "Newest first", sortBy: "createdAt", sortDir: "desc", value: "createdAt:desc" },
    { label: "Oldest first", sortBy: "createdAt", sortDir: "asc", value: "createdAt:asc" },
  ] as const;

  type Props = {
    /** @default createdAt */
    sortBy?: LiteralUnion<(typeof sortOptions)[number]["sortBy"]>;
    /** @default desc */
    sortDir?: LiteralUnion<(typeof sortOptions)[number]["sortDir"]>;
  };

  let { sortBy = "createdAt", sortDir = "desc" }: Props = $props();

  const sortOption = $derived(sortOptions.find((o) => o.value === `${sortBy}:${sortDir}`) ?? sortOptions[0]);

  function onSortChange(value: string) {
    const sortOption = sortOptions.find((option) => option.value === value);
    if (!sortOption) return;

    const sp = new URLSearchParams(page.url.searchParams);
    sp.set("sortBy", sortOption.sortBy);
    sp.set("sortDir", sortOption.sortDir);
    sp.delete("page");
    goto(`${resolve("/(app)/account/audit")}?${sp.toString()}`);
  }

  let sortByDropdownOpen = $state(false);

  function onkeydown(e: KeyboardEvent) {
    if (e.defaultPrevented || isTextFieldTarget(e.target)) return;
    if (isUnmodifiedKey(e, "s")) {
      e.preventDefault();
      sortByDropdownOpen = true;
    }
  }
</script>

<svelte:window {onkeydown} />

<Dropdown.Root bind:open={sortByDropdownOpen}>
  <Dropdown.Trigger class={buttonVariants({ variant: "outline" })} disabled={Boolean(navigating.to)}>
    <span>Sort: {sortOption.label}</span>
    <Kbd.Root class="can-hover:flex hidden">S</Kbd.Root>
  </Dropdown.Trigger>

  <Dropdown.Content align="end">
    <Dropdown.Label>Sort by</Dropdown.Label>
    <Dropdown.RadioGroup value={sortOption.value}>
      {#each sortOptions as option (option.value)}
        <Dropdown.RadioItem value={option.value} onclick={() => onSortChange(option.value)}>
          {option.label}
        </Dropdown.RadioItem>
      {/each}
    </Dropdown.RadioGroup>
  </Dropdown.Content>
</Dropdown.Root>

<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { authClient } from "$lib/auth-client";
  import * as Dropdown from "$lib/components/ui/dropdown-menu";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { ChevronUpIcon, ExitIcon, SpinnerIcon, UserIcon } from "$lib/icons";

  type Props = { username: string };

  let { username }: Props = $props();

  let isSigningOut = $state(false);

  async function signOut() {
    isSigningOut = true;
    await authClient.signOut({ fetchOptions: { onSuccess: invalidateAll } });
    isSigningOut = false;
  }
</script>

<Sidebar.Footer class="p-3">
  <Sidebar.Menu>
    <Sidebar.MenuItem>
      <Dropdown.Root>
        <Dropdown.Trigger>
          {#snippet child({ props })}
            <Sidebar.MenuButton
              {...props}
              tooltipContent={username}
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12"
            >
              <span class="bg-primary/15 text-primary rounded-full p-2">
                <UserIcon class="size-3" />
              </span>
              <span class="truncate text-sm font-medium">
                {username}
              </span>
              <ChevronUpIcon class="text-sidebar-foreground/60 ms-auto" />
            </Sidebar.MenuButton>
          {/snippet}
        </Dropdown.Trigger>

        <Dropdown.Content side="top" class="w-(--bits-dropdown-menu-anchor-width)">
          <Dropdown.Group>
            <Dropdown.Item>
              {#snippet child({ props })}
                <a {...props} href={resolve("/(app)/account")} class={[props.class, "cursor-pointer"]}>
                  <UserIcon />
                  Account
                </a>
              {/snippet}
            </Dropdown.Item>
            <Dropdown.Item onclick={signOut} variant="destructive" disabled={isSigningOut}>
              {#if isSigningOut}
                <SpinnerIcon class="animate-spin" />
              {:else}
                <ExitIcon />
              {/if}
              <span>Sign out</span>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Root>
    </Sidebar.MenuItem>
  </Sidebar.Menu>
</Sidebar.Footer>

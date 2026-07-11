<script lang="ts">
  import type { CommandBarActionCommand, CommandBarCommand } from "$lib/command-bar";
  import * as Command from "$lib/components/ui/command";
  import {
    ExitIcon,
    MarkdownIcon,
    PencilIcon,
    PinIcon,
    PlusIcon,
    SpinnerIcon,
    type IconComponent,
    UnpinIcon,
    UserIcon,
    WorkspaceIcon,
  } from "$lib/icons";

  type Props = {
    command: CommandBarCommand;
    group?: string;
    disabled?: boolean;
    pending?: boolean;
    onAction?: (command: CommandBarActionCommand) => void | Promise<void>;
  };

  let { command, group, disabled = false, pending = false, onAction }: Props = $props();

  let displayGroup = $derived(group ?? command.group);

  function isActionCommand(command: CommandBarCommand): command is CommandBarActionCommand {
    return "action" in command;
  }

  function getCommandIcon(icon: CommandBarCommand["icon"]): IconComponent {
    switch (icon) {
      case "workspace":
        return WorkspaceIcon;
      case "markdown":
        return MarkdownIcon;
      case "new":
        return PlusIcon;
      case "edit":
        return PencilIcon;
      case "pin":
        return PinIcon;
      case "unpin":
        return UnpinIcon;
      case "user":
        return UserIcon;
      case "exit":
        return ExitIcon;
    }
  }
</script>

{#snippet content()}
  {@const Icon = getCommandIcon(command.icon)}
  {#if pending}
    <SpinnerIcon class="text-muted-foreground/50 animate-spin" />
  {:else}
    <Icon class="text-muted-foreground/50" />
  {/if}
  <span>{command.label}</span>
  <span class="text-muted-foreground/50 ms-auto">{displayGroup}</span>
{/snippet}

{#if "href" in command}
  <Command.Item>
    {#snippet child({ props })}
      <a {...props} href={command.href}>
        {@render content()}
      </a>
    {/snippet}
  </Command.Item>
{:else if isActionCommand(command)}
  <Command.Item onclick={() => void onAction?.(command)} disabled={disabled || !onAction}>
    {#snippet child({ props })}
      <button type="button" {...props} class={[props.class, "w-full"]} disabled={disabled || !onAction}>
        {@render content()}
      </button>
    {/snippet}
  </Command.Item>
{/if}

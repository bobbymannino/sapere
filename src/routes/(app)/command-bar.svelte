<Button
    type="button"
    variant="outline"
    class="min-w-24 justify-start"
    aria-label="Open command bar"
    aria-keyshortcuts="Meta+K Control+K"
    onclick={openCommandBar}
>
    <SearchIcon />
    <span class="can-hover:inline hidden me-5">Search</span>
    <Kbd.Group class='hidden can-hover:inline'>
        <Kbd.Root>{page.data.isMac ? "⌘" : "Ctrl"}</Kbd.Root>
        <Kbd.Root>K</Kbd.Root>
    </Kbd.Group>
</Button>


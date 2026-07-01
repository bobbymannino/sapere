<script lang="ts">
    import { APP_NAME } from "$app/env/public";
    import ThemeToggle from "$lib/components/theme-toggle.svelte";

    const year = new Date().getFullYear();
</script>

<footer class="p-5 border-t border-border flex items-center justify-between">
    <small class="text-muted-foreground">
        &copy; {year}
        {APP_NAME}
    </small>
    <ThemeToggle />
</footer>

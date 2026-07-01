<script lang="ts">
    import { APP_NAME } from "$app/env/public";
    import ThemeToggle from "$lib/components/theme-toggle.svelte";

    const year = new Date().getFullYear();
</script>

<footer class="p-5 border-t border-border flex items-center justify-between">
    <p class="text-muted-foreground">
        <strong>&copy; {year} {APP_NAME}</strong>
    </p>
    <ThemeToggle />
</footer>

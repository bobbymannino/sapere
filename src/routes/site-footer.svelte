<script lang="ts">
    import { APP_NAME } from "$app/env/public";

    const year = new Date().getFullYear();
</script>

<footer class="px-3 py-2 border-t border-border">
    <p class="text-muted-foreground">
        <strong>&copy; {year} {APP_NAME}</strong>
    </p>
</footer>

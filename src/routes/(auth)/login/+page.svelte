<script lang="ts">
    import { page } from "$app/state";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardFooter from "$lib/components/ui/card/card-footer.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import LoginForm from "./login-form.svelte";
</script>

<CardHeader>
    <CardTitle>Login</CardTitle>
</CardHeader>

<CardContent>
    <LoginForm />
</CardContent>

<CardFooter class="flex-col gap-2">
    <p class="text-center">
        Not got an account? <a class="hover:text-primary underline" href="/signup?{page.url.searchParams.toString()}">
            Signup
        </a>
    </p>
</CardFooter>

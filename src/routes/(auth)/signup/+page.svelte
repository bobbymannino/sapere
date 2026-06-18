<script lang="ts">
    import { page } from "$app/state";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardFooter from "$lib/components/ui/card/card-footer.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import SignupForm from "./signup-form.svelte";
</script>

<CardHeader>
    <CardTitle>Signup</CardTitle>
</CardHeader>

<CardContent>
    <SignupForm />
</CardContent>

<CardFooter class="flex-col gap-2">
    <p class="text-center">
        Already got an account? <a
            class="hover:text-primary underline"
            href="/login?{page.url.searchParams.toString()}"
        >
            Login
        </a>
    </p>
</CardFooter>

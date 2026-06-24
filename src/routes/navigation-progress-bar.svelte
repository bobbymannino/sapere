<script lang="ts">
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import { onDestroy } from "svelte";
    import { Tween } from "svelte/motion";
    import { cubicOut, sineInOut } from "svelte/easing";
    import type { AfterNavigate, BeforeNavigate } from "@sveltejs/kit";

    const resetDelay = 500;

    let progressX = new Tween(0);
    let progressY = new Tween(1);
    let navigationId = 0;
    let resetTimeout: ReturnType<typeof setTimeout> | undefined;

    function clearResetTimeout() {
        if (resetTimeout) {
            clearTimeout(resetTimeout);
            resetTimeout = undefined;
        }
    }

    function resetProgress(id: number) {
        clearResetTimeout();
        resetTimeout = setTimeout(() => {
            resetTimeout = undefined;
            if (id !== navigationId) return;
            progressX.set(0, { duration: 0 });
        }, resetDelay);
    }

    function shouldShowProgress(navigation: AfterNavigate | BeforeNavigate) {
        return Boolean(navigation.from && navigation.to && navigation.from.url.href !== navigation.to.url.href);
    }

    async function startProgress(id: number) {
        clearResetTimeout();
        await progressY.set(1, { duration: 0 });
        if (id !== navigationId) return;
        await progressX.set(0, { duration: 0 });
        if (id !== navigationId) return;
        await progressX.set(0.41, { duration: 1333, easing: sineInOut });
        if (id !== navigationId) return;
        await progressX.set(0.87, { duration: 2000, easing: cubicOut });
    }

    async function finishProgress(id: number) {
        await Promise.all([progressX.set(1, { duration: 200 }), progressY.set(0, { duration: 200 })]);
        if (id !== navigationId) return;
        resetProgress(id);
    }

    beforeNavigate((navigation) => {
        const id = ++navigationId;
        if (shouldShowProgress(navigation)) {
            void startProgress(id);
        } else {
            clearResetTimeout();
            progressX.set(0, { duration: 0 });
        }
    });

    afterNavigate((navigation) => {
        if (!shouldShowProgress(navigation)) return;
        void finishProgress(++navigationId);
    });

    onDestroy(() => {
        navigationId += 1;
        clearResetTimeout();
    });
</script>

<div
    aria-hidden="true"
    aria-busy="true"
    aria-label="Navigating..."
    class="z-20 fixed inset-x-0 inset-bs-0 h-1.5 pointer-events-none bg-primary origin-top-left scale-x-(--progress-x) scale-y-(--progress-y)"
    style:--progress-x={progressX.current}
    style:--progress-y={progressY.current}
></div>

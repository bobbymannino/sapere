<script lang="ts">
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import type { AfterNavigate, BeforeNavigate } from "@sveltejs/kit";
  import { onDestroy } from "svelte";
  import { cubicOut, sineInOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

  const startDelay = 200;
  const resetDelay = 500;

  let progressX = new Tween(0);
  let progressY = new Tween(1);
  let navigationId = 0;
  let progressVisible = false;
  let startTimeout: ReturnType<typeof setTimeout> | undefined;
  let resetTimeout: ReturnType<typeof setTimeout> | undefined;

  function clearStartTimeout() {
    if (startTimeout) {
      clearTimeout(startTimeout);
      startTimeout = undefined;
    }
  }

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

  function scheduleProgress(id: number) {
    clearStartTimeout();
    clearResetTimeout();
    progressX.set(0, { duration: 0 });
    startTimeout = setTimeout(() => {
      startTimeout = undefined;
      if (id !== navigationId) return;
      void startProgress(id);
    }, startDelay);
  }

  async function startProgress(id: number) {
    if (id !== navigationId) return;
    progressVisible = true;
    await progressX.set(0, { duration: 0 });
    if (id !== navigationId) return;
    await progressY.set(1, { duration: 0 });
    if (id !== navigationId) return;
    await progressX.set(0.41, { duration: 1333, easing: sineInOut });
    if (id !== navigationId) return;
    await progressX.set(0.87, { duration: 2000, easing: cubicOut });
  }

  async function finishProgress(id: number) {
    clearStartTimeout();
    if (!progressVisible) return;
    await Promise.all([progressX.set(1, { duration: 200 }), progressY.set(0, { duration: 200 })]);
    if (id !== navigationId) return;
    progressVisible = false;
    resetProgress(id);
  }

  beforeNavigate((navigation) => {
    const id = ++navigationId;
    progressVisible = false;
    if (shouldShowProgress(navigation)) {
      scheduleProgress(id);
    } else {
      clearStartTimeout();
      clearResetTimeout();
      progressX.set(0, { duration: 0 });
    }
  });

  afterNavigate((navigation) => {
    if (!shouldShowProgress(navigation)) return;
    const id = ++navigationId;
    if (!progressVisible) {
      clearStartTimeout();
      return;
    }
    void finishProgress(id);
  });

  onDestroy(() => {
    navigationId += 1;
    clearStartTimeout();
    clearResetTimeout();
  });
</script>

<div
  aria-hidden="true"
  aria-busy="true"
  aria-label="Navigating..."
  class="bg-primary pointer-events-none fixed inset-x-0 inset-bs-0 z-20 h-1.5 origin-top-left scale-x-(--progress-x) scale-y-(--progress-y)"
  style:--progress-x={progressX.current}
  style:--progress-y={progressY.current}
></div>

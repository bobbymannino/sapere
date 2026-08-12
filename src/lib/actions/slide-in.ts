import { animate } from "motion";
import type { Action } from "svelte/action";

/** Animates a sidebar link/item in on mount, staggered by its list index. */
export const slideInX: Action<HTMLElement, number | undefined> = (node, index = 0) => {
  animate(
    node,
    { opacity: [0, 1], transform: ["translateX(-12px)", "translateX(0)"] },
    { duration: 0.25, delay: index * 0.045, ease: "easeOut" },
  );
};

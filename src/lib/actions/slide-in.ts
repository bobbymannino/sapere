import { animate } from "motion";
import type { Action } from "svelte/action";
import { prefersReducedMotion } from "svelte/motion";

/** Animates a sidebar link/item in on mount, staggered by its list index. Pass `false` to skip. */
export const slideInRight: Action<HTMLElement, number | false | undefined> = (node, index = 0) => {
  if (index === false) return;
  if (prefersReducedMotion.current) return;
  animate(
    node,
    { opacity: [0, 1], transform: ["translateX(-12px)", "translateX(0)"] },
    { duration: 0.25, delay: index * 0.045, ease: "easeOut" },
  );
};

/** Animates a sidebar link/item in on mount, staggered by its list index. */
export const slideInDown: Action<HTMLElement, number | undefined> = (node, index = 0) => {
  if (prefersReducedMotion.current) return;
  animate(
    node,
    { opacity: [0, 1], transform: ["translateY(-12px)", "translateY(0)"] },
    { duration: 0.25, delay: index * 0.045, ease: "easeOut" },
  );
};

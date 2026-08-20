import { animate } from "motion";
import type { Action } from "svelte/action";
import { prefersReducedMotion } from "svelte/motion";

/**
 * Takes over opacity from the `motion-safe:opacity-0` initial state so the element stays visible
 * even if the motion preference changes after mount.
 */
function reveal(node: HTMLElement) {
  node.style.opacity = "1";
}

/** Animates a sidebar link/item in on mount, staggered by its list index. Pass `false` to skip. */
export const slideInRight: Action<HTMLElement, number | false | undefined> = (node, index = 0) => {
  if (index === false) return;
  if (prefersReducedMotion.current) {
    reveal(node);
    return;
  }
  const animation = animate(
    node,
    { opacity: [0, 1], transform: ["translateX(-12px)", "translateX(0)"] },
    { duration: 0.25, delay: index * 0.045, ease: "easeOut" },
  );
  void animation.finished.finally(() => reveal(node));
};

/** Animates a sidebar link/item in on mount, staggered by its list index. */
export const slideInDown: Action<HTMLElement, number | undefined> = (node, index = 0) => {
  if (prefersReducedMotion.current) {
    reveal(node);
    return;
  }
  const animation = animate(
    node,
    { opacity: [0, 1], transform: ["translateY(-12px)", "translateY(0)"] },
    { duration: 0.25, delay: index * 0.045, ease: "easeOut" },
  );
  void animation.finished.finally(() => reveal(node));
};

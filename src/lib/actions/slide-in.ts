import { animate } from "animejs";
import type { Action } from "svelte/action";
import { prefersReducedMotion } from "svelte/motion";

/**
 * Takes over opacity from the `motion-safe:opacity-0` initial state so the element stays visible
 * even if the motion preference changes after mount.
 */
function reveal(node: HTMLElement) {
  node.style.opacity = "1";
}

type SlideInArgs = {
  index?: number | false;
  ease?: string;
};

/** Animates a sidebar link/item in on mount, staggered by its list index. Pass `false` to skip. */
export const slideInRight: Action<HTMLElement, SlideInArgs | undefined> = (node, args) => {
  const { index = 0, ease = "outQuad" } = args ?? {};

  if (index === false) return;
  if (prefersReducedMotion.current) {
    reveal(node);
    return;
  }
  const animation = animate(node, {
    opacity: [0, 1],
    x: [-16, 0],
    duration: 250,
    delay: index * 45,
    ease,
  });
  void animation.then(() => reveal(node));
};

/** Animates a sidebar link/item in on mount, staggered by its list index. */
export const slideInDown: Action<HTMLElement, SlideInArgs | undefined> = (node, args) => {
  const { index = 0, ease = "outQuad" } = args ?? {};

  if (index === false) return;
  if (prefersReducedMotion.current) {
    reveal(node);
    return;
  }
  const animation = animate(node, {
    opacity: [0, 1],
    y: [-16, 0],
    duration: 250,
    delay: index * 45,
    ease,
  });
  void animation.then(() => reveal(node));
};

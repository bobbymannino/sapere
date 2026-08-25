import { animate } from "animejs";
import { prefersReducedMotion } from "svelte/motion";

/** Plays a quick scale pop on the given element. */
export function pop(node: Element) {
  if (prefersReducedMotion.current) return;
  animate(node, { scale: [1, 1.35, 1], duration: 300, ease: "outQuad" });
}

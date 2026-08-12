import { animate } from "motion";

/** Plays a quick scale pop on the given element. */
export function pop(node: Element) {
  animate(node, { transform: ["scale(1)", "scale(1.35)", "scale(1)"] }, { duration: 0.3, ease: "easeOut" });
}

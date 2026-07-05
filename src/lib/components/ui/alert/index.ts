import Action from "./alert-action.svelte";
import Description from "./alert-description.svelte";
import Title from "./alert-title.svelte";
import Root from "./alert.svelte";
export { alertVariants } from "./alert.js";
export type { AlertVariant } from "./alert.js";

export {
  Root,
  Description,
  Title,
  Action,
  //
  Root as Alert,
  Description as AlertDescription,
  Title as AlertTitle,
  Action as AlertAction,
};

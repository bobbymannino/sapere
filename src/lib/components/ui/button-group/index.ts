import Separator from "./button-group-separator.svelte";
import Text from "./button-group-text.svelte";
import Root from "./button-group.svelte";

export { buttonGroupVariants } from "./button-group.js";
export type { ButtonGroupOrientation } from "./button-group.js";

export {
  Root,
  Text,
  Separator,
  //
  Root as ButtonGroup,
  Text as ButtonGroupText,
  Separator as ButtonGroupSeparator,
};

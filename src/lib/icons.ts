import ExitIconComponent from "central-icons/IconArrowBoxLeft";
import WorkspaceIconComponent from "central-icons/IconBlock";
import CheckmarkIconComponent from "central-icons/IconCheckmark2Medium";
import ChevronLeftIconComponent from "central-icons/IconChevronLeftMedium";
import ChevronRightIconComponent from "central-icons/IconChevronRightMedium";
import ChevronUpIconComponent from "central-icons/IconChevronTopMedium";
import ErrorIconComponent from "central-icons/IconCircleX";
import CrossIconComponent from "central-icons/IconCrossLarge";
import EllipsisIconComponent from "central-icons/IconDotGrid1x3Horizontal";
import SpinnerIconComponent from "central-icons/IconLoadingCircle";
import MinusIconComponent from "central-icons/IconMinusMedium";
import PersonIconComponent from "central-icons/IconPeople";
import SidebarLeftIconComponent from "central-icons/IconSidebarSimpleLeftWide";
import UserIconComponent from "central-icons/IconUser";
import type { Component } from "svelte";
import type { SVGAttributes } from "svelte/elements";

type IconProps = SVGAttributes<any> & {
  "data-icon"?: string;
  ariaHidden?: boolean;
  ariaLabel?: string;
  color?: string;
  size?: string | number;
};

type IconComponent = Component<IconProps>;

function asIcon(component: unknown): IconComponent {
  return component as IconComponent;
}

export const CheckmarkIcon = asIcon(CheckmarkIconComponent);
export const ChevronLeftIcon = asIcon(ChevronLeftIconComponent);
export const ChevronRightIcon = asIcon(ChevronRightIconComponent);
export const ChevronUpIcon = asIcon(ChevronUpIconComponent);
export const CrossIcon = asIcon(CrossIconComponent);
export const ErrorIcon = asIcon(ErrorIconComponent);
export const WorkspaceIcon = asIcon(WorkspaceIconComponent);
export const ExitIcon = asIcon(ExitIconComponent);
export const EllipsisIcon = asIcon(EllipsisIconComponent);
export const MinusIcon = asIcon(MinusIconComponent);
export const PersonIcon = asIcon(PersonIconComponent);
export const SidebarLeftIcon = asIcon(SidebarLeftIconComponent);
export const SpinnerIcon = asIcon(SpinnerIconComponent);
export const UserIcon = asIcon(UserIconComponent);

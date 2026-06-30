import DarkModeIconComponent from "central-icons/IconAppearanceDarkMode";
import ExitIconComponent from "central-icons/IconArrowBoxLeft";
import WorkspaceIconComponent from "central-icons/IconBlock";
import CheckmarkIconComponent from "central-icons/IconCheckmark2Medium";
import ChevronLeftIconComponent from "central-icons/IconChevronLeftMedium";
import ChevronRightIconComponent from "central-icons/IconChevronRightMedium";
import ChevronUpIconComponent from "central-icons/IconChevronTopMedium";
import ErrorIconComponent from "central-icons/IconCircleX";
import CrossIconComponent from "central-icons/IconCrossLarge";
import EllipsisIconComponent from "central-icons/IconDotGrid1x3Horizontal";
import EyeOpenIconComponent from "central-icons/IconEyeOpen";
import EyeSlashIconComponent from "central-icons/IconEyeSlash";
import PictureIconComponent from "central-icons/IconImages3";
import SpinnerIconComponent from "central-icons/IconLoadingCircle";
import SearchIconComponent from "central-icons/IconMagnifyingGlass2";
import MinusIconComponent from "central-icons/IconMinusMedium";
import MoonIconComponent from "central-icons/IconMoon";
import PersonIconComponent from "central-icons/IconPeople";
import SidebarLeftIconComponent from "central-icons/IconSidebarSimpleLeftWide";
import SunIconComponent from "central-icons/IconSun";
import TrashIconComponent from "central-icons/IconTrashCan";
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

export type IconComponent = Component<IconProps>;

function asIcon(component: unknown): IconComponent {
  return component as IconComponent;
}

export const CheckmarkIcon = asIcon(CheckmarkIconComponent);
export const ChevronLeftIcon = asIcon(ChevronLeftIconComponent);
export const ChevronRightIcon = asIcon(ChevronRightIconComponent);
export const ChevronUpIcon = asIcon(ChevronUpIconComponent);
export const DarkModeIcon = asIcon(DarkModeIconComponent);
export const CrossIcon = asIcon(CrossIconComponent);
export const ErrorIcon = asIcon(ErrorIconComponent);
export const EyeOpenIcon = asIcon(EyeOpenIconComponent);
export const EyeSlashIcon = asIcon(EyeSlashIconComponent);
export const WorkspaceIcon = asIcon(WorkspaceIconComponent);
export const ExitIcon = asIcon(ExitIconComponent);
export const EllipsisIcon = asIcon(EllipsisIconComponent);
export const MinusIcon = asIcon(MinusIconComponent);
export const MoonIcon = asIcon(MoonIconComponent);
export const PersonIcon = asIcon(PersonIconComponent);
export const SidebarLeftIcon = asIcon(SidebarLeftIconComponent);
export const SpinnerIcon = asIcon(SpinnerIconComponent);
export const SunIcon = asIcon(SunIconComponent);
export const UserIcon = asIcon(UserIconComponent);
export const TrashIcon = asIcon(TrashIconComponent);
export const PictureIcon = asIcon(PictureIconComponent);
export const SearchIcon = asIcon(SearchIconComponent);

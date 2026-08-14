import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Set via env.BODY_SIZE_LIMIT using an int + K/M/G, example: 1M, 2G, 512K
 */
export function isBodySizeLimitError(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && error.status === 413;
}

export function isTextFieldTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));
}

type KeyboardShortcutEvent = {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
};

export function isUnmodifiedKey(event: KeyboardShortcutEvent, key: string) {
  return (
    !event.metaKey &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    event.key.toLocaleLowerCase() === key.toLocaleLowerCase()
  );
}

export function slugify(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/\s/g, "_")
    .replace(/[^a-z0-9._-]/g, "");
}

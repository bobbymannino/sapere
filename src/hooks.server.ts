import { building } from "$app/env";
import { auth } from "$lib/auth";
import type { Handle } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const handle: Handle = ({ event, resolve }) => svelteKitHandler({ event, resolve, auth, building });

import type { User } from "$lib/server/api";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      token: string | null;
      user: User | null;
    }
    interface PageData {
      user: User | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

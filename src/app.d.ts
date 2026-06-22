import type { auth } from "$lib/auth";

type Session = typeof auth.$Infer.Session & { user: { username: string } };

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: null | Session;
    }
    interface PageData {
      session: null | Session;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

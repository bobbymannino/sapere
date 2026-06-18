import { authClient } from "$lib/auth-client";

type Session = (typeof authClient.$Infer.Session)["session"];
type User = (typeof authClient.$Infer.Session)["user"];

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: null | Session;
      user: null | User;
    }
    interface PageData {
      user: null | User;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

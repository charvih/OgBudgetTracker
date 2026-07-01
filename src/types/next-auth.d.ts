// This file extends the built-in NextAuth types so TypeScript knows that the session
// and JWT token both contain the user's database ID. Without this, TypeScript would
// show errors whenever code tries to read the user's ID from the session.

import { DefaultSession } from "next-auth"

// Adds the user's database ID field to the session object that components can access.
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

// Adds the user's database ID field to the JWT token used behind the scenes.
declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}

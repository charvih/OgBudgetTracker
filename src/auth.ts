// This file sets up how users log in to the app using an email and password.
// It checks the submitted credentials against the database and stores the user's ID
// inside the session token so every page knows who is logged in.

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validations"
import { authConfig } from "./auth.config"

// Sets up NextAuth with the credentials provider and exports the helper functions used across the app.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // Handles email/password login by checking the user exists and the password matches.
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Validates that the submitted email and password meet the basic rules before checking the DB.
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        // Looks up the user in the database by their email address.
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        // Compares the submitted password against the hashed version stored in the database.
        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Saves the user's database ID into the JWT token when they first log in.
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    // Copies the user's ID from the token into the session so pages can access it easily.
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
  session: { strategy: "jwt" },
})

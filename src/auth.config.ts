// This file defines the routing rules for authentication — where to send users when they are
// not logged in, and where to redirect them if they try to visit the login page while already
// signed in. It does not contain any database logic, so it is safe to use in the middleware.

import type { NextAuthConfig } from "next-auth"

// Defines the auth page location and the redirect rules for logged-in and logged-out users.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Checks each page request and redirects the user to the right place based on their login status.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register")

      // Sends visitors who are not logged in to the login page.
      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL("/login", nextUrl))
      }
      // Sends already-logged-in users away from the login and register pages to the dashboard.
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig

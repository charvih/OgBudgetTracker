// This file sets up the NextAuth API endpoints that handle logging in and logging out.
// The GET and POST handlers here are called automatically by the browser when users
// sign in, sign out, or the app needs to check the current session.

import { handlers } from "@/auth"

// Exports the GET and POST handlers that NextAuth uses to manage login sessions.
export const { GET, POST } = handlers

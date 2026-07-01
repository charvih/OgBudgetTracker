// This file provides a cached way to get the current user's login session on the server.
// Wrapping the auth call in React's cache means it only runs once per request, even if
// multiple parts of a page call it at the same time.

import { cache } from "react"
import { auth } from "@/auth"

// Returns the current logged-in user's session, cached so it is only fetched once per request.
export const getSession = cache(auth)

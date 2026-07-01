// This file is the Next.js middleware that runs before every page request.
// It checks whether the visitor is logged in and redirects them to the login page if not,
// protecting all app pages from being accessed without an account.

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Exports the auth middleware function that Next.js runs on every matching request.
export default NextAuth(authConfig).auth;

// Tells Next.js which pages the middleware should run on — everything except static files and images.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

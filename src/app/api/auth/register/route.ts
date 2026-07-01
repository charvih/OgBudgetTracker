// This API endpoint handles new user registration by creating an account in the database.
// It validates the submitted data, hashes the password so it is never stored in plain text,
// and returns an error if the email address is already in use by another account.

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validations"

// Checks whether a database error was caused by a duplicate email address.
function isPrismaUniqueError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  )
}

// Handles POST requests to create a new user account.
export async function POST(request: NextRequest) {
  // Tries to parse the request body as JSON, returning a 400 error if the format is invalid.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Validates the submitted name, email, and password against the registration rules.
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  try {
    // Hashes the password with bcrypt before saving so it cannot be read if the database is leaked.
    const hashed = await bcrypt.hash(password, 12)
    await db.user.create({ data: { name, email, password: hashed } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e: unknown) {
    // Returns a 409 conflict error if the email address is already registered.
    if (isPrismaUniqueError(e)) {
      return NextResponse.json({ error: { email: ["Email already in use"] } }, { status: 409 })
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

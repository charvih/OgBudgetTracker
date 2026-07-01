import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validations"

function isPrismaUniqueError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  )
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  try {
    const hashed = await bcrypt.hash(password, 12)
    await db.user.create({ data: { name, email, password: hashed } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e: unknown) {
    if (isPrismaUniqueError(e)) {
      return NextResponse.json({ error: { email: ["Email already in use"] } }, { status: 409 })
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

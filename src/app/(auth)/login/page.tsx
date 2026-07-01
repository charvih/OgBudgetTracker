// This is the login page where existing users enter their email and password to sign in.
// It validates the form before sending the credentials to the server, and shows an error
// message if the email or password is wrong.

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginInput } from "@/lib/validations"

export default function LoginPage() {
  const router = useRouter()
  // Stores the error message to show when the email or password is incorrect.
  const [error, setError] = useState<string | null>(null)

  // Sets up the login form with validation rules from the loginSchema.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  // Tries to sign the user in with their email and password, then redirects to the dashboard.
  const onSubmit = async (data: LoginInput) => {
    setError(null)
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    // Shows an error message if the login failed, otherwise goes to the dashboard.
    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* The app logo and name shown above the login card. */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-rose-500 text-white p-3 rounded-2xl">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Budget Tracker</h1>
          <p className="text-stone-500 text-sm">Smart expense tracking, powered by AI</p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* The login form with email and password fields. */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {/* Shows a validation error if the email field is invalid. */}
                {errors.email && (
                  <p className="text-xs text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {/* Shows a validation error if the password field is invalid. */}
                {errors.password && (
                  <p className="text-xs text-rose-500">{errors.password.message}</p>
                )}
              </div>

              {/* Shows the server-side error if the email or password did not match. */}
              {error && (
                <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            {/* Link to the registration page for new users. */}
            <p className="text-center text-sm text-stone-500 mt-4">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-rose-500 hover:underline font-medium">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// This is the registration page where new users create an account with their name, email, and password.
// After a successful sign-up the user is automatically logged in and shown a welcome popup
// before being taken to the dashboard.

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { registerSchema, type RegisterInput } from "@/lib/validations"

export default function RegisterPage() {
  const router = useRouter()
  // Stores an error message to show if registration fails.
  const [error, setError] = useState<string | null>(null)
  // Controls whether the success popup is visible after account creation.
  const [showSuccess, setShowSuccess] = useState(false)
  // Stores the new user's name to personalise the welcome message.
  const [userName, setUserName] = useState("")

  // Sets up the registration form with the schema validation rules.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  // Sends the registration data to the API and then logs the user in automatically.
  const onSubmit = async (data: RegisterInput) => {
    setError(null)

    // Posts the new account details to the registration API endpoint.
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    // If the API returned an error, extract the first error message and display it.
    if (!res.ok) {
      const body = await res.json()
      const firstError = Object.values(body.error ?? {})[0] as string[] | undefined
      setError(firstError?.[0] ?? "Registration failed")
      return
    }

    // Logs the new user in right away so they do not need to go to the login page.
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    // Shows the welcome popup with the user's name.
    setUserName(data.name)
    setShowSuccess(true)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      {/* The success dialog shown after the account is created successfully. */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="max-w-sm text-center">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <DialogTitle className="text-lg text-center">Account created!</DialogTitle>
            <DialogDescription className="text-center">
              Welcome, <span className="font-medium text-stone-800">{userName}</span>! You&apos;re
              signed in and ready to start tracking your expenses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent sm:justify-center">
            {/* Clicking this button takes the newly registered user to the dashboard. */}
            <Button
              className="bg-rose-500 hover:bg-rose-600 w-full"
              onClick={() => router.push("/dashboard")}
            >
              Get started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-md space-y-6">
        {/* The app logo and name shown above the registration card. */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-rose-500 text-white p-3 rounded-2xl">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Budget Tracker</h1>
          <p className="text-stone-500 text-sm">Smart expense tracking, powered by AI</p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Start tracking your expenses today</CardDescription>
          </CardHeader>
          <CardContent>
            {/* The registration form with name, email, and password fields. */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-rose-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500">{errors.password.message}</p>
                )}
              </div>

              {/* Shows the server-side error such as "email already in use". */}
              {error && (
                <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>

            {/* Link to the login page for users who already have an account. */}
            <p className="text-center text-sm text-stone-500 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

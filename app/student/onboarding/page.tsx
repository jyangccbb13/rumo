"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/inMemoryStore"

export default function OnboardingPage() {
  const router = useRouter()
  const setStudentOnboarded = useAppStore((state) => state.setStudentOnboarded)
  const generateDemoTasks = useAppStore((state) => state.generateDemoTasks)

  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)

    // Simulate a brief loading state
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mark onboarded and generate demo tasks
    setStudentOnboarded(true)
    generateDemoTasks()

    // Navigate to timeline
    router.push("/student/timeline")
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            Onboarding Survey
          </p>
          <h1 className="text-2xl font-normal text-primary">Enter your email.</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            placeholder="exceptionalstudent@yourschool.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 rounded-none border-0 border-b-2 border-primary bg-transparent px-0 text-center text-lg text-primary placeholder:text-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !email.trim()}
            className="group rounded-full px-8 py-6 text-base font-normal shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              "Loading..."
            ) : (
              <span className="flex items-center gap-2">
                Continue
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          We'll use this to personalize your experience
        </p>
      </div>
    </div>
  )
}

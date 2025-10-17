"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/inMemoryStore"

export default function LandingPage() {
  const setRole = useAppStore((state) => state.setRole)

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Top right role buttons */}
      <div className="absolute right-8 top-8 flex gap-3">
        <Button
          variant="ghost"
          className="rounded-full text-sm font-normal text-muted-foreground hover:text-foreground"
          onClick={() => setRole("student")}
          asChild
        >
          <Link href="/student/onboarding">Student</Link>
        </Button>
        <Button
          variant="ghost"
          className="rounded-full text-sm font-normal text-muted-foreground hover:text-foreground"
          onClick={() => setRole("counselor")}
          asChild
        >
          <Link href="/counselor/dashboard">Counselor</Link>
        </Button>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-center space-y-8">
        <h1 className="text-center text-6xl font-bold uppercase tracking-wide text-primary sm:text-7xl md:text-8xl">
          RUMO
        </h1>
        <Button
          size="lg"
          className="group rounded-full px-8 py-6 text-lg font-normal shadow-lg transition-all hover:shadow-xl"
          onClick={() => setRole("student")}
          asChild
        >
          <Link href="/student/onboarding" className="flex items-center gap-2">
            sign up
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

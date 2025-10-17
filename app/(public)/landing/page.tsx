"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/inMemoryStore"

export default function LandingPage() {
  const setRole = useAppStore((state) => state.setRole)

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-center space-y-8">
        <h1 className="text-center text-6xl font-bold uppercase tracking-wide text-primary sm:text-7xl md:text-8xl">
          RUMO
        </h1>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Button
            size="lg"
            className="group rounded-full px-8 py-6 text-lg font-normal shadow-lg transition-all hover:shadow-xl"
            onClick={() => setRole("student")}
            asChild
          >
            <Link href="/student/onboarding" className="flex items-center gap-2">
              Student
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 py-6 text-lg font-normal shadow-lg transition-all hover:shadow-xl"
            onClick={() => setRole("counselor")}
            asChild
          >
            <Link href="/counselor/dashboard">Counselor</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

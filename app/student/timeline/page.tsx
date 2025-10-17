"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/inMemoryStore"
import { formatDistanceToNow, formatDate } from "@/lib/date-utils"

const categoryStyles: Record<string, { bg: string; text: string; glow: string }> =
  {
    essays: {
      bg: "from-pink-500/70 to-fuchsia-500/70",
      text: "text-fuchsia-50",
      glow: "shadow-[0_20px_45px_-20px_rgba(217,70,239,0.8)]",
    },
    testing: {
      bg: "from-sky-500/70 to-indigo-500/70",
      text: "text-sky-50",
      glow: "shadow-[0_20px_45px_-20px_rgba(59,130,246,0.8)]",
    },
    recommendations: {
      bg: "from-emerald-500/70 to-teal-500/70",
      text: "text-emerald-50",
      glow: "shadow-[0_20px_45px_-20px_rgba(16,185,129,0.8)]",
    },
    financial: {
      bg: "from-amber-400/70 to-orange-500/70",
      text: "text-amber-50",
      glow: "shadow-[0_20px_45px_-20px_rgba(251,191,36,0.85)]",
    },
    application: {
      bg: "from-purple-500/70 to-violet-500/70",
      text: "text-purple-50",
      glow: "shadow-[0_20px_45px_-20px_rgba(168,85,247,0.85)]",
    },
  }

export default function TimelinePage() {
  const router = useRouter()
  const studentOnboarded = useAppStore((state) => state.studentOnboarded)
  const tasks = useAppStore((state) => state.tasks)
  const generateDemoTasks = useAppStore((state) => state.generateDemoTasks)
  const toggleTask = useAppStore((state) => state.toggleTask)

  const [focusedTask, setFocusedTask] = useState<string | null>(null)

  useEffect(() => {
    if (!studentOnboarded) {
      router.push("/student/onboarding")
    }
  }, [studentOnboarded, router])

  const sortedTasks = useMemo(() => {
    const dated = tasks.filter((task) => task.dueDate)
    const undated = tasks.filter((task) => !task.dueDate)

    dated.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

    return [...dated, ...undated]
  }, [tasks])

  if (!studentOnboarded) {
    return null
  }

  if (!sortedTasks.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Timeline</h1>
          <p className="mt-2 text-muted-foreground">
            Visualize your college application journey.
          </p>
        </div>

        <Card className="rounded-3xl border-dashed border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-2xl font-semibold">
              Your timeline is blank (for now)
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Import your fit overview or add a school to spin up milestones in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-base shadow-xl"
              onClick={generateDemoTasks}
            >
              Generate from Fit Overview
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
              Add a milestone
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const remaining = sortedTasks.filter((task) => !task.completed).length

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Timeline</h1>
          <p className="mt-1 text-muted-foreground">
            {remaining} {remaining === 1 ? "task" : "tasks"} in progress
          </p>
        </div>
        <Button variant="outline" className="rounded-full px-6">
          Track counselor feedback
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background/90 to-muted/40 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_70%_0,rgba(236,72,153,0.12),transparent_40%)]" />

        <div className="overflow-x-auto pb-10 pt-12">
          <div className="relative flex min-w-max gap-12 px-10 pb-6">
            <div className="pointer-events-none absolute left-12 right-12 top-[112px] h-[3px] rounded-full bg-gradient-to-r from-primary/10 via-primary/60 to-primary/10 blur-[0.5px]" />

            {sortedTasks.map((task, index) => {
              const isFocused = focusedTask === task.id
              const category = task.category ? categoryStyles[task.category] ?? null : null
              const gradientClass = category ? `bg-gradient-to-br ${category.bg}` : "bg-primary"
              const glowClass = category ? category.glow : "shadow-[0_20px_45px_-20px_rgba(37,99,235,0.75)]"

              return (
                <div
                  key={task.id}
                  className="group relative flex flex-col items-center gap-6"
                  onMouseEnter={() => setFocusedTask(task.id)}
                  onMouseLeave={() => setFocusedTask(null)}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {task.dueDate ? formatDate(new Date(task.dueDate)) : "To be determined"}
                    </span>
                    <span className="text-xs text-primary/80">
                      {task.dueDate ? formatDistanceToNow(new Date(task.dueDate)) : "Add due date"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`relative flex size-12 items-center justify-center rounded-full border-[3px] border-background/90 transition-all duration-300 ease-out ${gradientClass} ${
                      isFocused ? "scale-110" : "scale-100"
                    } ${task.completed ? "opacity-60 grayscale" : "opacity-100"}`}
                  >
                    <span
                      className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                        isFocused
                          ? "opacity-100 shadow-[0_0_40px_5px_rgba(59,130,246,0.3)]"
                          : "opacity-0"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                  </button>

                  <div
                    className={`relative flex w-[240px] flex-col gap-4 rounded-3xl border border-border/70 bg-card/95 p-5 text-left transition-all duration-300 ease-out backdrop-blur-md sm:w-[280px] ${
                      isFocused
                        ? `-translate-y-3 scale-[1.05] border-primary/50 ${glowClass}`
                        : "translate-y-0 scale-100 shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-sm font-semibold leading-tight ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {task.description ?? "Add detail so Future You knows exactly what to do."}
                        </p>
                      </div>
                      {task.category && (
                        <Badge
                          variant="secondary"
                          className="rounded-full border border-border/60 bg-muted/70 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground"
                        >
                          {task.category}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {task.source && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1">
                          <ChevronRight className="size-3" />
                          {task.source}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1">
                        {task.completed ? "Done (celebrate!)" : "On your radar"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 rounded-full text-xs"
                        variant={task.completed ? "secondary" : "default"}
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.completed ? "Undo complete" : "Mark complete"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                      >
                        Nudge me
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="relative flex flex-col items-center justify-start pt-10">
              <div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-background/80 text-primary shadow-inner backdrop-blur">
                <Plus className="size-5" />
              </div>
              <p className="mt-4 max-w-[200px] text-center text-xs text-muted-foreground">
                Drop your next milestone here once Explore adds a school.
              </p>
            </div>
          </div>
        </div>

        <div className="pb-6 text-center text-xs text-muted-foreground">
          Pro tip: drag horizontally or pinch zoom to skim the rest of your season.
        </div>
      </div>
    </div>
  )
}

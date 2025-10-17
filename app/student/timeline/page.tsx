"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, Calendar } from "lucide-react"

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
import { formatDistanceToNow } from "@/lib/date-utils"

export default function TimelinePage() {
  const router = useRouter()
  const studentOnboarded = useAppStore((state) => state.studentOnboarded)
  const tasks = useAppStore((state) => state.tasks)
  const generateDemoTasks = useAppStore((state) => state.generateDemoTasks)
  const toggleTask = useAppStore((state) => state.toggleTask)
  const fitOverview = useAppStore((state) => state.fitOverview)

  useEffect(() => {
    if (!studentOnboarded) {
      router.push("/student/onboarding")
    }
  }, [studentOnboarded, router])

  if (!studentOnboarded) {
    return null
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Timeline</h1>
          <p className="mt-2 text-muted-foreground">
            Track your milestones and deadlines in one place.
          </p>
        </div>

        <Card className="rounded-2xl border-dashed border-primary/30 bg-primary/5 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="size-8 text-primary" />
            </div>
            <CardTitle>No tasks yet</CardTitle>
            <CardDescription className="text-base">
              Add a school in Explore or generate tasks from your fit overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              size="lg"
              className="rounded-xl px-8 shadow-md"
              onClick={generateDemoTasks}
            >
              Generate from Fit Overview
            </Button>
          </CardContent>
        </Card>

        {fitOverview && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your Fit Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-2xl border-primary/40 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm text-primary">Reach</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {fitOverview.reach.map((school) => (
                    <Badge
                      key={school.id}
                      variant="outline"
                      className="w-full justify-start rounded-lg border-primary/40 px-3 py-2 text-sm"
                    >
                      {school.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-blue-500/40 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-sm text-blue-600">Target</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {fitOverview.target.map((school) => (
                    <Badge
                      key={school.id}
                      variant="outline"
                      className="w-full justify-start rounded-lg border-blue-500/40 px-3 py-2 text-sm text-blue-600"
                    >
                      {school.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-green-500/40 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-sm text-green-600">Safety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {fitOverview.safety.map((school) => (
                    <Badge
                      key={school.id}
                      variant="outline"
                      className="w-full justify-start rounded-lg border-green-500/40 px-3 py-2 text-sm text-green-600"
                    >
                      {school.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    )
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const categoryColors: Record<string, string> = {
    essays: "bg-purple-500/10 text-purple-600 border-purple-500/40",
    testing: "bg-blue-500/10 text-blue-600 border-blue-500/40",
    recommendations: "bg-green-500/10 text-green-600 border-green-500/40",
    financial: "bg-yellow-500/10 text-yellow-600 border-yellow-500/40",
    application: "bg-pink-500/10 text-pink-600 border-pink-500/40",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Timeline</h1>
          <p className="mt-2 text-muted-foreground">
            {tasks.filter((t) => !t.completed).length} tasks remaining
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" asChild>
          <a href="/student/calendar">Switch to Calendar</a>
        </Button>
      </div>

      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <Card
            key={task.id}
            className={`rounded-2xl transition-all ${
              task.completed
                ? "border-muted bg-muted/40 opacity-60"
                : "border-border bg-card shadow-md hover:shadow-lg"
            }`}
          >
            <CardHeader className="flex-row items-start gap-4 space-y-0">
              <button
                onClick={() => toggleTask(task.id)}
                className="mt-1 transition-transform hover:scale-110"
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
              >
                {task.completed ? (
                  <CheckCircle2 className="size-6 text-primary" />
                ) : (
                  <Circle className="size-6 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle
                    className={`text-lg ${task.completed ? "line-through" : ""}`}
                  >
                    {task.title}
                  </CardTitle>
                  {task.dueDate && (
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs font-normal"
                    >
                      {formatDistanceToNow(new Date(task.dueDate))}
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <CardDescription>{task.description}</CardDescription>
                )}
                <div className="flex flex-wrap gap-2">
                  {task.category && (
                    <Badge
                      variant="outline"
                      className={`rounded-lg text-xs ${
                        categoryColors[task.category] || ""
                      }`}
                    >
                      {task.category}
                    </Badge>
                  )}
                  {task.source && (
                    <Badge variant="secondary" className="rounded-lg text-xs">
                      {task.source}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

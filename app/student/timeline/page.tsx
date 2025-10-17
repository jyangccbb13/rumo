"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

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

export default function TimelinePage() {
  const router = useRouter()
  const studentOnboarded = useAppStore((state) => state.studentOnboarded)
  const tasks = useAppStore((state) => state.tasks)
  const generateDemoTasks = useAppStore((state) => state.generateDemoTasks)
  const toggleTask = useAppStore((state) => state.toggleTask)

  const [hoveredTask, setHoveredTask] = useState<string | null>(null)

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
            Visualize your college application journey.
          </p>
        </div>

        <Card className="rounded-2xl border-dashed border-primary/30 bg-primary/5 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>No tasks yet</CardTitle>
            <CardDescription className="text-base">
              Generate tasks to see your application timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              size="lg"
              className="rounded-xl px-8 shadow-md"
              onClick={generateDemoTasks}
            >
              Generate Timeline
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sort tasks by due date
  const sortedTasks = [...tasks]
    .filter((t) => t.dueDate)
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  const categoryColors: Record<string, string> = {
    essays: "bg-purple-500",
    testing: "bg-blue-500",
    recommendations: "bg-green-500",
    financial: "bg-yellow-500",
    application: "bg-pink-500",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Timeline</h1>
        <p className="mt-2 text-muted-foreground">
          {tasks.filter((t) => !t.completed).length} tasks remaining
        </p>
      </div>

      {/* Horizontal scrollable timeline */}
      <div className="relative">
        <div className="overflow-x-auto pb-8">
          <div className="relative flex min-w-max gap-8 px-4">
            {/* Timeline line */}
            <div className="absolute left-0 right-0 top-12 h-0.5 bg-primary/30" />

            {sortedTasks.map((task, index) => {
              const isHovered = hoveredTask === task.id
              const categoryColor = task.category
                ? categoryColors[task.category]
                : "bg-primary"

              return (
                <div
                  key={task.id}
                  className="relative flex flex-col items-center"
                  style={{ minWidth: "200px" }}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  {/* Date label */}
                  <div className="mb-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      {task.dueDate && formatDate(new Date(task.dueDate))}
                    </p>
                    <p className="text-xs text-primary">
                      {task.dueDate && formatDistanceToNow(new Date(task.dueDate))}
                    </p>
                  </div>

                  {/* Timeline dot */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`relative z-10 flex size-6 items-center justify-center rounded-full border-4 border-background transition-all ${
                      task.completed
                        ? "bg-muted-foreground"
                        : categoryColor
                    } ${isHovered ? "scale-150" : "scale-100"}`}
                  >
                    {task.completed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-2 rounded-full bg-background" />
                      </div>
                    )}
                  </button>

                  {/* Task title below dot */}
                  <div className="mt-4 w-48 text-center">
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {task.title.length > 40
                        ? `${task.title.slice(0, 40)}...`
                        : task.title}
                    </p>
                    {task.category && (
                      <Badge
                        variant="secondary"
                        className="mt-2 rounded-lg text-xs"
                      >
                        {task.category}
                      </Badge>
                    )}
                  </div>

                  {/* Hover card with details */}
                  {isHovered && (
                    <Card
                      className="absolute top-full z-20 mt-8 w-72 rounded-2xl border-primary/40 bg-card shadow-2xl"
                      style={{ animation: "fadeIn 0.2s ease-in-out" }}
                    >
                      <CardHeader className="space-y-2">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        {task.description && (
                          <CardDescription className="text-sm">
                            {task.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {task.category && (
                            <Badge
                              className={`rounded-lg text-xs text-white ${categoryColor}`}
                            >
                              {task.category}
                            </Badge>
                          )}
                          {task.source && (
                            <Badge variant="outline" className="rounded-lg text-xs">
                              {task.source}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={task.completed ? "outline" : "default"}
                          className="w-full rounded-xl"
                          onClick={() => toggleTask(task.id)}
                        >
                          {task.completed ? "Mark Incomplete" : "Mark Complete"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            })}

            {/* Add new task button */}
            <div
              className="relative flex flex-col items-center"
              style={{ minWidth: "200px" }}
            >
              <div className="mb-4 h-8" />
              <button className="relative z-10 flex size-6 items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-background transition-all hover:scale-125">
                <Plus className="size-4 text-primary" />
              </button>
              <p className="mt-4 text-sm text-muted-foreground">Add milestone</p>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <p className="text-center text-xs text-muted-foreground">
          Scroll horizontally to view all milestones
        </p>
      </div>
    </div>
  )
}

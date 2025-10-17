"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon } from "lucide-react"

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

export default function CalendarPage() {
  const router = useRouter()
  const studentOnboarded = useAppStore((state) => state.studentOnboarded)
  const tasks = useAppStore((state) => state.tasks)
  const generateDemoTasks = useAppStore((state) => state.generateDemoTasks)

  useEffect(() => {
    if (!studentOnboarded) {
      router.push("/student/onboarding")
    }
  }, [studentOnboarded, router])

  const today = useMemo(() => new Date(), [])
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {}
    tasks.forEach((task) => {
      if (task.dueDate) {
        const date = new Date(task.dueDate)
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        if (!map[key]) map[key] = []
        map[key].push(task)
      }
    })
    return map
  }, [tasks])

  if (!studentOnboarded) {
    return null
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Calendar</h1>
          <p className="mt-2 text-muted-foreground">
            View your deadlines and milestones in a month grid.
          </p>
        </div>

        <Card className="rounded-2xl border-dashed border-primary/30 bg-primary/5 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <CalendarIcon className="size-8 text-primary" />
            </div>
            <CardTitle>No tasks yet</CardTitle>
            <CardDescription className="text-base">
              Generate tasks from your fit overview to populate your calendar.
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
      </div>
    )
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const days = []
  // Empty cells for days before the first of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-24 rounded-xl bg-muted/40" />)
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const key = `${currentYear}-${currentMonth}-${day}`
    const dayTasks = tasksByDate[key] || []
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()

    days.push(
      <div
        key={day}
        className={`min-h-24 rounded-xl border p-2 ${
          isToday
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border bg-card"
        }`}
      >
        <div
          className={`mb-2 text-sm font-semibold ${
            isToday ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {day}
        </div>
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map((task) => (
            <Badge
              key={task.id}
              variant="secondary"
              className="w-full justify-start truncate rounded-lg px-2 py-1 text-xs"
            >
              {task.title.length > 20
                ? `${task.title.slice(0, 20)}...`
                : task.title}
            </Badge>
          ))}
          {dayTasks.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayTasks.length - 3} more
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Calendar</h1>
          <p className="mt-2 text-lg text-muted-foreground">{monthName}</p>
        </div>
        <Button variant="outline" className="rounded-xl" asChild>
          <a href="/student/timeline">Switch to Timeline</a>
        </Button>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-muted-foreground">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">{days}</div>
        </CardContent>
      </Card>
    </div>
  )
}

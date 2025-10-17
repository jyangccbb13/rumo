"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ListChecks, Target, Sparkles, Clock, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/inMemoryStore"
import { formatDate, formatDistanceToNow } from "@/lib/date-utils"

export default function CounselorStudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const counselorStudents = useAppStore((state) => state.counselorStudents)
  const student = counselorStudents.find((s) => s.id === studentId)

  if (!student) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="rounded-xl"
          onClick={() => router.push("/counselor/dashboard")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Student not found</CardTitle>
            <CardDescription>
              This student does not exist or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  function getStatusColor(progress: number) {
    if (progress >= 0.7) return "text-green-600"
    if (progress >= 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        className="rounded-xl"
        onClick={() => router.push("/counselor/dashboard")}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Dashboard
      </Button>

      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary/10 text-xl text-primary">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                {student.nextDeadline && (
                  <CardDescription className="flex items-center gap-2 text-base">
                    <Clock className="size-4 text-primary" />
                    Next deadline: {student.nextDeadline}
                  </CardDescription>
                )}
                <div className="flex flex-wrap gap-2">
                  {student.targetSchools.map((school) => (
                    <Badge key={school} variant="secondary" className="rounded-full text-xs">
                      {school}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`rounded-full px-4 py-2 text-sm ${getStatusColor(student.progress)}`}
            >
              {Math.round(student.progress * 100)}% complete
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">
                {Math.round(student.progress * 100)}%
              </span>
            </div>
            <Progress value={student.progress * 100} className="h-3" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/50 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Target className="size-4" />
                Fit goal
              </div>
              <p className="text-sm text-foreground">{student.fitGoal}</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/50 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock className="size-4" />
                Last touchpoint
              </div>
              <p className="text-sm text-foreground">{student.lastTouchpoint}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <ListChecks className="mt-1 size-4 text-primary" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    This week&apos;s top moves
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {student.topPriorities.map((priority) => (
                      <li key={priority} className="leading-tight">
                        • {priority}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 size-4 text-primary" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Standout strengths
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.standoutStrengths.map((strength) => (
                      <Badge key={strength} variant="outline" className="rounded-full text-[11px]">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI status summary
            </h3>
            <p className="text-base text-foreground">{student.statusSummary}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border/70 shadow-lg">
        <CardHeader>
          <CardTitle>Timeline + Milestones</CardTitle>
          <CardDescription>
            Read-only view compiled from student updates and counselor check-ins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-3 top-1 bottom-4 w-px bg-border" />
            {student.timeline.map((task) => {
              const dueDate = task.dueDate ? new Date(task.dueDate) : null
              const humanDue =
                dueDate != null ? `${formatDate(dueDate)} • ${formatDistanceToNow(dueDate)}` : "No due date"

              return (
                <div key={task.id} className="relative pb-8 last:pb-0">
                  <div
                    className={`absolute left-3 top-2 flex size-3.5 -translate-x-1/2 items-center justify-center rounded-full border-2 ${
                      task.completed ? "border-primary bg-primary/50" : "border-primary bg-background"
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="size-3 text-primary-foreground" />}
                  </div>
                  <div className="ml-6 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm backdrop-blur">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="rounded-full text-xs capitalize">
                          {task.category ?? "task"}
                        </Badge>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {task.source ?? "Counselor"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">{humanDue}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

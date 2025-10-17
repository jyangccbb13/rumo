"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

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
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary/10 text-xl text-primary">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                {student.nextDeadline && (
                  <CardDescription className="text-base">
                    Next deadline: {student.nextDeadline}
                  </CardDescription>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`rounded-full ${getStatusColor(student.progress)}`}
            >
              {Math.round(student.progress * 100)}% Complete
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

          <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI Status Summary
            </h3>
            <p className="text-base text-foreground">{student.statusSummary}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-dashed border-muted-foreground/40 shadow-md">
        <CardHeader>
          <CardTitle>Student Timeline (Read-Only)</CardTitle>
          <CardDescription>
            Full student timeline view will be available in Sprint 2. For now, you can
            see the summary above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-lg">
              Timeline placeholder
            </Badge>
            <Badge variant="secondary" className="rounded-lg">
              Calendar placeholder
            </Badge>
            <Badge variant="secondary" className="rounded-lg">
              Drafts placeholder
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

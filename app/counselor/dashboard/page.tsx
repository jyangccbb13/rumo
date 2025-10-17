"use client"

import { useRouter } from "next/navigation"
import { User, TrendingUp } from "lucide-react"

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

export default function CounselorDashboardPage() {
  const router = useRouter()
  const counselorStudents = useAppStore((state) => state.counselorStudents)

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
      <div>
        <h1 className="text-3xl font-semibold">Counselor Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor student progress with AI-powered insights.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {counselorStudents.map((student) => (
          <Card
            key={student.id}
            className="cursor-pointer rounded-2xl shadow-lg transition-all hover:shadow-xl"
            onClick={() => router.push(`/counselor/students/${student.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{student.name}</CardTitle>
                    {student.nextDeadline && (
                      <CardDescription className="text-sm">
                        Next deadline: {student.nextDeadline}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full text-xs ${getStatusColor(student.progress)}`}
                >
                  {Math.round(student.progress * 100)}%
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {Math.round(student.progress * 100)}%
                  </span>
                </div>
                <Progress value={student.progress * 100} className="h-2" />
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="size-4" />
                  AI Status
                </div>
                <p className="text-sm text-foreground">{student.statusSummary}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {counselorStudents.length === 0 && (
        <Card className="rounded-2xl border-dashed border-primary/30 bg-primary/5 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <User className="size-8 text-primary" />
            </div>
            <CardTitle>No students yet</CardTitle>
            <CardDescription className="text-base">
              Students will appear here once they&apos;re added to your roster.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

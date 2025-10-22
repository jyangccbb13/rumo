"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, RefreshCcw, Edit, CheckCircle2, AlertCircle, Target } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/lib/inMemoryStore"

export default function ProfilePage() {
  const router = useRouter()
  const studentProfile = useAppStore((state) => state.studentProfile)
  const updateStudentProfile = useAppStore((state) => state.updateStudentProfile)

  const [isGenerating, setIsGenerating] = useState(false)

  if (!studentProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Complete your onboarding to view your profile.
          </p>
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>No profile found</CardTitle>
            <CardDescription>
              You need to complete the onboarding questionnaire first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/student/onboarding")}
              className="rounded-xl"
            >
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profileSummary = studentProfile.profileSummary

  async function handleGenerateAnalysis() {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/student-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentProfile),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to generate analysis")
      }

      updateStudentProfile({ profileSummary: result })

      toast.success("Profile analysis generated!", {
        description: "Your AI-powered insights are ready.",
      })
    } catch (error) {
      console.error("Error generating analysis:", error)
      toast.error("Failed to generate analysis", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Student Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Your academic profile and AI-powered college assessment.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/student/onboarding")}
          className="rounded-xl"
        >
          <Edit className="mr-2 size-4" />
          Edit Profile
        </Button>
      </div>

      {/* Academic Profile Card */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Academic Profile</CardTitle>
          <CardDescription>Your stats and interests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">GPA</p>
              <p className="mt-1 text-2xl font-semibold">{studentProfile.gpa}</p>
            </div>
            {studentProfile.testScore && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Test Score</p>
                <p className="mt-1 text-2xl font-semibold">{studentProfile.testScore}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Intended Major</p>
              <p className="mt-1 text-lg font-medium">{studentProfile.intendedMajor}</p>
            </div>
            {studentProfile.budget && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="mt-1 text-lg font-medium">${studentProfile.budget.toLocaleString()}/year</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">Languages</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {studentProfile.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="rounded-full">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Extracurriculars</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {studentProfile.extracurriculars.map((activity) => (
                <Badge key={activity} variant="secondary" className="rounded-full">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Dream Schools</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {studentProfile.dreamSchools.map((school) => (
                <Badge key={school} variant="outline" className="rounded-full border-primary">
                  {school}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="mt-1 capitalize">{studentProfile.locationPreference}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Academic Style</p>
              <p className="mt-1 capitalize">{studentProfile.researchPreference?.replace("-", " ")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Campus Size</p>
              <p className="mt-1 capitalize">{studentProfile.campusSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">AI Assessment</h2>
            <p className="text-sm text-muted-foreground">
              {profileSummary
                ? `Generated ${new Date(profileSummary.generatedAt).toLocaleDateString()}`
                : "Get personalized insights about your college prospects"}
            </p>
          </div>
          <Button
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
            className="rounded-xl shadow-md"
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                {profileSummary ? "Refresh Analysis" : "Generate Analysis"}
              </>
            )}
          </Button>
        </div>

        {isGenerating && (
          <Card className="rounded-2xl border-primary/40 bg-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">AI is analyzing your profile...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </CardContent>
          </Card>
        )}

        {profileSummary && !isGenerating && (
          <>
            {/* Summary Card */}
            <Card className="rounded-2xl border-primary/40 bg-primary/5 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed">{profileSummary.summary}</p>
              </CardContent>
            </Card>

            {/* Strengths and Areas to Improve */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <CardTitle className="text-lg">Strengths</CardTitle>
                  </div>
                  <CardDescription>What makes you stand out</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {profileSummary.strengths.map((strength, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1.5 rounded-full bg-green-600" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-5 text-yellow-600" />
                    <CardTitle className="text-lg">Areas to Improve</CardTitle>
                  </div>
                  <CardDescription>Focus on these to strengthen your application</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {profileSummary.areasToImprove.map((area, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1.5 rounded-full bg-yellow-600" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* School Assessments */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  <CardTitle className="text-lg">School-by-School Assessment</CardTitle>
                </div>
                <CardDescription>
                  Realistic evaluation of your chances at your dream schools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileSummary.schoolAssessments.map((assessment, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-foreground">{assessment.school}</p>
                          <Badge
                            variant={
                              assessment.likelihood === "safety"
                                ? "secondary"
                                : assessment.likelihood === "target"
                                ? "default"
                                : "outline"
                            }
                            className="rounded-full uppercase"
                          >
                            {assessment.likelihood}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {assessment.assessment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {!profileSummary && !isGenerating && (
          <Card className="rounded-2xl border-dashed shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No analysis yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Click &quot;Generate Analysis&quot; to get AI-powered insights about your college prospects
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

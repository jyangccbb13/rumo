"use client"

import { useState } from "react"
import { Sparkles, Lightbulb } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/lib/inMemoryStore"

type Feedback = {
  strengths: string[]
  issues: string[]
  action_items: string[]
  revised_paragraph: string
}

export default function DraftsPage() {
  const drafts = useAppStore((state) => state.drafts)
  const updateDraft = useAppStore((state) => state.updateDraft)

  const [selectedDraftId, setSelectedDraftId] = useState(drafts[0]?.id || "")
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId)

  async function handleAIRevise() {
    if (!selectedDraft) return

    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetch("/api/ai/essay-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay_text: selectedDraft.content }),
      })
      const result: Feedback = await response.json()
      setFeedback(result)

      // Update draft with revised text
      updateDraft(selectedDraftId, (draft) => ({
        ...draft,
        content: result.revised_paragraph,
        updatedAt: new Date().toISOString(),
      }))

      toast.success("AI revision complete!", {
        description: "Your draft has been updated with improvements.",
      })
    } catch (error) {
      console.error("Error getting AI feedback:", error)
      toast.error("Failed to get AI feedback")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAIOutline() {
    toast.info("AI Outline", {
      description: "Outline generation coming soon in Sprint 2!",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Drafts</h1>
        <p className="mt-2 text-muted-foreground">
          Write and refine your essays with AI assistance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left sidebar - draft list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Essays
          </h2>
          {drafts.map((draft) => (
            <Card
              key={draft.id}
              className={`cursor-pointer rounded-2xl transition-all ${
                selectedDraftId === draft.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
              onClick={() => setSelectedDraftId(draft.id)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-base">{draft.title}</CardTitle>
                <CardDescription className="text-xs">
                  Updated {new Date(draft.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Right panel - editor */}
        <div className="space-y-4">
          {selectedDraft ? (
            <>
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{selectedDraft.title}</CardTitle>
                      <CardDescription>
                        Last updated{" "}
                        {new Date(selectedDraft.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={handleAIOutline}
                      >
                        <Lightbulb className="mr-2 size-4" />
                        AI Outline
                      </Button>
                      <Button
                        className="rounded-xl shadow-md"
                        onClick={handleAIRevise}
                        disabled={isLoading}
                      >
                        <Sparkles className="mr-2 size-4" />
                        {isLoading ? "Revising..." : "AI Revise"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={selectedDraft.content}
                    onChange={(e) =>
                      updateDraft(selectedDraftId, (draft) => ({
                        ...draft,
                        content: e.target.value,
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                    className="min-h-80 rounded-xl text-base leading-relaxed"
                    placeholder="Start writing your essay..."
                  />
                </CardContent>
              </Card>

              {/* Feedback panel */}
              {isLoading && (
                <Card className="rounded-2xl border-primary/40 bg-primary/5 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">AI is analyzing...</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </CardContent>
                </Card>
              )}

              {feedback && !isLoading && (
                <Card className="rounded-2xl border-primary/40 bg-primary/5 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Feedback</CardTitle>
                    <CardDescription>
                      Suggestions to strengthen your essay
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-green-600">
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {feedback.strengths.map((strength, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 size-1.5 rounded-full bg-green-600" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-600">
                        Issues to address
                      </h3>
                      <ul className="space-y-2">
                        {feedback.issues.map((issue, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 size-1.5 rounded-full bg-yellow-600" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                        Action items
                      </h3>
                      <ul className="space-y-2">
                        {feedback.action_items.map((item, i) => (
                          <li key={i}>
                            <Badge
                              variant="outline"
                              className="w-full justify-start rounded-lg border-primary/40 px-3 py-2 text-sm font-normal"
                            >
                              {item}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>No draft selected</CardTitle>
                <CardDescription>
                  Select an essay from the left to start editing.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

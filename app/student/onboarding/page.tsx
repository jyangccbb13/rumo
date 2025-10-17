"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/inMemoryStore"

type QuestionData = {
  email?: string
  curriculum?: string
  gpa?: string
  standardizedTests?: string
  testScores?: string
  retakeTests?: string
  hasCollegeList?: string
  collegeList?: string
  numSchools?: string
  extracurriculars?: string
  hasEssays?: string
  hasRecommendations?: string
  applicationTiming?: string
  majors?: string
}

const questions = [
  {
    id: "email",
    question: "Enter your email.",
    placeholder: "exceptionalstudent@yourschool.org",
    type: "email" as const,
  },
  {
    id: "curriculum",
    question: "What curriculum do you follow?",
    placeholder: "IB, AP, A-Level, Local, Other",
    type: "text" as const,
  },
  {
    id: "gpa",
    question: "What is your current GPA or average grade?",
    placeholder: "3.8 / 4.0",
    type: "text" as const,
  },
  {
    id: "standardizedTests",
    question: "Have you taken any standardized tests?",
    placeholder: "SAT, ACT, TOEFL, IELTS, Other (or type 'No')",
    type: "text" as const,
  },
  {
    id: "testScores",
    question: "If yes, what are your highest scores?",
    placeholder: "SAT: 1450, ACT: 32 (skip if N/A)",
    type: "text" as const,
  },
  {
    id: "retakeTests",
    question: "Are you planning to retake any tests?",
    placeholder: "Yes / No",
    type: "text" as const,
  },
  {
    id: "hasCollegeList",
    question: "Have you already started creating a college list?",
    placeholder: "Yes / No",
    type: "text" as const,
  },
  {
    id: "collegeList",
    question: "If yes, which colleges are you considering?",
    placeholder: "Harvard, MIT, Stanford (skip if N/A)",
    type: "textarea" as const,
  },
  {
    id: "numSchools",
    question: "How many schools are on your current list?",
    placeholder: "8",
    type: "text" as const,
  },
  {
    id: "extracurriculars",
    question: "List your main extracurricular activities.",
    placeholder: "Robotics club, Debate team, Volunteering at local hospital",
    type: "textarea" as const,
  },
  {
    id: "hasEssays",
    question: "Have you started writing your personal statement or essays?",
    placeholder: "Yes / No",
    type: "text" as const,
  },
  {
    id: "hasRecommendations",
    question: "Have you requested recommendation letters from teachers?",
    placeholder: "Yes / No",
    type: "text" as const,
  },
  {
    id: "applicationTiming",
    question: "When do you plan to start submitting applications?",
    placeholder: "Early Decision / Regular Decision / Other",
    type: "text" as const,
  },
  {
    id: "majors",
    question: "Which major(s) or fields of study are you most interested in?",
    placeholder: "Computer Science, Engineering, Business",
    type: "textarea" as const,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const setStudentOnboarded = useAppStore((state) => state.setStudentOnboarded)
  const generateDemoTasks = useAppStore((state) => state.generateDemoTasks)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuestionData>({})
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  function handleNext() {
    if (!currentAnswer.trim()) return

    setIsAnimating(true)
    setAnswers({ ...answers, [question.id]: currentAnswer })

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setCurrentAnswer("")
        setIsAnimating(false)
      } else {
        // Final submission
        handleSubmit()
      }
    }, 300)
  }

  function handleBack() {
    if (currentQuestion === 0) return

    setIsAnimating(true)
    setTimeout(() => {
      setCurrentQuestion(currentQuestion - 1)
      const prevQuestionId = questions[currentQuestion - 1].id as keyof QuestionData
      const prevAnswer = answers[prevQuestionId]
      setCurrentAnswer(prevAnswer || "")
      setIsAnimating(false)
    }, 300)
  }

  async function handleSubmit() {
    setStudentOnboarded(true)
    generateDemoTasks()
    router.push("/student/timeline")
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && question.type !== "textarea") {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question container with animation */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className={`w-full max-w-2xl space-y-8 text-center transition-all duration-300 ${
            isAnimating ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <h1 className="text-2xl font-normal text-primary md:text-3xl">
              {question.question}
            </h1>
          </div>

          <div className="space-y-6">
            {question.type === "textarea" ? (
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={question.placeholder}
                className="min-h-32 rounded-xl border-2 border-primary/20 bg-transparent px-6 py-4 text-center text-lg text-primary placeholder:text-primary/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            ) : (
              <Input
                type={question.type}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={question.placeholder}
                className="h-16 rounded-none border-0 border-b-2 border-primary bg-transparent px-0 text-center text-lg text-primary placeholder:text-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            )}

            <div className="flex items-center justify-center gap-4">
              {currentQuestion > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleBack}
                  className="group rounded-full px-6 py-6 text-base font-normal"
                >
                  <ArrowLeft className="mr-2 size-5 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                size="lg"
                onClick={handleNext}
                disabled={!currentAnswer.trim()}
                className="group rounded-full px-8 py-6 text-base font-normal shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {currentQuestion === questions.length - 1 ? (
                  "Submit"
                ) : (
                  <span className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Press Enter to continue
          </p>
        </div>
      </div>
    </div>
  )
}

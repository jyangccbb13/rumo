"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppStore } from "@/lib/inMemoryStore"

const onboardingSchema = z.object({
  countryOfOrigin: z.string().min(1, "Please select your country of origin"),
  currentGrade: z.enum(["9th", "10th", "11th", "12th"], {
    message: "Select your current grade",
  }),
  applicationCycle: z.string().min(1, "Select when you're applying to college"),
  gpa: z
    .string()
    .trim()
    .min(1, "Enter your GPA")
    .refine((value) => {
      const numeric = Number(value)
      return !Number.isNaN(numeric) && numeric >= 0 && numeric <= 4.5
    }, "GPA must be between 0.0 and 4.5"),
  testScore: z
    .string()
    .trim()
    .refine(
      (value) =>
        !value ||
        (/^\d+$/.test(value) && Number(value) >= 400 && Number(value) <= 1600),
      "Enter a composite SAT/ACT between 400-1600 (or leave blank)",
    ),
  intendedMajor: z
    .string()
    .min(2, "Share at least a working interest or major focus.")
    .max(80),
  languages: z
    .array(z.string().min(1))
    .min(1, "Add at least one language you speak."),
  extracurriculars: z
    .array(z.string().min(1))
    .min(3, "Highlight at least 3 extracurriculars.")
    .max(5, "Keep it to your top 5 for now."),
  dreamSchools: z
    .array(z.string().min(1))
    .min(1, "Drop in at least one dream school."),
  budget: z.string().trim(),
  locationPreference: z.enum(["urban", "suburban", "rural"], {
    message: "Pick a location vibe",
  }),
  researchPreference: z.enum(["research-heavy", "teaching-focused", "balanced"], {
    message: "Select what energizes you most",
  }),
  campusSize: z.enum(["small", "medium", "large"], {
    message: "Pick a campus size sweet spot",
  }),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

const stepConfig: Array<{
  title: string
  description: string
  fields: Array<keyof OnboardingValues>
}> = [
  {
    title: "Academic snapshot",
    description: "Ground the AI in your stats and interests.",
    fields: ["countryOfOrigin", "currentGrade", "applicationCycle", "gpa", "testScore", "intendedMajor", "languages"],
  },
  {
    title: "Story + dreams",
    description: "Curate the highlights you want in your college narrative.",
    fields: ["extracurriculars", "dreamSchools"],
  },
  {
    title: "Preferences",
    description: "Tell us how you want college to feel.",
    fields: ["budget", "locationPreference", "researchPreference", "campusSize"],
  },
]

const commonCountries = [
  "United States",
  "China",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "South Korea",
  "Japan",
  "Mexico",
  "Brazil",
  "Italy",
  "Spain",
  "Netherlands",
  "Singapore",
  "Switzerland",
  "Sweden",
  "Other",
]

const gradeOptions = [
  { label: "9th grade (Freshman)", value: "9th" },
  { label: "10th grade (Sophomore)", value: "10th" },
  { label: "11th grade (Junior)", value: "11th" },
  { label: "12th grade (Senior)", value: "12th" },
] as const

const applicationCycles = [
  "Fall 2025",
  "Fall 2026",
  "Fall 2027",
  "Fall 2028",
  "Fall 2029",
]

const preferenceChips = {
  locationPreference: [
    { label: "Urban energy", value: "urban" },
    { label: "Suburban balance", value: "suburban" },
    { label: "Quiet + rural", value: "rural" },
  ] as const,
  researchPreference: [
    { label: "Labs + breakthroughs", value: "research-heavy" },
    { label: "Teaching-forward", value: "teaching-focused" },
    { label: "Balanced mix", value: "balanced" },
  ] as const,
  campusSize: [
    { label: "Small (<5k)", value: "small" },
    { label: "Medium (5-15k)", value: "medium" },
    { label: "Large (>15k)", value: "large" },
  ] as const,
}

function TagInput({
  label,
  description,
  placeholder,
  name,
  control,
  maxTags,
}: {
  label: string
  description?: string
  placeholder: string
  name: keyof OnboardingValues
  control: ReturnType<typeof useForm<OnboardingValues>>["control"]
  maxTags?: number
}) {
  const [rawValue, setRawValue] = useState("")

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const values = Array.isArray(field.value) ? field.value : []

        const addTag = (tagValue: string) => {
          const trimmed = tagValue.trim()
          if (!trimmed || values.includes(trimmed)) return
          if (maxTags && values.length >= maxTags) {
            toast.info("Limit reached", { description: `Keep it to ${maxTags} for now.` })
            return
          }
          field.onChange([...values, trimmed])
          setRawValue("")
        }

        const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault()
            addTag(rawValue)
          } else if (event.key === "Backspace" && !rawValue && values.length) {
            event.preventDefault()
            const updated = [...values]
            updated.pop()
            field.onChange(updated)
          }
        }

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
            <FormControl>
              <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/70 px-3 py-2">
                {values.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full bg-muted/80 text-xs text-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        field.onChange(values.filter((existing) => existing !== tag))
                      }
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <input
                  value={rawValue}
                  onChange={(event) => setRawValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const setStudentOnboarded = useAppStore((state) => state.setStudentOnboarded)
  const setStudentProfile = useAppStore((state) => state.setStudentProfile)
  const setFitOverview = useAppStore((state) => state.setFitOverview)
  const generateDemoTasks = useAppStore((state) => state.generateDemoTasks)
  const fitOverview = useAppStore((state) => state.fitOverview)

  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      countryOfOrigin: "",
      currentGrade: "11th",
      applicationCycle: "",
      gpa: "3.6",
      testScore: "",
      intendedMajor: "",
      languages: [],
      extracurriculars: [],
      dreamSchools: [],
      budget: "",
      locationPreference: "urban",
      researchPreference: "balanced",
      campusSize: "medium",
    },
    mode: "onChange",
  })

  const watchedMajor = (useWatch({ control: form.control, name: "intendedMajor" }) ?? "").trim()

  const handleNext = async () => {
    const fields = stepConfig[step]?.fields ?? []
    const valid = await form.trigger(fields, { shouldFocus: true })
    if (!valid) return
    setStep((prev) => Math.min(prev + 1, stepConfig.length - 1))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const onSubmit = async (values: OnboardingValues) => {
    setIsSubmitting(true)
    try {
      const trimmedMajor = values.intendedMajor.trim()
      const languageList = values.languages.map((entry) => entry.trim()).filter(Boolean)
      const activityList = values.extracurriculars.map((entry) => entry.trim()).filter(Boolean)
      const dreamList = values.dreamSchools.map((entry) => entry.trim()).filter(Boolean)
      const numericGpa = Number(values.gpa)
      const normalizedTestScore = values.testScore.trim()
      const numericTestScore =
        normalizedTestScore.length > 0 ? Number(normalizedTestScore) : undefined
      const normalizedBudget = values.budget.trim()
      const numericBudget =
        normalizedBudget.length > 0
          ? Number(normalizedBudget.replace(/[^0-9.]/g, ""))
          : undefined

      const payload = {
        gpa: numericGpa,
        testScore: numericTestScore,
        intendedMajor: trimmedMajor,
        languages: languageList,
        extracurriculars: activityList,
        dreamSchools: dreamList,
        budget: numericBudget,
        locationPreference: values.locationPreference,
        researchPreference: values.researchPreference,
        campusSize: values.campusSize,
      }

      setStudentProfile({
        countryOfOrigin: values.countryOfOrigin,
        currentGrade: values.currentGrade,
        applicationCycle: values.applicationCycle,
        gpa: payload.gpa,
        testScore: payload.testScore ?? null,
        intendedMajor: payload.intendedMajor,
        languages: payload.languages,
        extracurriculars: payload.extracurriculars,
        dreamSchools: payload.dreamSchools,
        budget: payload.budget,
        locationPreference: values.locationPreference,
        researchPreference: values.researchPreference,
        campusSize: values.campusSize,
      })

      const response = await fetch("/api/ai/fit-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Could not generate fit overview")
      }
      const overview = await response.json()
      setFitOverview(overview)
      setShowConfirmation(true)
      toast.success("Fit overview generated", {
        description: "We mapped your reach, target, and safety schools.",
      })
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong", {
        description: "Try again or come back in a few minutes.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateTimeline = () => {
    generateDemoTasks()
    setStudentOnboarded(true)
    router.push("/student/timeline")
  }

  const progress = useMemo(
    () => ((step + (showConfirmation ? 1 : 0)) / (stepConfig.length + 1)) * 100,
    [step, showConfirmation]
  )

  if (showConfirmation && fitOverview) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 py-10">
        <div className="text-center">
          <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
            Intake complete
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold">
            Your match map is ready, {watchedMajor ? `future ${watchedMajor}` : "let&apos;s go"}.
          </h1>
          <p className="mt-2 text-muted-foreground">
            We blended your stats, interests, and campus vibe to outline a smart application mix.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {(["reach", "target", "safety"] as const).map((tier) => (
            <Card key={tier} className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-xl backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              <CardHeader>
                <Badge variant="outline" className="w-fit rounded-full uppercase tracking-widest">
                  {tier}
                </Badge>
                <CardTitle className="text-xl capitalize">{tier} schools</CardTitle>
                <CardDescription>
                  {tier === "reach" && "Ambitious but worth the shot."}
                  {tier === "target" && "Your most realistic wins."}
                  {tier === "safety" && "Secure options that still excite you."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fitOverview[tier].map((school: { id: string; name: string; rationale: string }) => (
                  <div
                    key={school.id}
                    className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm"
                  >
                    <p className="font-medium text-foreground">{school.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{school.rationale}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl border border-primary/30 bg-primary/10 shadow-2xl">
          <CardContent className="flex flex-col gap-4 p-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div>
              <h2 className="text-xl font-semibold text-primary">
                Ready to spin up your personalized timeline?
              </h2>
              <p className="text-muted-foreground">
                We&apos;ll auto-generate milestone tasks for your new mix. You can tweak everything later.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={() => router.push("/student/explore")}
              >
                Explore more schools
              </Button>
              <Button className="rounded-full px-8 py-6 text-base shadow-lg" onClick={handleGenerateTimeline}>
                Generate my timeline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 py-10">
      <div className="space-y-3 text-center">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          rumbo intake
        </Badge>
        <h1 className="text-3xl font-semibold">Let&apos;s personalize your college journey</h1>
        <p className="text-muted-foreground">
          3 quick screens to brief the AI: stats, story, and fit preferences.
        </p>
      </div>

      <div className="relative">
        <div className="h-2 w-full rounded-full bg-muted" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {step + 1}
            </span>
            <div>
              <CardTitle className="text-2xl font-semibold">
                {stepConfig[step]?.title}
              </CardTitle>
              <CardDescription>{stepConfig[step]?.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-10">
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              {step === 0 && (
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="countryOfOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of origin</FormLabel>
                        <FormDescription>Where are you from?</FormDescription>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commonCountries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current grade</FormLabel>
                        <FormDescription>What year are you in?</FormDescription>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select your grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gradeOptions.map((grade) => (
                              <SelectItem key={grade.value} value={grade.value}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicationCycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application cycle</FormLabel>
                        <FormDescription>When are you applying to college?</FormDescription>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select application cycle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {applicationCycles.map((cycle) => (
                              <SelectItem key={cycle} value={cycle}>
                                {cycle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current GPA</FormLabel>
                        <FormDescription>Round to the nearest hundredth (weighted is fine).</FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            min={0}
                            max={4.5}
                            className="rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SAT / ACT composite</FormLabel>
                        <FormDescription>Optional, but it helps us calibrate reach.</FormDescription>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="e.g. 1490"
                            className="rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intendedMajor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intended major / focus area</FormLabel>
                        <FormDescription>It&apos;s okay if this is fluid—just share your vibe.</FormDescription>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Computer science, bioengineering, international relations..."
                            className="rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <TagInput
                    control={form.control}
                    name="languages"
                    label="Languages you speak"
                    description="Press Enter after each language. Include heritage or sign languages too."
                    placeholder="English"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-6">
                  <TagInput
                    control={form.control}
                    name="extracurriculars"
                    label="Top extracurriculars"
                    description="Give us the headlines—leadership roles, passion projects, or standout initiatives."
                    placeholder="Varsity robotics captain"
                    maxTags={5}
                  />
                  <TagInput
                    control={form.control}
                    name="dreamSchools"
                    label="Dream schools"
                    description="Schools you can absolutely see yourself at."
                    placeholder="Harvard University"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family budget (optional)</FormLabel>
                        <FormDescription>
                          Ballpark total cost per year you&apos;re targeting. Leave blank if it&apos;s still TBD.
                        </FormDescription>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="40000"
                            className="rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="locationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location vibe</FormLabel>
                          <div className="mt-3 space-y-2">
                            {preferenceChips.locationPreference.map((option) => (
                              <Button
                                key={option.value}
                                type="button"
                                variant={field.value === option.value ? "default" : "outline"}
                                className="w-full justify-start rounded-2xl"
                                onClick={() => field.onChange(option.value)}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="researchPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic energy</FormLabel>
                          <div className="mt-3 space-y-2">
                            {preferenceChips.researchPreference.map((option) => (
                              <Button
                                key={option.value}
                                type="button"
                                variant={field.value === option.value ? "default" : "outline"}
                                className="w-full justify-start rounded-2xl"
                                onClick={() => field.onChange(option.value)}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="campusSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campus size</FormLabel>
                          <div className="mt-3 space-y-2">
                            {preferenceChips.campusSize.map((option) => (
                              <Button
                                key={option.value}
                                type="button"
                                variant={field.value === option.value ? "default" : "outline"}
                                className="w-full justify-start rounded-2xl"
                                onClick={() => field.onChange(option.value)}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={step === 0 ? () => router.push("/student/timeline") : handleBack}
                  className="rounded-full px-6"
                >
                  <ArrowLeft className="mr-2 size-4" />
                  {step === 0 ? "Exit onboarding" : "Back"}
                </Button>

                {step < stepConfig.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="rounded-full px-6"
                  >
                    Next
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                )}

                {step === stepConfig.length - 1 && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full px-8 py-6 text-base shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Generating overview...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 size-4" />
                        Generate fit overview
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 text-primary" />
        You can always tweak this later. rumo keeps your responses locally for the demo.
      </div>
    </div>
  )
}

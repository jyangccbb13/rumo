import { create } from "zustand"
import { nanoid } from "nanoid"

export type Role = "student" | "counselor"

export type ProfileSummary = {
  summary: string
  strengths: string[]
  areasToImprove: string[]
  schoolAssessments: {
    school: string
    likelihood: "reach" | "target" | "safety"
    assessment: string
  }[]
  generatedAt: string
}

export type StudentProfile = {
  gpa: number
  testScore?: number | null
  intendedMajor: string
  languages: string[]
  extracurriculars: string[]
  dreamSchools: string[]
  budget?: number | null
  locationPreference: "urban" | "suburban" | "rural" | null
  researchPreference: "research-heavy" | "teaching-focused" | "balanced" | null
  campusSize: "small" | "medium" | "large" | null
  profileSummary?: ProfileSummary | null
}

export type FitSchool = {
  id: string
  name: string
  rationale: string
}

export type FitOverview = {
  reach: FitSchool[]
  target: FitSchool[]
  safety: FitSchool[]
}

export type Task = {
  id: string
  title: string
  dueDate?: string
  description?: string
  category?: "essays" | "testing" | "recommendations" | "financial" | "application"
  source?: string
  completed: boolean
}

export type Draft = {
  id: string
  title: string
  content: string
  updatedAt: string
}

export type School = {
  id: string
  name: string
  shortName?: string
  country?: string
  city?: string
  state?: string | null
  acceptanceRate?: string
  tuition?: number
  internationalTuition?: number
  ranking?: number | null
  worldRanking?: number | null
  programs?: string[]
  internationalStudents?: string
  applicationDeadline?: string
  requiredTests?: string[]
  averageSAT?: number | null
  averageGPA?: number | null
  undergraduateEnrollment?: number | null
  graduationRate?: string
  employmentRate?: string
  scholarships?: boolean
  needBlindAdmission?: boolean
  website?: string
  source?: "curated" | "college-scorecard" | "ai-generated"
  // Legacy fields for backwards compatibility
  location?: string
  avgNetPrice?: string
  satRange?: string
  studentFacultyRatio?: string
  size?: string
  url?: string
  focus?: string
}

export type AlertType = "deadline" | "status" | "info"

export type Alert = {
  id: string
  type: AlertType
  message: string
  createdAt: string
}

export type CounselorStudent = {
  id: string
  name: string
  progress: number
  nextDeadline?: string
  statusSummary: string
  fitGoal: string
  targetSchools: string[]
  topPriorities: string[]
  standoutStrengths: string[]
  timeline: Task[]
  lastTouchpoint: string
}

type AppState = {
  role: Role
  setRole: (role: Role) => void
  studentOnboarded: boolean
  setStudentOnboarded: (value: boolean) => void
  studentProfile?: StudentProfile
  setStudentProfile: (profile: StudentProfile) => void
  updateStudentProfile: (updates: Partial<StudentProfile>) => void
  fitOverview?: FitOverview
  setFitOverview: (fit: FitOverview) => void
  tasks: Task[]
  generateDemoTasks: () => void
  toggleTask: (taskId: string) => void
  resetTasks: () => void
  schools: School[]
  addSchool: (school: School) => void
  drafts: Draft[]
  updateDraft: (draftId: string, updater: (draft: Draft) => Draft) => void
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, "id" | "createdAt">) => void
  clearAlerts: () => void
  counselorStudents: CounselorStudent[]
  setCounselorStatus: (studentId: string, summary: string, progress?: number, nextDeadline?: string) => void
}

const initialDrafts: Draft[] = [
  {
    id: "personal-statement",
    title: "Personal Statement",
    content:
      "I grew up straddling two worlds. At home, Portuguese phrases floated through the kitchen. At school, I translated for classmates whose families had just arrived. I fell in love with the quiet power of making people feel understood.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "supplement-1",
    title: "Supplement #1",
    content: "I remember the first time I stepped into the robotics lab...",
    updatedAt: new Date().toISOString(),
  },
]

const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const initialCounselorStudents: CounselorStudent[] = [
  {
    id: "amelia-r",
    name: "Amelia Rodrigues",
    progress: 0.42,
    nextDeadline: "Apr 12",
    statusSummary: "Monitoring essay pace; Harvard supplements still in draft.",
    fitGoal: "Combine CS and human-centered design at an East Coast research hub.",
    targetSchools: ["Harvard", "MIT", "Stanford"],
    topPriorities: ["Finalize Harvard 'why us' essay", "Storyboard MIT maker portfolio video"],
    standoutStrengths: ["Leadership in robotics", "Bilingual community liaison"],
    timeline: [
      {
        id: nanoid(),
        title: "Harvard supplement #2 — love of learning",
        description: "Tighten narrative arc and add mentor quote.",
        dueDate: daysFromNow(6),
        category: "essays",
        source: "Harvard",
        completed: false,
      },
      {
        id: nanoid(),
        title: "MIT maker portfolio: prototype video",
        description: "60-second voiceover with build footage.",
        dueDate: daysFromNow(9),
        category: "application",
        source: "MIT",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Design teacher recommendation follow-up",
        description: "Send thank-you + remind about deadline.",
        dueDate: daysFromNow(-2),
        category: "recommendations",
        source: "Counselor",
        completed: true,
      },
      {
        id: nanoid(),
        title: "Portfolio feedback session",
        description: "Review storyboard with counselor.",
        dueDate: daysFromNow(3),
        category: "essays",
        source: "Counselor",
        completed: false,
      },
    ],
    lastTouchpoint: "Sat down 3 days ago to review MIT maker brief.",
  },
  {
    id: "devon-m",
    name: "Devon Martinez",
    progress: 0.68,
    nextDeadline: "Mar 28",
    statusSummary: "On track for UCLA. Watch financial aid paperwork for Berkeley.",
    fitGoal: "Film & media production programs with strong internship pipelines.",
    targetSchools: ["UCLA", "USC", "UC Berkeley"],
    topPriorities: ["Lock USC cinematic arts supplement", "Upload film reel to portfolio portal"],
    standoutStrengths: ["Regional film festival winner", "Peer mentoring"],
    timeline: [
      {
        id: nanoid(),
        title: "UCLA personal insight #4 polish",
        description: "Sharpen closing sentence and add impact metric.",
        dueDate: daysFromNow(4),
        category: "essays",
        source: "UCLA",
        completed: false,
      },
      {
        id: nanoid(),
        title: "USC film reel upload + captions",
        description: "Include director’s note and transcript.",
        dueDate: daysFromNow(7),
        category: "application",
        source: "USC",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Financial aid document scan",
        description: "Collect verification docs for Berkeley portal.",
        dueDate: daysFromNow(11),
        category: "financial",
        source: "Family",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Common App activities refresh",
        description: "Update film club impact statements.",
        dueDate: daysFromNow(-1),
        category: "application",
        source: "Common App",
        completed: true,
      },
    ],
    lastTouchpoint: "Called last night; confirmed portfolio edits complete.",
  },
  {
    id: "priya-s",
    name: "Priya Singh",
    progress: 0.54,
    nextDeadline: "Apr 3",
    statusSummary: "Need momentum on Johns Hopkins research supplement.",
    fitGoal: "Pre-med track with computational biology opportunities.",
    targetSchools: ["Johns Hopkins", "Brown", "UMich"],
    topPriorities: ["Draft research supplement", "Confirm shadowing hours log"],
    standoutStrengths: ["Hospital volunteer 200+ hours", "Genetics summer program"],
    timeline: [
      {
        id: nanoid(),
        title: "Johns Hopkins research supplement outline",
        description: "Connect hospital volunteer work to computational interests.",
        dueDate: daysFromNow(5),
        category: "essays",
        source: "Johns Hopkins",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Brown PLME short answer",
        description: "Emphasize long-term community clinic goals.",
        dueDate: daysFromNow(9),
        category: "essays",
        source: "Brown",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Shadowing verification upload",
        description: "Upload signed hours sheet to portfolio.",
        dueDate: daysFromNow(2),
        category: "application",
        source: "Counselor",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Biology olympiad recap email",
        description: "Send blurb to recommender for letter addendum.",
        dueDate: daysFromNow(-4),
        category: "recommendations",
        source: "Teacher",
        completed: true,
      },
    ],
    lastTouchpoint: "Slack check-in yesterday; next Zoom tomorrow.",
  },
  {
    id: "leo-c",
    name: "Leo Chen",
    progress: 0.73,
    nextDeadline: "Mar 25",
    statusSummary: "Essays in good shape; awaiting MIT rec upload.",
    fitGoal: "Dual-degree options in CS and business with co-op experience.",
    targetSchools: ["MIT", "Northeastern", "Georgia Tech"],
    topPriorities: ["Confirm recommender upload", "Polish Northeastern co-op essay"],
    standoutStrengths: ["Hackathon founder", "Data science internship"],
    timeline: [
      {
        id: nanoid(),
        title: "MIT additional info upload",
        description: "Attach research poster and explanatory summary.",
        dueDate: daysFromNow(1),
        category: "application",
        source: "MIT",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Northeastern co-op supplement review",
        description: "Highlight impact from analytics internship.",
        dueDate: daysFromNow(4),
        category: "essays",
        source: "Northeastern",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Recommender check-in (AP CS teacher)",
        description: "Confirm submission through Naviance.",
        dueDate: daysFromNow(-3),
        category: "recommendations",
        source: "Counselor",
        completed: true,
      },
      {
        id: nanoid(),
        title: "Scholarship matrix update",
        description: "Log tech scholarships + deadlines.",
        dueDate: daysFromNow(12),
        category: "financial",
        source: "Counselor",
        completed: false,
      },
    ],
    lastTouchpoint: "Shared updated MIT draft this morning.",
  },
  {
    id: "sofia-a",
    name: "Sofia Alvarez",
    progress: 0.36,
    nextDeadline: "Apr 6",
    statusSummary: "Behind on art portfolio uploads — needs quick win.",
    fitGoal: "Architecture + urban studies programs with strong community design focus.",
    targetSchools: ["Cornell", "Rice", "RISD"],
    topPriorities: ["Digitize sketchbook for portfolio", "Update artist statement"],
    standoutStrengths: ["Community mural project lead", "Art studio apprenticeship"],
    timeline: [
      {
        id: nanoid(),
        title: "Portfolio photo shoot",
        description: "Capture sketchbook spreads + mural progress shots.",
        dueDate: daysFromNow(2),
        category: "application",
        source: "Portfolio",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Cornell AAP supplement draft",
        description: "Connect community design work to studio interests.",
        dueDate: daysFromNow(7),
        category: "essays",
        source: "Cornell",
        completed: false,
      },
      {
        id: nanoid(),
        title: "RISD artist statement refresh",
        description: "Add reflection on apprenticeship experience.",
        dueDate: daysFromNow(10),
        category: "essays",
        source: "RISD",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Teacher rec packet delivery",
        description: "Provide updated resume and art inventory.",
        dueDate: daysFromNow(-5),
        category: "recommendations",
        source: "Counselor",
        completed: true,
      },
    ],
    lastTouchpoint: "Met today during advisory for portfolio planning.",
  },
  {
    id: "marcus-b",
    name: "Marcus Bennett",
    progress: 0.61,
    nextDeadline: "Mar 22",
    statusSummary: "Strengthening FAFSA + scholarship pipeline.",
    fitGoal: "Business analytics with Division II basketball opportunities.",
    targetSchools: ["Bentley", "Villanova", "UNC"],
    topPriorities: ["Submit FAFSA corrections", "Prep coach outreach updates"],
    standoutStrengths: ["Varsity team captain", "Data analytics internship"],
    timeline: [
      {
        id: nanoid(),
        title: "FAFSA correction submission",
        description: "Verify parent signature and resubmit.",
        dueDate: daysFromNow(1),
        category: "financial",
        source: "Family",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Bentley coach follow-up email",
        description: "Attach highlight reel and GPA update.",
        dueDate: daysFromNow(3),
        category: "application",
        source: "Athletics",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Villanova supplement final proof",
        description: "Tighten leadership anecdote conclusion.",
        dueDate: daysFromNow(-2),
        category: "essays",
        source: "Villanova",
        completed: true,
      },
      {
        id: nanoid(),
        title: "Scholarship spreadsheet refresh",
        description: "Add 3 new local scholarship options.",
        dueDate: daysFromNow(8),
        category: "financial",
        source: "Counselor",
        completed: false,
      },
    ],
    lastTouchpoint: "Coach call recap logged yesterday evening.",
  },
  {
    id: "lina-c",
    name: "Lina Chang",
    progress: 0.48,
    nextDeadline: "Apr 1",
    statusSummary: "ACT retake prep underway; essays queued.",
    fitGoal: "Combine international relations and journalism with study abroad.",
    targetSchools: ["Georgetown", "Tufts", "UNC"],
    topPriorities: ["Finalize Georgetown SFS essay", "Schedule ACT strategy session"],
    standoutStrengths: ["School newspaper editor", "Model UN chair"],
    timeline: [
      {
        id: nanoid(),
        title: "Georgetown SFS essay rewrite",
        description: "Add global journalism impact paragraph.",
        dueDate: daysFromNow(5),
        category: "essays",
        source: "Georgetown",
        completed: false,
      },
      {
        id: nanoid(),
        title: "ACT retake registration",
        description: "Register for April test date; confirm prep plan.",
        dueDate: daysFromNow(2),
        category: "testing",
        source: "Testing",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Tufts short-answer brainstorm",
        description: "Outline curiosity-driven vignettes.",
        dueDate: daysFromNow(8),
        category: "essays",
        source: "Tufts",
        completed: false,
      },
      {
        id: nanoid(),
        title: "Newspaper advisor recommendation packet",
        description: "Deliver storytelling portfolio + resume.",
        dueDate: daysFromNow(-1),
        category: "recommendations",
        source: "Counselor",
        completed: true,
      },
    ],
    lastTouchpoint: "Sent ACT study plan draft this morning.",
  },
]

export const useAppStore = create<AppState>((set) => ({
  role: "student",
  setRole: (role) => set({ role }),
  studentOnboarded: false,
  setStudentOnboarded: (value) => set({ studentOnboarded: value }),
  studentProfile: undefined,
  setStudentProfile: (profile) => set({ studentProfile: profile }),
  updateStudentProfile: (updates) => set((state) => ({
    studentProfile: state.studentProfile ? { ...state.studentProfile, ...updates } : undefined
  })),
  fitOverview: undefined,
  setFitOverview: (fit) => set({ fitOverview: fit }),
  tasks: [],
  generateDemoTasks: () =>
    set((state) => {
      const rankedSchools =
        state.fitOverview
          ? [
              ...(state.fitOverview.reach ?? []),
              ...(state.fitOverview.target ?? []),
              ...(state.fitOverview.safety ?? []),
            ]
          : []

      const anchorSchool = rankedSchools[0]?.name ?? "Application"
      const secondarySchool = rankedSchools[1]?.name ?? "Counselor"
      const today = new Date()
      const futureDate = (offset: number) => {
        const date = new Date(today)
        date.setDate(today.getDate() + offset)
        return date.toISOString()
      }

      const demoTasks: Task[] = [
        {
          id: nanoid(),
          title: `${anchorSchool} — drop the final personal statement`,
          description: "Polish your narrative arc, tighten the conclusion, and align to the prompt themes.",
          dueDate: futureDate(10),
          category: "essays",
          source: anchorSchool,
          completed: false,
        },
        {
          id: nanoid(),
          title: `${anchorSchool} — teacher rec request + brag sheet`,
          description: "Send a thoughtful pitch email and attach your updated activities sheet.",
          dueDate: futureDate(5),
          category: "recommendations",
          source: anchorSchool,
          completed: false,
        },
        {
          id: nanoid(),
          title: "Common App — submit activities list",
          description: "Reorder top 10 activities with impact metrics.",
          dueDate: futureDate(14),
          category: "application",
          source: "Common App",
          completed: false,
        },
        {
          id: nanoid(),
          title: "Scholarship shortlist",
          description: "Identify 3 scholarships aligned to STEM and first-gen status.",
          dueDate: futureDate(21),
          category: "financial",
          source: "Counselor",
          completed: false,
        },
        {
          id: nanoid(),
          title: `${secondarySchool} — supplement outline`,
          description: "Draft bullet outline for the 'Why us?' response. Pull two program-specific facts.",
          dueDate: futureDate(16),
          category: "essays",
          source: secondarySchool,
          completed: false,
        },
        {
          id: nanoid(),
          title: "Testing strategy check-in",
          description: "Confirm superscore submission plan and register for final SAT/ACT window if needed.",
          dueDate: futureDate(25),
          category: "testing",
          source: "Counselor",
          completed: false,
        },
      ]

      return { tasks: demoTasks }
    }),
  toggleTask: (taskId) =>
    set((state) => {
      const tasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      )
      return { tasks }
    }),
  resetTasks: () => set({ tasks: [] }),
  schools: [],
  addSchool: (school) =>
    set((state) => {
      const exists = state.schools.some((s) => s.id === school.id)
      if (exists) return state
      return { schools: [...state.schools, school] }
    }),
  drafts: initialDrafts,
  updateDraft: (draftId, updater) =>
    set((state) => {
      const drafts = state.drafts.map((draft) =>
        draft.id === draftId ? updater({ ...draft }) : draft,
      )
      return { drafts }
    }),
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          id: nanoid(),
          createdAt: new Date().toISOString(),
          ...alert,
        },
        ...state.alerts,
      ],
    })),
  clearAlerts: () => set({ alerts: [] }),
  counselorStudents: initialCounselorStudents,
  setCounselorStatus: (studentId, summary, progress, nextDeadline) =>
    set((state) => ({
      counselorStudents: state.counselorStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              statusSummary: summary ?? student.statusSummary,
              progress: progress ?? student.progress,
              nextDeadline: nextDeadline ?? student.nextDeadline,
            }
          : student,
      ),
    })),
}))

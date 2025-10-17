import { create } from "zustand"
import { nanoid } from "nanoid"

export type Role = "student" | "counselor"

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
  acceptanceRate?: string
  source?: string
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
}

type AppState = {
  role: Role
  setRole: (role: Role) => void
  studentOnboarded: boolean
  setStudentOnboarded: (value: boolean) => void
  studentProfile?: StudentProfile
  setStudentProfile: (profile: StudentProfile) => void
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

const initialCounselorStudents: CounselorStudent[] = [
  {
    id: "amelia-r",
    name: "Amelia Rodrigues",
    progress: 0.42,
    nextDeadline: "Apr 12",
    statusSummary: "Monitoring essay pace; Harvard supplements still in draft.",
  },
  {
    id: "devon-m",
    name: "Devon Martinez",
    progress: 0.68,
    nextDeadline: "Mar 28",
    statusSummary: "On track for UCLA. Watch financial aid paperwork for Berkeley.",
  },
]

export const useAppStore = create<AppState>((set) => ({
  role: "student",
  setRole: (role) => set({ role }),
  studentOnboarded: false,
  setStudentOnboarded: (value) => set({ studentOnboarded: value }),
  studentProfile: undefined,
  setStudentProfile: (profile) => set({ studentProfile: profile }),
  fitOverview: undefined,
  setFitOverview: (fit) => set({ fitOverview: fit }),
  tasks: [],
  generateDemoTasks: () =>
    set((state) => {
      const source = state.fitOverview?.target[0]?.name ?? "Application"
      const today = new Date()
      const futureDate = (offset: number) => {
        const date = new Date(today)
        date.setDate(today.getDate() + offset)
        return date.toISOString()
      }

      const demoTasks: Task[] = [
        {
          id: nanoid(),
          title: `${source} — finalize personal statement`,
          description: "Polish your narrative arc and tighten the conclusion.",
          dueDate: futureDate(10),
          category: "essays",
          source,
          completed: false,
        },
        {
          id: nanoid(),
          title: `${source} — request teacher recommendation`,
          description: "Send a thoughtful request email and attach your resume.",
          dueDate: futureDate(5),
          category: "recommendations",
          source,
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

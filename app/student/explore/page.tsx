"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Plus,
  ExternalLink,
  MapPin,
  DollarSign,
  GraduationCap,
  Users,
  Globe,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAppStore, type School } from "@/lib/inMemoryStore"
import { getSchools, addSchool as addSchoolToSupabase } from "@/app/actions/schools"

export default function ExplorePage() {
  const schools = useAppStore((state) => state.schools)
  const addSchool = useAppStore((state) => state.addSchool)
  const [isLoadingSchools, setIsLoadingSchools] = useState(true)

  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Load schools from Supabase on mount
  useEffect(() => {
    async function loadSchools() {
      try {
        const result = await getSchools()
        if (result.error) {
          console.error("Error loading schools:", result.error)
        } else if (result.data) {
          // Sync Supabase schools to Zustand store
          result.data.forEach((school) => addSchool(school))
        }
      } catch (error) {
        console.error("Error loading schools:", error)
      } finally {
        setIsLoadingSchools(false)
      }
    }

    loadSchools()
  }, [addSchool])

  // Autocomplete search as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(`/api/schools/search?q=${encodeURIComponent(query.trim())}&limit=10`)
        const data = await response.json()
        setSuggestions(data.results || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error("Error searching schools:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelectSchool(school: School) {
    setSelectedSchool(school)
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  async function handleAddSchool(school: School) {
    // Add to Zustand store first for immediate UI update
    addSchool(school)

    // Save to Supabase
    const { id, ...schoolData } = school
    const result = await addSchoolToSupabase(schoolData)

    if (result.error) {
      console.error("Error saving school to Supabase:", result.error)
      toast.error("School added locally but failed to save", {
        description: "The school was added to your list but couldn't be saved to the database."
      })
      return
    }

    toast.success("School added!", {
      description: `${school.name} has been added to your list.`,
    })
  }

  function handleCloseDetail() {
    setSelectedSchool(null)
  }

  const isSchoolAdded = (schoolId: string) => schools.some((existing) => existing.id === schoolId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Explore Schools</h1>
        <p className="mt-2 text-muted-foreground">
          Search universities worldwide - powered by curated data, College Scorecard API, and AI.
        </p>
      </div>

      {/* Search Bar with Autocomplete */}
      <Card className="rounded-3xl border border-border/70 shadow-2xl">
        <CardContent className="space-y-4 pt-6">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder='Try "Harvard", "engineering", "UK universities"...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                className="h-12 rounded-2xl border-none bg-muted/50 pl-11 pr-4 text-base focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-background shadow-2xl">
                <div className="max-h-96 overflow-y-auto p-2">
                  {suggestions.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => handleSelectSchool(school)}
                      className="w-full rounded-xl p-3 text-left transition-colors hover:bg-muted/80"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{school.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {school.city && school.country && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3" />
                                {school.city}, {school.country}
                              </span>
                            )}
                            {school.acceptanceRate && (
                              <Badge variant="secondary" className="rounded-full text-xs">
                                {school.acceptanceRate} acceptance
                              </Badge>
                            )}
                            {school.source && (
                              <Badge variant="outline" className="rounded-full text-xs">
                                {school.source === "curated" ? "Verified" : school.source}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isSearching && query.length >= 2 && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-background p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Type at least 2 characters to see suggestions. Data from curated sources, College Scorecard, and AI.
          </p>
        </CardContent>
      </Card>

      {/* My Schools List */}
      {schools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              My Schools ({schools.length})
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {schools.map((school) => (
              <Card
                key={school.id}
                className="group cursor-pointer rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                onClick={() => setSelectedSchool(school)}
              >
                <CardHeader className="space-y-3">
                  <div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    {(school.city || school.location) && (
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <MapPin className="size-3 text-primary" />
                        {school.city && school.country
                          ? `${school.city}, ${school.country}`
                          : school.location}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {school.acceptanceRate && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {school.acceptanceRate} acceptance
                      </Badge>
                    )}
                    {school.worldRanking && (
                      <Badge variant="outline" className="rounded-full text-xs">
                        #{school.worldRanking} globally
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected School Detail View */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full"
              onClick={handleCloseDetail}
            >
              <X className="size-5" />
            </Button>

            <CardHeader className="space-y-4 pb-6">
              <div>
                <CardTitle className="pr-12 text-3xl">{selectedSchool.name}</CardTitle>
                {selectedSchool.shortName && selectedSchool.shortName !== selectedSchool.name && (
                  <p className="mt-1 text-lg text-muted-foreground">{selectedSchool.shortName}</p>
                )}
              </div>

              {(selectedSchool.city || selectedSchool.location) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span>
                    {selectedSchool.city && selectedSchool.state
                      ? `${selectedSchool.city}, ${selectedSchool.state}, ${selectedSchool.country}`
                      : selectedSchool.city && selectedSchool.country
                      ? `${selectedSchool.city}, ${selectedSchool.country}`
                      : selectedSchool.location}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedSchool.source && (
                  <Badge variant="default" className="rounded-full">
                    {selectedSchool.source === "curated"
                      ? "Verified Data"
                      : selectedSchool.source === "college-scorecard"
                      ? "US Dept of Education"
                      : "AI Generated"}
                  </Badge>
                )}
                {selectedSchool.worldRanking && (
                  <Badge variant="secondary" className="rounded-full">
                    World Ranking: #{selectedSchool.worldRanking}
                  </Badge>
                )}
                {selectedSchool.needBlindAdmission && (
                  <Badge variant="outline" className="rounded-full text-green-600">
                    Need-Blind Admission
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Key Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedSchool.acceptanceRate && (
                  <StatCard
                    icon={TrendingUp}
                    label="Acceptance Rate"
                    value={selectedSchool.acceptanceRate}
                  />
                )}
                {selectedSchool.tuition !== undefined && (
                  <StatCard
                    icon={DollarSign}
                    label={selectedSchool.country === "USA" ? "Domestic Tuition" : "Domestic Tuition"}
                    value={`$${selectedSchool.tuition.toLocaleString()}/year`}
                  />
                )}
                {selectedSchool.internationalTuition !== undefined && selectedSchool.internationalTuition !== selectedSchool.tuition && (
                  <StatCard
                    icon={Globe}
                    label="International Tuition"
                    value={`$${selectedSchool.internationalTuition.toLocaleString()}/year`}
                  />
                )}
                {selectedSchool.graduationRate && (
                  <StatCard
                    icon={GraduationCap}
                    label="Graduation Rate"
                    value={selectedSchool.graduationRate}
                  />
                )}
                {selectedSchool.employmentRate && selectedSchool.employmentRate !== "N/A" && (
                  <StatCard
                    icon={Award}
                    label="Employment Rate"
                    value={selectedSchool.employmentRate}
                  />
                )}
                {selectedSchool.undergraduateEnrollment && (
                  <StatCard
                    icon={Users}
                    label="Undergrad Enrollment"
                    value={selectedSchool.undergraduateEnrollment.toLocaleString()}
                  />
                )}
                {selectedSchool.internationalStudents && selectedSchool.internationalStudents !== "N/A" && (
                  <StatCard
                    icon={Globe}
                    label="International Students"
                    value={selectedSchool.internationalStudents}
                  />
                )}
                {selectedSchool.averageSAT && (
                  <StatCard
                    icon={Award}
                    label="Average SAT"
                    value={selectedSchool.averageSAT.toString()}
                  />
                )}
                {selectedSchool.averageGPA && (
                  <StatCard
                    icon={TrendingUp}
                    label="Average GPA"
                    value={selectedSchool.averageGPA.toFixed(2)}
                  />
                )}
              </div>

              {/* Programs */}
              {selectedSchool.programs && selectedSchool.programs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Top Programs
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSchool.programs.map((program) => (
                      <Badge key={program} variant="secondary" className="rounded-full">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Application Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedSchool.applicationDeadline && (
                    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
                      <Calendar className="mt-0.5 size-5 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Application Deadline
                        </p>
                        <p className="mt-1 font-medium">{selectedSchool.applicationDeadline}</p>
                      </div>
                    </div>
                  )}
                  {selectedSchool.requiredTests && selectedSchool.requiredTests.length > 0 && (
                    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
                      <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Required Tests
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {selectedSchool.requiredTests.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="flex-1 rounded-full shadow-md"
                  onClick={() => handleAddSchool(selectedSchool)}
                  disabled={isSchoolAdded(selectedSchool.id)}
                >
                  <Plus className="mr-2 size-4" />
                  {isSchoolAdded(selectedSchool.id) ? "Added to My Schools" : "Add to My Schools"}
                </Button>
                {selectedSchool.website && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                    asChild
                  >
                    <a
                      href={selectedSchool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4 shadow-sm">
      <div className="mt-1 rounded-full bg-primary/10 p-2">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState, type ComponentType, type SVGProps } from "react"
import {
  Search,
  Plus,
  ExternalLink,
  MapPin,
  TrendingUp,
  DollarSign,
  BarChart3,
  GraduationCap,
  Users,
  School as SchoolIcon,
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
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore, type School } from "@/lib/inMemoryStore"

export default function ExplorePage() {
  const schools = useAppStore((state) => state.schools)
  const addSchool = useAppStore((state) => state.addSchool)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<School[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [lastQuery, setLastQuery] = useState("")

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/schools?q=${encodeURIComponent(query.trim())}`)
      const data = await response.json()
      setResults(data.schools || [])
      setLastQuery(data.query ?? query.trim())
    } catch (error) {
      console.error("Error searching schools:", error)
      toast.error("Failed to search schools")
    } finally {
      setIsSearching(false)
    }
  }

  function handleAddSchool(school: School) {
    addSchool(school)
    toast.success("School added!", {
      description: `${school.name} has been added to your list.`,
    })
  }

  const isSchoolAdded = (schoolId: string) => schools.some((existing) => existing.id === schoolId)

  const totalResultsLabel = useMemo(() => {
    if (!hasSearched) return ""
    if (!lastQuery.trim()) return ""
    if (!results.length) return `No matches for “${lastQuery}”`
    if (results.length === 1) return `1 result for “${lastQuery}”`
    return `${results.length} results for “${lastQuery}”`
  }, [hasSearched, results.length, lastQuery])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Explore Schools</h1>
        <p className="mt-2 text-muted-foreground">
          Search like a college counselor — we mirror BigFuture data points for a fast vibe check.
        </p>
      </div>

      <Card className="rounded-3xl border border-border/70 shadow-2xl">
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a school, city, or focus (try “engineering”)"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 rounded-2xl border-none bg-muted/50 pl-11 text-base focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-2xl px-8 shadow-lg"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            For Sprint 2 we&apos;ll tap live College Scorecard + Wikipedia data. Today&apos;s demo runs on curated results so you can click through.
          </p>
        </CardContent>
      </Card>

      {schools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              My Schools ({schools.length})
            </h2>
            <span className="text-xs text-muted-foreground">Pinned for your counselor</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {schools.map((school) => (
              <Card
                key={school.id}
                className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg"
              >
                <CardHeader className="space-y-3">
                  <div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    {school.location && (
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="size-3 text-primary" />
                        {school.location}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {school.acceptanceRate && (
                      <Badge variant="secondary" className="rounded-full">
                        Acceptance {school.acceptanceRate}
                      </Badge>
                    )}
                    {school.avgNetPrice && (
                      <Badge variant="outline" className="rounded-full">
                        Net price {school.avgNetPrice}
                      </Badge>
                    )}
                    {school.satRange && (
                      <Badge variant="outline" className="rounded-full">
                        SAT {school.satRange}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {school.focus && (
                    <Badge variant="secondary" className="rounded-full">
                      {school.focus}
                    </Badge>
                  )}
                  {school.graduationRate && (
                    <Badge variant="outline" className="rounded-full">
                      Grad rate {school.graduationRate}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="rounded-full">
                    Added to list
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isSearching && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Loading results
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="rounded-3xl border border-border/60 shadow-lg">
                <CardHeader className="space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-5 w-full rounded-full" />
                  <Skeleton className="h-5 w-2/3 rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isSearching && hasSearched && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Search Results
            </h2>
            {totalResultsLabel && (
              <span className="text-xs text-muted-foreground">{totalResultsLabel}</span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((school) => (
              <Card
                key={school.id}
                className="group rounded-3xl border border-border/70 bg-card/95 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <CardHeader className="space-y-4">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {school.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1">
                          <MapPin className="size-3 text-primary" />
                          {school.location}
                        </span>
                      )}
                      {school.focus && (
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {school.focus}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    {school.acceptanceRate && (
                      <StatTile icon={TrendingUp} label="Acceptance" value={school.acceptanceRate} />
                    )}
                    {school.avgNetPrice && (
                      <StatTile icon={DollarSign} label="Avg. net price" value={school.avgNetPrice} />
                    )}
                    {school.satRange && (
                      <StatTile icon={BarChart3} label="SAT middle 50%" value={school.satRange} />
                    )}
                    {school.tuition && (
                      <StatTile icon={SchoolIcon} label="Tuition" value={school.tuition} />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {school.graduationRate && (
                      <Badge variant="outline" className="rounded-full">
                        <GraduationCap className="mr-1 size-3" />
                        Grad rate {school.graduationRate}
                      </Badge>
                    )}
                    {school.studentFacultyRatio && (
                      <Badge variant="outline" className="rounded-full">
                        <Users className="mr-1 size-3" />
                        {school.studentFacultyRatio} student-faculty
                      </Badge>
                    )}
                    {school.size && (
                      <Badge variant="outline" className="rounded-full">
                        {school.size}
                      </Badge>
                    )}
                    {school.source && (
                      <Badge variant="outline" className="rounded-full">
                        Source: {school.source}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 rounded-full shadow-sm"
                      onClick={() => handleAddSchool(school)}
                      disabled={isSchoolAdded(school.id)}
                    >
                      <Plus className="mr-2 size-4" />
                      {isSchoolAdded(school.id) ? "Added" : "Add to my schools"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      asChild
                    >
                      <a
                        href={
                          school.url
                            ? school.url
                            : `https://www.google.com/search?q=${encodeURIComponent(`${school.name} admissions`)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open admissions page"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <Card className="rounded-3xl border-dashed border-muted-foreground/40 bg-background shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle>No results yet</CardTitle>
            <CardDescription>
              Try another school name or search for a field like &quot;computer science west coast&quot;.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

type StatTileProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
}

function StatTile({ icon: Icon, label, value }: StatTileProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 px-3 py-2 shadow-sm">
      <div className="mt-1 rounded-full bg-primary/10 p-2">
        <Icon className="size-3.5 text-primary" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

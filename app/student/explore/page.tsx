"use client"

import { useState } from "react"
import { Search, Plus, ExternalLink } from "lucide-react"
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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/schools?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.schools || [])
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

  const isSchoolAdded = (schoolId: string) => {
    return schools.some((s) => s.id === schoolId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Explore Schools</h1>
        <p className="mt-2 text-muted-foreground">
          Search for colleges and universities. Live data from College Scorecard and more.
        </p>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a school... (try 'Harvard')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded-xl pl-10 text-base"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="rounded-xl px-8 shadow-md"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Schools */}
      {schools.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            My Schools ({schools.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {schools.map((school) => (
              <Card
                key={school.id}
                className="rounded-2xl border-primary/40 bg-primary/5 shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                  {school.acceptanceRate && (
                    <CardDescription className="text-sm">
                      Acceptance Rate: {school.acceptanceRate}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="rounded-lg text-xs">
                    Added to your list
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {isSearching && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Search Results
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-2xl shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isSearching && hasSearched && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Search Results ({results.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((school) => (
              <Card key={school.id} className="rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                  {school.acceptanceRate ? (
                    <CardDescription className="text-sm">
                      Acceptance Rate: {school.acceptanceRate}
                    </CardDescription>
                  ) : (
                    <CardDescription className="text-sm">
                      Data not available
                    </CardDescription>
                  )}
                  {school.source && (
                    <Badge variant="outline" className="w-fit rounded-lg text-xs">
                      Source: {school.source}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    className="flex-1 rounded-xl shadow-sm"
                    onClick={() => handleAddSchool(school)}
                    disabled={isSchoolAdded(school.id)}
                  >
                    <Plus className="mr-2 size-4" />
                    {isSchoolAdded(school.id) ? "Added" : "Add to my schools"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        school.name + " admissions"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View admissions site"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <Card className="rounded-2xl border-dashed border-muted-foreground/40 shadow-md">
          <CardHeader className="text-center">
            <CardTitle>No results found</CardTitle>
            <CardDescription>
              Try searching for &quot;Harvard&quot; or another well-known school.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

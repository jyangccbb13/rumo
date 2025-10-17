import { NextResponse } from "next/server"

type SchoolRecord = {
  id: string
  name: string
  location: string
  acceptanceRate: string
  tuition: string
  avgNetPrice: string
  satRange: string
  graduationRate: string
  studentFacultyRatio: string
  size: string
  focus: string
  url: string
  source: string
}

const schoolCatalog: SchoolRecord[] = [
  {
    id: "harvard-university",
    name: "Harvard University",
    location: "Cambridge, MA",
    acceptanceRate: "3.4%",
    tuition: "$57,246",
    avgNetPrice: "$19,491",
    satRange: "1480-1580",
    graduationRate: "98%",
    studentFacultyRatio: "7:1",
    size: "7,153 undergrads",
    focus: "Research powerhouse, liberal arts core",
    url: "https://college.harvard.edu/",
    source: "bigfuture-mock",
  },
  {
    id: "stanford-university",
    name: "Stanford University",
    location: "Stanford, CA",
    acceptanceRate: "3.7%",
    tuition: "$62,484",
    avgNetPrice: "$18,279",
    satRange: "1500-1570",
    graduationRate: "94%",
    studentFacultyRatio: "5:1",
    size: "7,761 undergrads",
    focus: "STEM, entrepreneurship, interdisciplinary innovation",
    url: "https://admission.stanford.edu/",
    source: "bigfuture-mock",
  },
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA",
    acceptanceRate: "4.0%",
    tuition: "$59,750",
    avgNetPrice: "$19,998",
    satRange: "1510-1580",
    graduationRate: "95%",
    studentFacultyRatio: "3:1",
    size: "4,657 undergrads",
    focus: "Engineering, computer science, maker culture",
    url: "https://mitadmissions.org/",
    source: "bigfuture-mock",
  },
  {
    id: "uc-berkeley",
    name: "University of California, Berkeley",
    location: "Berkeley, CA",
    acceptanceRate: "11.4%",
    tuition: "$14,436 (in-state)",
    avgNetPrice: "$19,257",
    satRange: "1340-1530",
    graduationRate: "93%",
    studentFacultyRatio: "17:1",
    size: "32,831 undergrads",
    focus: "Research, public service, entrepreneurship",
    url: "https://admissions.berkeley.edu/",
    source: "bigfuture-mock",
  },
  {
    id: "ucla",
    name: "University of California, Los Angeles",
    location: "Los Angeles, CA",
    acceptanceRate: "9.0%",
    tuition: "$13,752 (in-state)",
    avgNetPrice: "$16,999",
    satRange: "1290-1510",
    graduationRate: "92%",
    studentFacultyRatio: "18:1",
    size: "32,119 undergrads",
    focus: "Film & media, life sciences, social impact",
    url: "https://admission.ucla.edu/",
    source: "bigfuture-mock",
  },
  {
    id: "nyu",
    name: "New York University",
    location: "New York, NY",
    acceptanceRate: "12.8%",
    tuition: "$58,168",
    avgNetPrice: "$45,417",
    satRange: "1400-1540",
    graduationRate: "87%",
    studentFacultyRatio: "9:1",
    size: "29,401 undergrads",
    focus: "Performing arts, finance, global programs",
    url: "https://www.nyu.edu/admissions.html",
    source: "bigfuture-mock",
  },
  {
    id: "georgia-tech",
    name: "Georgia Institute of Technology",
    location: "Atlanta, GA",
    acceptanceRate: "15.7%",
    tuition: "$12,852 (in-state)",
    avgNetPrice: "$17,402",
    satRange: "1370-1530",
    graduationRate: "91%",
    studentFacultyRatio: "19:1",
    size: "18,415 undergrads",
    focus: "Engineering, computing, co-op culture",
    url: "https://admission.gatech.edu/",
    source: "bigfuture-mock",
  },
  {
    id: "university-of-miami",
    name: "University of Miami",
    location: "Coral Gables, FL",
    acceptanceRate: "18.5%",
    tuition: "$58,102",
    avgNetPrice: "$36,467",
    satRange: "1320-1460",
    graduationRate: "83%",
    studentFacultyRatio: "12:1",
    size: "12,316 undergrads",
    focus: "Marine science, business, health sciences",
    url: "https://admissions.miami.edu/",
    source: "bigfuture-mock",
  },
  {
    id: "university-of-washington",
    name: "University of Washington",
    location: "Seattle, WA",
    acceptanceRate: "21%",
    tuition: "$12,643 (in-state)",
    avgNetPrice: "$10,603",
    satRange: "1200-1470",
    graduationRate: "84%",
    studentFacultyRatio: "20:1",
    size: "35,582 undergrads",
    focus: "Computer science, health, public policy",
    url: "https://admit.washington.edu/",
    source: "bigfuture-mock",
  },
  {
    id: "northeastern",
    name: "Northeastern University",
    location: "Boston, MA",
    acceptanceRate: "18.0%",
    tuition: "$60,192",
    avgNetPrice: "$35,395",
    satRange: "1410-1540",
    graduationRate: "90%",
    studentFacultyRatio: "15:1",
    size: "16,300 undergrads",
    focus: "Co-op, experiential learning, global campuses",
    url: "https://undergraduate.northeastern.edu/",
    source: "bigfuture-mock",
  },
]

function scoreSchool(queryTokens: string[], school: SchoolRecord) {
  const haystack = `${school.name} ${school.location} ${school.focus}`.toLowerCase()
  let score = 0

  queryTokens.forEach((token) => {
    if (!token) return
    if (school.name.toLowerCase() === token) {
      score += 5
    } else if (school.name.toLowerCase().includes(token)) {
      score += 4
    } else if (school.location.toLowerCase().includes(token)) {
      score += 3
    } else if (haystack.includes(token)) {
      score += 2
    }
  })

  return score
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") || "").trim()
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)

  let results: SchoolRecord[]

  if (!tokens.length) {
    results = schoolCatalog.slice(0, 8)
  } else {
    results = schoolCatalog
      .map((school) => ({
        school,
        score: scoreSchool(tokens, school),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ school }) => school)

    if (!results.length) {
      // fall back to fuzzy name includes for partial matches
      results = schoolCatalog.filter((school) =>
        school.name.toLowerCase().includes(tokens[0] ?? "")
      )
    }
  }

  await new Promise((resolve) => setTimeout(resolve, results.length ? 350 : 600))

  return NextResponse.json({ schools: results, total: results.length, query })
}

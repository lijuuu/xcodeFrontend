"use client"

import React, { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Code,
  Copy,
  FileCode,
  Filter,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
} from "lucide-react"
import { MultiSelect } from "./multi-select"

const BASE_URL = "http://localhost:7000/api/v1/problems"

const predefinedTags = [
  "Array",
  "String",
  "Dynamic Programming",
  "Graph",
  "Tree",
  "Linked List",
  "Stack",
  "Queue",
  "Heap",
  "Backtracking",
  "Greedy",
  "Binary Search",
  "Sorting",
  "Recursion",
  "Bit Manipulation",
]

// Schemas
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
})

const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  expected: z.string().min(1, "Expected output is required"),
})

const bulkTestCaseSchema = z
  .object({
    run: z.array(z.object({ input: z.string(), expected: z.string() })).optional(),
    submit: z.array(z.object({ input: z.string(), expected: z.string() })).optional(),
  })
  .refine((data) => (data.run && data.run.length > 0) || (data.submit && data.submit.length > 0), {
    message: "At least one run or submit test case is required",
  })

const languageSchema = z.object({
  language: z.string().min(1, "Language is required"),
  placeholder: z.string().min(1, "Placeholder is required"),
  code: z.string().min(1, "Validation code is required"),
})

type ProblemFormData = z.infer<typeof problemSchema>
type TestCaseFormData = z.infer<typeof testCaseSchema>
type BulkTestCaseFormData = z.infer<typeof bulkTestCaseSchema>
type LanguageFormData = z.infer<typeof languageSchema>

interface LanguageSupport {
  language: string
  placeholder: string
  code: string
}

interface ApiHistoryEntry {
  timestamp: string
  method: string
  url: string
  sentData: any
  receivedData: any
}

// Custom API Response Toast Component
const ApiResponseToast = ({ title, data, isError = false }: { title: string; data: any; isError?: boolean }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 shadow-xl">
      <div className={`px-4 py-3 flex items-center justify-between ${isError ? "bg-red-900/50" : "bg-blue-900/50"}`}>
        <h3 className="font-medium text-white">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
            className="text-white/70 hover:text-white transition p-1 rounded"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="bg-gray-900 max-h-[400px] overflow-auto">
        <SyntaxHighlighter
          language="json"
          style={tomorrow}
          customStyle={{
            padding: "16px",
            fontSize: "13px",
            backgroundColor: "transparent",
            margin: 0,
          }}
        >
          {JSON.stringify(data, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [problems, setProblems] = useState<any[]>([])
  const [filteredProblems, setFilteredProblems] = useState<any[]>([])
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null)
  const [languages, setLanguages] = useState<LanguageSupport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filters, setFilters] = useState({ search: "", difficulty: "all", tags: "" })
  const [apiHistory, setApiHistory] = useState<ApiHistoryEntry[]>([])
  const [view, setView] = useState<"list" | "details" | "testcases" | "languages" | "validation" | "api">("list")
  const [showFilters, setShowFilters] = useState(false)

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${BASE_URL}/list`, { params: { page: 1, page_size: 100 } })
      const problemList = res.data.payload?.problems || []
      if (!Array.isArray(problemList)) throw new Error("Expected an array of problems")
      setProblems(problemList)
      setFilteredProblems(problemList)
    } catch (error: any) {
      setError(error.message || "Failed to load problems")
      setProblems([])
      setFilteredProblems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProblemDetails = useCallback(async (problemId: string) => {
    setLoading(true)
    setError(null)
    try {
      const [problemRes, languagesRes] = await Promise.all([
        axios.get(`${BASE_URL}/`, { params: { problem_id: problemId } }),
        axios.get(`${BASE_URL}/languages`, { params: { problem_id: problemId } }),
      ])
      const problemData = problemRes.data.payload || problemRes.data
      setSelectedProblem(problemData)
      const validateCode = problemData.validate_code || {}
      const languageSupports = Object.entries(validateCode).map(([language, code]: [string, any]) => ({
        language,
        placeholder: code.placeholder || "",
        code: code.code || "",
      }))
      setLanguages(languageSupports)
    } catch (error: any) {
      setError(error.message || "Failed to load problem details")
      setLanguages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === "list") fetchProblems()
  }, [fetchProblems, view])

  const handleApiCall = useCallback(
    async (method: string, url: string, data?: any, params?: any) => {
      setLoading(true)
      setError(null)
      setSuccess(null)
      const timestamp = new Date().toISOString()
      try {
        const config = { method, url: `${BASE_URL}${url}`, data, params }
        const res = await axios(config)
        const historyEntry: ApiHistoryEntry = {
          timestamp,
          method,
          url,
          sentData: data || params || null,
          receivedData: res.data,
        }
        setApiHistory((prev) => [historyEntry, ...prev])
        await fetchProblems()
        if (selectedProblem?.problem_id) await fetchProblemDetails(selectedProblem.problem_id)
        setSuccess("Action completed successfully!")

        toast(<ApiResponseToast title="API Response" data={res.data} />, {
          duration: 10000,
        })

        setTimeout(() => setSuccess(null), 3000)
        return res.data
      } catch (error: any) {
        const errorData = error.response?.data || error.message
        const historyEntry: ApiHistoryEntry = {
          timestamp,
          method,
          url,
          sentData: data || params || null,
          receivedData: errorData,
        }
        setApiHistory((prev) => [historyEntry, ...prev])
        setError(error.response?.data?.error?.message || "Action failed")

        toast.error(<ApiResponseToast title="Error Response" data={errorData} isError={true} />, {
          duration: 10000,
        })

        throw error
      } finally {
        setLoading(false)
      }
    },
    [fetchProblems, fetchProblemDetails, selectedProblem],
  )

  const mapDifficulty = (short: string) => {
    switch (short) {
      case "E":
        return "Easy"
      case "M":
        return "Medium"
      case "H":
        return "Hard"
      default:
        return short
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "E":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "M":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "H":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20"
    }
  }

  const applyFilters = useCallback(() => {
    let filtered = [...problems]
    if (filters.search) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(filters.search.toLowerCase()))
    }
    if (filters.difficulty !== "all") {
      filtered = filtered.filter((p) => mapDifficulty(p.difficulty) === filters.difficulty)
    }
    if (filters.tags) {
      const tag = filters.tags.toLowerCase()
      filtered = filtered.filter((p) => p.tags.some((t: string) => t.toLowerCase().includes(tag)))
    }
    setFilteredProblems(filtered)
  }, [problems, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Problem List View
  const ProblemListView = () => (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 w-full"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-muted" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSelectedProblem(null)
                setView("details")
              }}
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Problem
            </Button>
            {apiHistory.length > 0 && (
              <Button variant="outline" onClick={() => setView("api")}>
                <Server className="h-4 w-4 mr-2" />
                API History
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="difficulty-filter" className="text-sm font-medium mb-1.5 block">
                  Difficulty
                </Label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
                >
                  <SelectTrigger id="difficulty-filter">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="tag-filter" className="text-sm font-medium mb-1.5 block">
                  Tag
                </Label>
                <Input
                  id="tag-filter"
                  placeholder="Filter by tag..."
                  value={filters.tags}
                  onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ search: "", difficulty: "all", tags: "" })}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900">
          <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900">
          <CardContent className="p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="h-5 w-5 flex-shrink-0" />
            <p>{success}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
        <p className="text-sm text-muted-foreground">
          {filteredProblems.length} {filteredProblems.length === 1 ? "problem" : "problems"} found
        </p>
      </div>

      {filteredProblems.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <FileCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No problems found</h3>
            <p className="text-muted-foreground mb-4">Create a new problem to get started.</p>
            <Button
              onClick={() => {
                setSelectedProblem(null)
                setView("details")
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Problem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProblems.map((problem) => (
            <Card key={problem.problem_id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={`${getDifficultyColor(problem.difficulty)} font-normal mb-2`}>
                    {mapDifficulty(problem.difficulty)}
                  </Badge>
                </div>
                <CardTitle className="text-lg truncate">{problem.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-4">
                  {problem.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="font-normal text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {problem.tags.length > 3 && (
                    <Badge variant="outline" className="font-normal text-xs">
                      +{problem.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    fetchProblemDetails(problem.problem_id)
                    setView("details")
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchProblemDetails(problem.problem_id)
                    setView("testcases")
                  }}
                >
                  Test Cases
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchProblemDetails(problem.problem_id)
                    setView("languages")
                  }}
                >
                  Languages
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchProblemDetails(problem.problem_id)
                    setView("validation")
                  }}
                >
                  Validate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // Problem Details View
  const ProblemDetailsView = () => {
    const {
      register,
      handleSubmit,
      reset,
      control,
      formState: { errors, isSubmitting },
    } = useForm<ProblemFormData>({
      resolver: zodResolver(problemSchema),
      defaultValues: selectedProblem
        ? {
            title: selectedProblem.title,
            description: selectedProblem.description,
            tags: selectedProblem.tags || [],
            difficulty: mapDifficulty(selectedProblem.difficulty),
          }
        : {},
    })

    useEffect(() => {
      if (selectedProblem) {
        reset({
          title: selectedProblem.title,
          description: selectedProblem.description,
          tags: selectedProblem.tags || [],
          difficulty: mapDifficulty(selectedProblem.difficulty),
        })
      } else {
        reset({})
      }
    }, [selectedProblem, reset])

    const onSubmit = async (data: ProblemFormData) => {
      const payload = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        difficulty: data.difficulty.charAt(0),
      }
      if (selectedProblem) {
        await handleApiCall("put", "/", { problem_id: selectedProblem.problem_id, ...payload })
      } else {
        await handleApiCall("post", "/", payload)
      }
      setView("list")
    }

    const onDelete = async () => {
      if (selectedProblem && window.confirm("Are you sure you want to delete this problem?")) {
        await handleApiCall("delete", "/", null, { problem_id: selectedProblem.problem_id })
        setSelectedProblem(null)
        setView("list")
      }
    }

    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" onClick={() => setView("list")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>
          <h1 className="text-2xl font-bold">{selectedProblem ? "Edit Problem" : "Create Problem"}</h1>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{selectedProblem ? "Edit Problem Details" : "Create New Problem"}</CardTitle>
            <CardDescription>
              {selectedProblem
                ? "Update the problem information below"
                : "Fill in the details to create a new coding problem"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} placeholder="Enter problem title" className="mt-1" />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      defaultValue={selectedProblem ? mapDifficulty(selectedProblem.difficulty) : ""}
                      onValueChange={(value) => {
                        const event = { target: { name: "difficulty", value } }
                        register("difficulty").onChange(event)
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.difficulty && <p className="text-sm text-red-500 mt-1">{errors.difficulty.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          options={predefinedTags.map((tag) => ({ value: tag, label: tag }))}
                          selected={field.value?.map((tag) => ({ value: tag, label: tag })) || []}
                          onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                          placeholder="Select tags..."
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.tags && <p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe the problem..."
                    className="mt-1 min-h-32"
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting || loading} className="sm:flex-1">
                  {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {selectedProblem ? "Update Problem" : "Create Problem"}
                </Button>
                {selectedProblem && (
                  <Button type="button" variant="destructive" onClick={onDelete} disabled={isSubmitting || loading}>
                    {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Delete Problem
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setView("list")} className="sm:ml-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Test Cases View
  const TestCasesView = () => {
    const {
      register: registerRun,
      handleSubmit: handleSubmitRun,
      reset: resetRun,
      formState: { errors: errorsRun },
    } = useForm<TestCaseFormData>({
      resolver: zodResolver(testCaseSchema),
      mode: "onChange",
    })
    const {
      register: registerSubmit,
      handleSubmit: handleSubmitSubmit,
      reset: resetSubmit,
      formState: { errors: errorsSubmit },
    } = useForm<TestCaseFormData>({
      resolver: zodResolver(testCaseSchema),
      mode: "onChange",
    })
    const {
      register: registerBulk,
      handleSubmit: handleSubmitBulk,
      setValue: setBulkValue,
      formState: { errors: errorsBulk },
    } = useForm<{ bulkJson: string }>({
      resolver: zodResolver(
        z.object({
          bulkJson: z
            .string()
            .min(1, "JSON is required")
            .refine(
              (val) => {
                try {
                  const parsed = JSON.parse(val)
                  return bulkTestCaseSchema.safeParse(parsed).success
                } catch {
                  return false
                }
              },
              "Invalid JSON format or structure",
            ),
        }),
      ),
      mode: "onChange",
    })
    const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState("existing")

    const onAddRun = async (data: TestCaseFormData) => {
      if (!selectedProblem) return setError("Please select or create a problem first.")
      await handleApiCall("post", "/testcases", {
        problem_id: selectedProblem.problem_id,
        testcases: { run: [{ input: data.input, expected: data.expected }], submit: [] },
      })
      resetRun()
      setActiveTab("existing")
    }

    const onAddSubmit = async (data: TestCaseFormData) => {
      if (!selectedProblem) return setError("Please select or create a problem first.")
      await handleApiCall("post", "/testcases", {
        problem_id: selectedProblem.problem_id,
        testcases: { run: [], submit: [{ input: data.input, expected: data.expected }] },
      })
      resetSubmit()
      setActiveTab("existing")
    }

    const onRemove = async (testcaseId: string, isRun: boolean) => {
      if (!selectedProblem || !window.confirm("Are you sure you want to delete this test case?")) return
      await handleApiCall("delete", "/testcases/single", {
        problem_id: selectedProblem.problem_id,
        testcase_id: testcaseId,
        is_run_testcase: isRun,
      })
    }

    const onBulkDelete = async () => {
      if (
        !selectedProblem ||
        selectedTestCases.size === 0 ||
        !window.confirm("Are you sure you want to delete selected test cases?")
      )
        return
      const promises = Array.from(selectedTestCases).map((testcaseId) => {
        const isRun = selectedProblem.testcases.run.some((tc: any) => (tc.id || tc.testcase_id) === testcaseId)
        return handleApiCall("delete", "/testcases/single", {
          problem_id: selectedProblem.problem_id,
          testcase_id: testcaseId,
          is_run_testcase: isRun,
        })
      })
      await Promise.all(promises)
      setSelectedTestCases(new Set())
    }

    const onBulkUpload = async (data: { bulkJson: string }) => {
      if (!selectedProblem) return setError("Please select or create a problem first.")
      try {
        const parsedJson = JSON.parse(data.bulkJson)
        await handleApiCall("post", "/testcases", {
          problem_id: selectedProblem.problem_id,
          testcases: parsedJson,
        })
        setBulkValue("bulkJson", "")
        toast.success("Test cases uploaded successfully!", {
          duration: 3000,
          className: "bg-gray-900 border border-white/10 text-white",
        })
        setSuccess("Test cases uploaded successfully!")
        setActiveTab("existing")
      } catch (e: any) {
        toast.error(e.message || "Failed to upload bulk test cases.", {
          duration: 3000,
          className: "bg-gray-900 border border-white/10 text-white",
        })
        setError(e.message || "Failed to upload bulk test cases.")
      }
    }

    const toggleTestCaseSelection = (testcaseId: string) => {
      const newSelected = new Set(selectedTestCases)
      if (newSelected.has(testcaseId)) newSelected.delete(testcaseId)
      else newSelected.add(testcaseId)
      setSelectedTestCases(newSelected)
    }

    const exampleJson = `{"run": [{"input": "1 2", "expected": "3"}], "submit": [{"input": "5 6", "expected": "11"}]}`

    const copyExampleJson = () => {
      navigator.clipboard.writeText(exampleJson)
      toast.success("Example JSON copied to clipboard!", {
        duration: 3000,
        className: "bg-gray-900 border border-white/10 text-white",
      })
      setSuccess("Example JSON copied to clipboard!")
      setTimeout(() => setSuccess(null), 2000)
    }

    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" onClick={() => setView("list")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>
          <h1 className="text-2xl font-bold">Test Cases: {selectedProblem?.title}</h1>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="existing">Existing</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Existing Test Cases</CardTitle>
                  <CardDescription>View and manage test cases for this problem</CardDescription>
                </div>
                {selectedTestCases.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedTestCases.size})
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="min-h-screen rounded-md border">
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left w-10"></th>
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-left">Input</th>
                          <th className="p-2 text-left">Expected</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProblem?.testcases?.run?.map((tc: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="p-2">
                              <Checkbox
                                checked={selectedTestCases.has(tc.id || tc.testcase_id || `run_${i}`)}
                                onCheckedChange={() => toggleTestCaseSelection(tc.id || tc.testcase_id || `run_${i}`)}
                              />
                            </td>
                            <td className="p-2">
                              <Badge
                                variant="outline"
                                className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-200"
                              >
                                Run
                              </Badge>
                            </td>
                            <td className="p-2 truncate max-w-xs ">{"[ "+tc.input.replace(" ",",")+" ]"}</td>
                            <td className="p-2 truncate max-w-xs">{"[ "+tc.expected.replace(" ",",")+" ]"}</td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(tc.id || tc.testcase_id || `run_${i}`, true)}
                                disabled={loading}
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {selectedProblem?.testcases?.submit?.map((tc: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="p-2">
                              <Checkbox
                                checked={selectedTestCases.has(tc.id || tc.testcase_id || `submit_${i}`)}
                                onCheckedChange={() =>
                                  toggleTestCaseSelection(tc.id || tc.testcase_id || `submit_${i}`)
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Badge
                                variant="outline"
                                className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-200"
                              >
                                Submit
                              </Badge>
                            </td>
                            <td className="p-2 truncate max-w-xs">{tc.input}</td>
                            <td className="p-2 truncate max-w-xs">{tc.expected}</td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(tc.id || tc.testcase_id || `submit_${i}`, false)}
                                disabled={loading}
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!selectedProblem?.testcases?.run?.length && !selectedProblem?.testcases?.submit?.length && (
                      <div className="py-8 text-center">
                        <ListChecks className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No test cases added yet.</p>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab("add")}>
                          Add Your First Test Case
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Run Test Case</CardTitle>
                  <CardDescription>Test cases used during development</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRun(onAddRun)} className="space-y-4">
                    <div>
                      <Label htmlFor="run-input">Input</Label>
                      <Input id="run-input" {...registerRun("input")} placeholder="Enter input..." className="mt-1" />
                      {errorsRun.input && <p className="text-sm text-red-500 mt-1">{errorsRun.input.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="run-expected">Expected Output</Label>
                      <Input
                        id="run-expected"
                        {...registerRun("expected")}
                        placeholder="Enter expected output..."
                        className="mt-1"
                      />
                      {errorsRun.expected && <p className="text-sm text-red-500 mt-1">{errorsRun.expected.message}</p>}
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Run Test Case
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Submit Test Case</CardTitle>
                  <CardDescription>Test cases used for final submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitSubmit(onAddSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="submit-input">Input</Label>
                      <Input
                        id="submit-input"
                        {...registerSubmit("input")}
                        placeholder="Enter input..."
                        className="mt-1"
                      />
                      {errorsSubmit.input && <p className="text-sm text-red-500 mt-1">{errorsSubmit.input.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="submit-expected">Expected Output</Label>
                      <Input
                        id="submit-expected"
                        {...registerSubmit("expected")}
                        placeholder="Enter expected output..."
                        className="mt-1"
                      />
                      {errorsSubmit.expected && (
                        <p className="text-sm text-red-500 mt-1">{errorsSubmit.expected.message}</p>
                      )}
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Submit Test Case
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Upload Test Cases</CardTitle>
                <CardDescription>Upload multiple test cases at once using JSON format</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBulk(onBulkUpload)} className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="bulk-json">JSON Data</Label>
                    <div className="flex justify-end mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBulkValue("bulkJson", exampleJson)
                          setSuccess("Example JSON loaded!")
                          setTimeout(() => setSuccess(null), 2000)
                        }}
                        className="text-xs"
                      >
                        Load Example
                      </Button>
                    </div>
                    <Textarea
                      id="bulk-json"
                      {...registerBulk("bulkJson")}
                      placeholder={exampleJson}
                      className="min-h-40 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyExampleJson}
                      className="absolute bottom-4 right-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {errorsBulk.bulkJson && <p className="text-sm text-red-500 mt-1">{errorsBulk.bulkJson.message}</p>}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Upload Bulk Test Cases
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Languages View
  const LanguagesView = () => {
    const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isSubmitting },
    } = useForm<LanguageFormData>({
      resolver: zodResolver(languageSchema),
      mode: "onChange",
    })
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageSupport | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const formatLanguageName = (lang: string) => {
      switch (lang.toLowerCase()) {
        case "python":
          return "Python"
        case "javascript":
          return "JavaScript"
        case "cpp":
          return "C++"
        case "go":
          return "Go"
        default:
          return lang
      }
    }

    const getLanguageIcon = (lang: string) => {
      const colors = {
        python: "text-blue-500",
        javascript: "text-yellow-500",
        cpp: "text-purple-500",
        go: "text-cyan-500",
      }
      return <Code className={`h-5 w-5 ${colors[lang.toLowerCase() as keyof typeof colors] || "text-primary"}`} />
    }

    const defaultPlaceholder = {
      python: {
        placeholder: "# Write your Python solution here\n",
        code: "def validate_solution():\n    # Add validation logic here\n    pass\n",
      },
      javascript: {
        placeholder: "// Write your JavaScript solution here\n",
        code: "function validateSolution() {\n    # Add validation logic here\n}\n",
      },
      cpp: {
        placeholder: "// Write your C++ solution here\n#include <iostream>\n",
        code: "#include <iostream>\nbool validateSolution() {\n    # Add validation logic here\n    return true;\n}\n",
      },
      go: {
        placeholder: "// Write your Go solution here\npackage main\n",
        code: "package main\nfunc validateSolution() bool {\n    # Add validation logic here\n    return true;\n}\n",
      },
    }

    const handleLanguageSelect = (value: string) => {
      if (value) {
        const defaults = defaultPlaceholder[value as keyof typeof defaultPlaceholder]
        setValue("language", value, { shouldValidate: true })
        setValue("placeholder", defaults.placeholder, { shouldValidate: true })
        setValue("code", defaults.code, { shouldValidate: true })
      }
    }

    const addLanguage = async (data: LanguageFormData) => {
      if (!selectedProblem) return setError("Please select or create a problem first.")
      setIsLoading(true)
      const langDefaults = defaultPlaceholder[data.language as keyof typeof defaultPlaceholder] || {
        placeholder: "// Write your solution here\n",
        code: "// Add validation logic here\n",
      }
      try {
        await handleApiCall("post", "/language", {
          problem_id: selectedProblem.problem_id,
          language: data.language,
          validation_code: {
            placeholder: data.placeholder || langDefaults.placeholder,
            code: data.code || langDefaults.code,
          },
        })
        setSuccess("Language added successfully")
        setLanguages([
          ...languages,
          {
            language: data.language,
            placeholder: data.placeholder || langDefaults.placeholder,
            code: data.code || langDefaults.code,
          },
        ])
        reset()
      } catch (err) {
        setError("Failed to add language support")
      } finally {
        setIsLoading(false)
      }
    }

    const updateLanguage = async (data: LanguageFormData) => {
      if (!selectedProblem) return setError("Please select a problem first.")
      setIsLoading(true)
      try {
        await handleApiCall("put", "/language", {
          problem_id: selectedProblem.problem_id,
          language: data.language,
          validation_code: { placeholder: data.placeholder, code: data.code },
        })
        setSuccess("Language updated successfully")
        setLanguages(languages.map((lang) => (lang.language === data.language ? { ...data } : lang)))
        setSelectedLanguage(null)
        reset()
      } catch (err) {
        setError("Failed to update language support")
      } finally {
        setIsLoading(false)
      }
    }

    const removeLanguage = async (language: string) => {
      if (
        !selectedProblem ||
        !window.confirm(`Are you sure you want to remove ${formatLanguageName(language)} support?`)
      )
        return
      setIsLoading(true)
      try {
        await handleApiCall("delete", "/language", { problem_id: selectedProblem.problem_id, language })
        setSuccess("Language removed successfully")
        setLanguages(languages.filter((lang) => lang.language !== language))
        if (selectedLanguage?.language === language) {
          reset()
          setSelectedLanguage(null)
        }
      } catch (err) {
        setError("Failed to remove language support")
      } finally {
        setIsLoading(false)
      }
    }

    const handleEditLanguage = (lang: LanguageSupport) => {
      setSelectedLanguage(lang)
      setValue("language", lang.language, { shouldValidate: true })
      setValue("placeholder", lang.placeholder, { shouldValidate: true })
      setValue("code", lang.code, { shouldValidate: true })
    }

    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" onClick={() => setView("list")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>
          <h1 className="text-2xl font-bold">Languages: {selectedProblem?.title}</h1>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Supported Languages</CardTitle>
                <CardDescription>Languages that can be used to solve this problem</CardDescription>
              </CardHeader>
              <CardContent>
                {languages.length > 0 ? (
                  <div className="space-y-2">
                    {languages.map((lang) => (
                      <div
                        key={lang.language}
                        className="flex justify-between items-center p-3 rounded-md border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {getLanguageIcon(lang.language)}
                          <span className="font-medium">{formatLanguageName(lang.language)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLanguage(lang)}
                            disabled={isLoading}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeLanguage(lang.language)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Code className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No languages configured yet.</p>
                  </div>
                )}

                {!selectedLanguage && (
                  <div className="mt-4">
                    <Label htmlFor="language">Add New Language</Label>
                    <Select
                      disabled={!!selectedLanguage || isSubmitting}
                      onValueChange={handleLanguageSelect}
                      defaultValue=""
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Select a language</SelectItem>
                        {["python", "javascript", "cpp", "go"]
                          .filter((lang) => !languages.some((l) => l.language === lang))
                          .map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {formatLanguageName(lang)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" {...register("language")} />
                    {errors.language && <p className="text-sm text-red-500 mt-1">{errors.language.message}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedLanguage
                    ? `Edit ${formatLanguageName(selectedLanguage.language)}`
                    : "Language Configuration"}
                </CardTitle>
                <CardDescription>
                  {selectedLanguage
                    ? "Update the language configuration below"
                    : "Configure code templates and validation for this language"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(selectedLanguage ? updateLanguage : addLanguage)} className="space-y-4">
                  <div>
                    <Label htmlFor="placeholder">Placeholder Code</Label>
                    <Textarea
                      id="placeholder"
                      {...register("placeholder")}
                      className="mt-1 min-h-24 font-mono text-sm"
                      placeholder="Enter default code shown to users..."
                    />
                    {errors.placeholder && <p className="text-sm text-red-500 mt-1">{errors.placeholder.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="code">Validation Code</Label>
                    <Textarea
                      id="code"
                      {...register("code")}
                      className="mt-1 min-h-40 font-mono text-sm"
                      placeholder="Enter code to validate submissions..."
                    />
                    {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>}
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                      {(isSubmitting || isLoading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {selectedLanguage ? "Update Language" : "Add Language"}
                    </Button>
                    {selectedLanguage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          reset()
                          setSelectedLanguage(null)
                        }}
                        disabled={isSubmitting || isLoading}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Validation View
  const ValidationView = () => {
    const [validationResult, setValidationResult] = useState<any>(null)
    const [isValidating, setIsValidating] = useState(false)

    const onValidate = async () => {
      if (!selectedProblem) return setError("Please select a problem first.")
      setIsValidating(true)
      try {
        const res = await handleApiCall("get", "/validate", null, { problem_id: selectedProblem.problem_id })
        setValidationResult(res)
      } catch (error) {
        setError("Validation failed")
      } finally {
        setIsValidating(false)
      }
    }

    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" onClick={() => setView("list")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>
          <h1 className="text-2xl font-bold">Validate: {selectedProblem?.title}</h1>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Problem Validation</CardTitle>
              <CardDescription>Verify that the problem is correctly configured</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <p className="text-muted-foreground mb-6">
                  Run validation to check if this problem is correctly configured with test cases and language support.
                </p>
                <Button
                  onClick={onValidate}
                  disabled={isValidating || loading}
                  className="flex items-center mx-auto"
                  size="lg"
                >
                  {isValidating || loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Run Validation
                </Button>
              </div>
            </CardContent>
          </Card>

          {validationResult && (
            <Card
              className={
                validationResult.success
                  ? "border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900"
                  : "border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900"
              }
            >
              <CardHeader>
                <CardTitle className={validationResult.success ? "text-green-600" : "text-red-600"}>
                  {validationResult.success ? "Validation Successful" : "Validation Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  {validationResult.success ? (
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-lg">
                      {validationResult.success ? "All checks passed" : "Validation issues found"}
                    </h3>
                    {validationResult.message && (
                      <p className={validationResult.success ? "text-green-600" : "text-red-600"}>
                        {validationResult.message}
                      </p>
                    )}
                  </div>
                </div>

                {validationResult.error_type && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <h4 className="font-medium mb-2 text-red-600">Error Details</h4>
                    <p className="text-red-600">
                      <span className="font-medium">Error Type:</span> {validationResult.error_type}
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (validationResult.success) {
                        setView("list")
                      } else {
                        if (validationResult.error_type?.includes("testcase")) {
                          setView("testcases")
                        } else if (validationResult.error_type?.includes("language")) {
                          setView("languages")
                        }
                      }
                    }}
                  >
                    {validationResult.success ? "Return to Problem List" : "Fix Issues"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // API Response View (Updated to show history)
  const ApiResponseView = () => (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" onClick={() => setView("list")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Problems
        </Button>
        <h1 className="text-2xl font-bold">API Response History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Call History</CardTitle>
          <CardDescription>View all API requests and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] rounded-md border">
            {apiHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Server className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No API calls recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {apiHistory.map((entry, index) => (
                  <div key={index} className="border rounded-md">
                    <div className="flex justify-between items-center p-4 bg-muted/50">
                      <div>
                        <p className="font-medium">
                          {entry.method.toUpperCase()} {entry.url}
                        </p>
                        <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(entry, null, 2))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Sent Data</h4>
                        <SyntaxHighlighter
                          language="json"
                          style={tomorrow}
                          customStyle={{
                            padding: "12px",
                            fontSize: "13px",
                            backgroundColor: "hsl(var(--muted))",
                            margin: 0,
                            borderRadius: "4px",
                          }}
                        >
                          {entry.sentData ? JSON.stringify(entry.sentData, null, 2) : "None"}
                        </SyntaxHighlighter>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Received Data</h4>
                        <SyntaxHighlighter
                          language="json"
                          style={tomorrow}
                          customStyle={{
                            padding: "12px",
                            fontSize: "13px",
                            backgroundColor: "hsl(var(--muted))",
                            margin: 0,
                            borderRadius: "4px",
                          }}
                        >
                          {JSON.stringify(entry.receivedData, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {view === "list" && <ProblemListView />}
      {view === "details" && <ProblemDetailsView />}
      {view === "testcases" && selectedProblem && <TestCasesView />}
      {view === "languages" && selectedProblem && <LanguagesView />}
      {view === "validation" && selectedProblem && <ValidationView />}
      {view === "api" && <ApiResponseView />}
    </div>
  )
}
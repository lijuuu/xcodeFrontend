"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import MDEditor from '@uiw/react-md-editor';
import axios from "axios"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"
import { Editor } from '@monaco-editor/react';

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
  Maximize2, Minimize2,
  CodeIcon,
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
import { cn } from "@/lib/utils"

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
  template: z.string().min(1, "Template code is neccessary")
})

type ProblemFormData = z.infer<typeof problemSchema>
type TestCaseFormData = z.infer<typeof testCaseSchema>
type BulkTestCaseFormData = z.infer<typeof bulkTestCaseSchema>
type LanguageFormData = z.infer<typeof languageSchema>

interface LanguageSupport {
  language: string
  placeholder: string
  code: string
  template: string
}

interface ApiHistoryEntry {
  timestamp: string
  method: string
  url: string
  sentData: any
  receivedData: any
}


// MultiSelect component for tags
const MultiSelect = ({ options, selected, onChange, placeholder, className }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const filteredOptions = options.filter(
    (option: any) =>
      !selected.find((s: any) => s.value === option.value) &&
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
  )

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
          {selected.map((item: any) => (
            <Badge
              key={item.value}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-0.5 text-xs dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
            >
              {item.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none focus:ring-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(selected.filter((s: any) => s.value !== item.value))
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            />
          </div>
          <ul className="max-h-60 overflow-auto p-2">
            {filteredOptions.length === 0 && (
              <li className="px-2 py-1.5 text-sm text-zinc-500 dark:text-zinc-400">No options found</li>
            )}
            {filteredOptions.map((option: any) => (
              <li
                key={option.value}
                className="cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange([...selected, option])
                  setSearchValue("")
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
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
      setLanguages(languageSupports as any)
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
        toast.success(res.data.message || "Action completed successfully!", { duration: 3000 })
        setTimeout(() => setSuccess(null), 3000)
        return res.data
      } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message || "Action failed"
        const historyEntry: ApiHistoryEntry = {
          timestamp,
          method,
          url,
          sentData: data || params || null,
          receivedData: error.response?.data || error.message,
        }
        setApiHistory((prev) => [historyEntry, ...prev])
        setError(errorMessage)
        toast.error(errorMessage, { duration: 10000 })
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
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
      case "M":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "H":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20"
    }
  }

  const getValidationColorCSS = (validated: boolean) =>
    validated
      ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
      : "bg-red-500/10 text-red-500 hover:bg-red-500/20";


  const applyFilters = useCallback(() => {
    let filtered = [...problems];
    if (filters.search) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.difficulty !== "all") {
      filtered = filtered.filter((p) => mapDifficulty(p.difficulty) === filters.difficulty);
    }
    if (filters.tags) {
      const tag = filters.tags.toLowerCase();
      filtered = filtered.filter((p) => p.tags.some((t: string) => t.toLowerCase().includes(tag)));
    }
    setFilteredProblems(filtered);
  }, [problems, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Problem List View with uncontrolled inputs
  const ProblemListView = () => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Debounce function to limit filter updates
    const debounce = useCallback(
      (func: (...args: any[]) => void, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), wait);
        };
      },
      []
    );

    // Debounced filter update
    const updateFilters = debounce((search: string, tags: string) => {
      setFilters((prev) => ({
        ...prev,
        search,
        tags,
      }));
    }, 300);

    // Handle input changes without immediate state updates
    const handleSearchChange = () => {
      const searchValue = searchInputRef.current?.value || "";
      updateFilters(searchValue, tagInputRef.current?.value || "");
    };

    const handleTagChange = () => {
      const tagValue = tagInputRef.current?.value || "";
      updateFilters(searchInputRef.current?.value || "", tagValue);
    };

    // Clear filters and reset input values
    const clearFilters = () => {
      setFilters({ search: "", difficulty: "all", tags: "" });
      if (searchInputRef.current) searchInputRef.current.value = "";
      if (tagInputRef.current) tagInputRef.current.value = "";
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search problems..."
                  defaultValue={filters.search}
                  onChange={handleSearchChange}
                  className="pl-9 w-full border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowFilters(!showFilters);
                  if (!showFilters && searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                className={`border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23] ${showFilters ? "bg-gray-100 dark:bg-[#1F1F23]" : ""}`}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setView("details")}
                className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Problem
              </Button>
              {apiHistory.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setView("api")}
                  className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                >
                  <Server className="h-4 w-4 mr-2" />
                  API History
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <Card className="p-4 bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="difficulty-filter"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                  >
                    Difficulty
                  </Label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
                  >
                    <SelectTrigger
                      id="difficulty-filter"
                      className="border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                    >
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23] text-gray-900 dark:text-gray-100">
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="tag-filter"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                  >
                    Tag
                  </Label>
                  <Input
                    id="tag-filter"
                    ref={tagInputRef}
                    placeholder="Filter by tag..."
                    defaultValue={filters.tags}
                    onChange={handleTagChange}
                    className="border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full sm:w-auto border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
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
            <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-100" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Problems</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredProblems.length} {filteredProblems.length === 1 ? "problem" : "problems"} found
          </p>
        </div>

        {filteredProblems.length === 0 && !loading ? (
          <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <FileCode className="h-6 w-6 text-zinc-900 dark:text-zinc-100 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No problems found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create a new problem to get started.</p>
              <Button
                onClick={() => setView("details")}
                className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Problem
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProblems.map((problem) => (
              <Card
                key={problem.problem_id}
                className="bg-white dark:bg-[#151515] hover:dark:bg-[#181717] border-gray-200 dark:border-[#373738] hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-200"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={`${getDifficultyColor(problem.difficulty)} font-normal mb-2`}>
                      {mapDifficulty(problem.difficulty)}
                    </Badge>
                    <Badge className={`font-normal mb-2 ${getValidationColorCSS(problem.validated)}`}>
                      {problem.validated ? "Validated" : "Not Validated"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100 truncate">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {problem.tags.slice(0, 3).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="font-normal text-xs text-gray-700 dark:text-gray-300 border-gray-200 dark:border-2 dark:border-[#1F1F23]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {problem.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="font-normal text-xs text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1F1F23]"
                      >
                        +{problem.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      fetchProblemDetails(problem.problem_id);
                      setView("details");
                    }}
                    className="bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#2B2B30]"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      fetchProblemDetails(problem.problem_id);
                      setView("testcases");
                    }}
                    className="bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#2B2B30]"
                  >
                    Test Cases
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      fetchProblemDetails(problem.problem_id);
                      setView("languages");
                    }}
                    className="bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#2B2B30]"
                  >
                    Languages
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      fetchProblemDetails(problem.problem_id);
                      setView("validation");
                    }}
                    className="bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#2B2B30]"
                  >
                    Validate
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };


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
        : { title: "", description: "", tags: [], difficulty: "" },
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
        reset({ title: "", description: "", tags: [], difficulty: "" })
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
      <div>
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setView("list")}
            className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedProblem ? "Edit Problem" : "Create Problem"}
          </h1>
        </div>


        <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              {selectedProblem ? "Edit Problem Details" : "Create New Problem"}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {selectedProblem ? "Update the problem details" : "Add a new coding problem"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                    Title
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter problem title"
                    className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">
                      Difficulty
                    </Label>
                    <Controller
                      name="difficulty"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23] text-gray-900 dark:text-gray-100">
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.difficulty && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.difficulty.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-gray-700 dark:text-gray-300">
                      Tags
                    </Label>
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          options={predefinedTags.map((tag) => ({ value: tag, label: tag }))}
                          selected={field.value.map((tag) => ({ value: tag, label: tag })) || []}
                          onChange={(selected: any) => field.onChange(selected.map((s: any) => s.value))}
                          placeholder="Select tags..."
                          className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                        />
                      )}
                    />
                    {errors.tags && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.tags.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  {/* <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe the problem..."
                    className="mt-1 min-h-32 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                  /> */}
                  <Controller
                    name="description"
                    control={control}
                    defaultValue={selectedProblem?.description || ""} // Use the selected problem's description or an empty string
                    render={({ field }) => (
                      <MDEditor
                        value={field.value}
                        onChange={(value) => field.onChange(value)} // Manually update the value
                        textareaProps={{
                          placeholder: "Please enter Markdown text",
                          maxLength: 1000,
                        }}
                        className="mt-1 min-h-32 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {selectedProblem ? "Update Problem" : "Create Problem"}
                </Button>
                {selectedProblem && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isSubmitting || loading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("list")}
                  className="ml-auto border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                >
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
      control: runControl,
      handleSubmit: handleSubmitRun,
      reset: resetRun,
      formState: { errors: errorsRun },
    } = useForm<TestCaseFormData>({
      resolver: zodResolver(testCaseSchema),
      defaultValues: { input: "", expected: "" },
      mode: "onChange",
    })
    const {
      control: submitControl,
      handleSubmit: handleSubmitSubmit,
      reset: resetSubmit,
      formState: { errors: errorsSubmit },
    } = useForm<TestCaseFormData>({
      resolver: zodResolver(testCaseSchema),
      defaultValues: { input: "", expected: "" },
      mode: "onChange",
    })
    const {
      control: bulkControl,
      handleSubmit: handleSubmitBulk,
      setValue: setBulkValue,
      reset: resetBulk,
      formState: { errors: errorsBulk },
    } = useForm<{ bulkJson: string }>({
      resolver: zodResolver(
        z.object({
          bulkJson: z
            .string()
            .min(1, "JSON is required")
            .refine((val) => {
              try {
                const parsed = JSON.parse(val)
                return bulkTestCaseSchema.safeParse(parsed).success
              } catch {
                return false
              }
            }, "Invalid JSON format or structure"),
        }),
      ),
      defaultValues: { bulkJson: "" },
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
      const parsedJson = JSON.parse(data.bulkJson)
      await handleApiCall("post", "/testcases", {
        problem_id: selectedProblem.problem_id,
        testcases: parsedJson,
      })
      resetBulk()
      setActiveTab("existing")
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
      toast.success("Example JSON copied to clipboard!", { duration: 3000 })
    }

    return (
      <div>
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setView("list")}
            className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Cases: {selectedProblem?.title}</h1>
        </div>

        {error && (
          <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100 dark:bg-[#1F1F23] border-gray-200 dark:border-[#1F1F23]">
            <TabsTrigger
              value="existing"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2B2B30] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0F0F12] data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
            >
              Existing
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2B2B30] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0F0F12] data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
            >
              Add New
            </TabsTrigger>
            <TabsTrigger
              value="bulk"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2B2B30] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0F0F12] data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
            >
              Bulk Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Existing Test Cases</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    View and manage test cases
                  </CardDescription>
                </div>
                {selectedTestCases.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onBulkDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedTestCases.size})
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border border-gray-200 dark:border-[#1F1F23]">
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-[#1F1F23]">
                          <th className="p-2 text-left w-10"></th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-300">Type</th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-300">Input</th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-300">Expected</th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProblem?.testcases?.run?.map((tc: any, i: number) => (
                          <tr
                            key={i}
                            className="border-b border-gray-200 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors"
                          >
                            <td className="p-2">
                              <Checkbox
                                checked={selectedTestCases.has(tc.id || tc.testcase_id || `run_${i}`)}
                                onCheckedChange={() => toggleTestCaseSelection(tc.id || tc.testcase_id || `run_${i}`)}
                              />
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                                Run
                              </Badge>
                            </td>
                            <td className="p-2 truncate max-w-xs text-gray-900 dark:text-gray-200">
                              [ {tc.input.replace(" ", ", ")} ]
                            </td>
                            <td className="p-2 truncate max-w-xs text-gray-900 dark:text-gray-200">
                              [ {tc.expected.replace(" ", ", ")} ]
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(tc.id || tc.testcase_id || `run_${i}`, true)}
                                disabled={loading}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {selectedProblem?.testcases?.submit?.map((tc: any, i: number) => (
                          <tr
                            key={i}
                            className="border-b border-gray-200 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors"
                          >
                            <td className="p-2">
                              <Checkbox
                                checked={selectedTestCases.has(tc.id || tc.testcase_id || `submit_${i}`)}
                                onCheckedChange={() =>
                                  toggleTestCaseSelection(tc.id || tc.testcase_id || `submit_${i}`)
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                Submit
                              </Badge>
                            </td>
                            <td className="p-2 truncate max-w-xs text-gray-900 dark:text-gray-200">
                              [ {tc.input.replace(" ", ", ")} ]
                            </td>
                            <td className="p-2 truncate max-w-xs text-gray-900 dark:text-gray-200">
                              [ {tc.expected.replace(" ", ", ")} ]
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(tc.id || tc.testcase_id || `submit_${i}`, false)}
                                disabled={loading}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                        <ListChecks className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-600 dark:text-gray-400">No test cases added yet.</p>
                        <Button
                          variant="outline"
                          className="mt-4 border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                          onClick={() => setActiveTab("add")}
                        >
                          Add Test Case
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
              <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Add Run Test Case</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    For development testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRun(onAddRun)} className="space-y-4">
                    <div>
                      <Label htmlFor="run-input" className="text-gray-700 dark:text-gray-300">
                        Input
                      </Label>
                      <Controller
                        name="input"
                        control={runControl}
                        render={({ field }) => (
                          <Input
                            id="run-input"
                            {...field}
                            placeholder="Enter input..."
                            className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                          />
                        )}
                      />
                      {errorsRun.input && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorsRun.input.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="run-expected" className="text-gray-700 dark:text-gray-300">
                        Expected Output
                      </Label>
                      <Controller
                        name="expected"
                        control={runControl}
                        render={({ field }) => (
                          <Input
                            id="run-expected"
                            {...field}
                            placeholder="Enter expected output..."
                            className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                          />
                        )}
                      />
                      {errorsRun.expected && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorsRun.expected.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Run Test Case
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Add Submit Test Case</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">For final submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitSubmit(onAddSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="submit-input" className="text-gray-700 dark:text-gray-300">
                        Input
                      </Label>
                      <Controller
                        name="input"
                        control={submitControl}
                        render={({ field }) => (
                          <Input
                            id="submit-input"
                            {...field}
                            placeholder="Enter input..."
                            className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                          />
                        )}
                      />
                      {errorsSubmit.input && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorsSubmit.input.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="submit-expected" className="text-gray-700 dark:text-gray-300">
                        Expected Output
                      </Label>
                      <Controller
                        name="expected"
                        control={submitControl}
                        render={({ field }) => (
                          <Input
                            id="submit-expected"
                            {...field}
                            placeholder="Enter expected output..."
                            className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                          />
                        )}
                      />
                      {errorsSubmit.expected && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorsSubmit.expected.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Submit Test Case
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Bulk Upload Test Cases</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Upload multiple test cases via JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBulk(onBulkUpload)} className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="bulk-json" className="text-gray-700 dark:text-gray-300">
                      JSON Data
                    </Label>
                    <div className="flex justify-end mb-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkValue("bulkJson", exampleJson)}
                        className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                      >
                        Load Example
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyExampleJson}
                        className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Example
                      </Button>
                    </div>
                    <Controller
                      name="bulkJson"
                      control={bulkControl}
                      render={({ field }) => (
                        <Textarea
                          id="bulk-json"
                          {...field}
                          placeholder={exampleJson}
                          className="min-h-40 font-mono text-sm border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100"
                        />
                      )}
                    />
                    {errorsBulk.bulkJson && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorsBulk.bulkJson.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
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

  const LanguagesView = () => {
    const {
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isSubmitting },
    } = useForm<LanguageFormData>({
      resolver: zodResolver(languageSchema),
      defaultValues: { language: "", placeholder: "", code: "", template: "" },
      mode: "onChange",
    });

    const [selectedLanguage, setSelectedLanguage] = useState<LanguageSupport | null>(null);
    const [languages, setLanguages] = useState<LanguageSupport[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isTemplateFullScreen, setIsTemplateFullScreen] = useState(false);
    const [isPlaceholderFullScreen, setIsPlaceholderFullScreen] = useState(false);
    const [isCodeFullScreen, setIsCodeFullScreen] = useState(false);

    // Sync languages with selectedProblem.validate_code when it changes
    useEffect(() => {
      if (selectedProblem?.validate_code) {
        const languageSupports = Object.entries(selectedProblem.validate_code).map(([language, code]) => {
          const typedCode = code as { placeholder?: string; code?: string; template?: string };
          return {
            language,
            placeholder: typedCode.placeholder || "",
            code: typedCode.code || "",
            template: typedCode.template || "",
          };
        });
        setLanguages(languageSupports);
      } else {
        setLanguages([]);
      }
    }, [selectedProblem]);

    const formatLanguageName = (lang: string) => {
      switch (lang.toLowerCase()) {
        case "python": return "Python";
        case "javascript": return "JavaScript";
        case "cpp": return "C++";
        case "go": return "Go";
        default: return lang;
      }
    };

    const getLanguageIcon = (lang: string) => {
      const colors = {
        python: "text-blue-500",
        javascript: "text-yellow-500",
        cpp: "text-purple-500",
        go: "text-cyan-500",
      };
      return (
        <CodeIcon
          className={`h-5 w-5 ${colors[lang.toLowerCase() as keyof typeof colors] || "text-zinc-900 dark:text-zinc-100"}`}
        />
      );
    };

    const defaultPlaceholder = {
      python: {
        placeholder: "# Write your Python solution here\n",
        code: "def validate_solution():\n    # Add validation logic here\n    pass\n",
        template: "# Template code for users\nclass Solution:\n    def solve(self):\n        pass\n",
      },
      javascript: {
        placeholder: "// Write your JavaScript solution here\n",
        code: "function validateSolution() {\n    // Add validation logic here\n}\n",
        template: "// Template code for users\nfunction solution() {\n    return null;\n}\n",
      },
      cpp: {
        placeholder: "// Write your C++ solution here\n#include <iostream>\n",
        code: "#include <iostream>\nbool validateSolution() {\n    // Add validation logic here\n    return true;\n}\n",
        template: "#include <iostream>\nclass Solution {\npublic:\n    bool solve() {\n        return false;\n    }\n};\n",
      },
      go: {
        placeholder: "// Write your Go solution here\npackage main\n",
        code: "package main\nfunc validateSolution() bool {\n    // Add validation logic here\n    return true;\n}\n",
        template: "package main\ntype Solution struct{}\nfunc (s Solution) Solve() bool {\n    return false\n}\n",
      },
    };

    const languageMap = {
      python: "python",
      javascript: "javascript",
      cpp: "cpp",
      go: "go",
    };

    const handleLanguageSelect = (value: string) => {
      if (value && value !== "select") {
        const defaults = defaultPlaceholder[value as keyof typeof defaultPlaceholder];
        setValue("language", value, { shouldValidate: true });
        setValue("placeholder", defaults.placeholder, { shouldValidate: true });
        setValue("code", defaults.code, { shouldValidate: true });
        setValue("template", defaults.template, { shouldValidate: true });
      }
    };

    const addLanguage = async (data: LanguageFormData) => {
      if (!selectedProblem) return setError("Please select or create a problem first.");
      const langDefaults = defaultPlaceholder[data.language as keyof typeof defaultPlaceholder] || {
        placeholder: "// Write your solution here\n",
        code: "// Add validation logic here\n",
        template: "// Template code here\n",
      };
      try {
        setLoading(true);
        await handleApiCall("post", "/language", {
          problem_id: selectedProblem.problem_id,
          language: data.language,
          validation_code: {
            placeholder: data.placeholder || langDefaults.placeholder,
            code: data.code || langDefaults.code,
            template: data.template || langDefaults.template,
          },
        });
        setLanguages([
          ...languages,
          {
            language: data.language,
            placeholder: data.placeholder || langDefaults.placeholder,
            code: data.code || langDefaults.code,
            template: data.template || langDefaults.template,
          },
        ]);
        reset();
        setSuccess("Language added successfully");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Failed to add language");
      } finally {
        setLoading(false);
      }
    };

    const updateLanguage = async (data: LanguageFormData) => {
      if (!selectedProblem) return setError("Please select a problem first.");
      try {
        setLoading(true);
        await handleApiCall("put", "/language", {
          problem_id: selectedProblem.problem_id,
          language: data.language,
          validation_code: {
            placeholder: data.placeholder,
            code: data.code,
            template: data.template,
          },
        });
        setLanguages(languages.map((lang) =>
          lang.language === data.language ? { ...data } : lang
        ));
        setSelectedLanguage(null);
        reset();
        setSuccess("Language updated successfully");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Failed to update language");
      } finally {
        setLoading(false);
      }
    };

    const removeLanguage = async (language: string) => {
      if (!selectedProblem || !window.confirm(`Are you sure you want to remove ${formatLanguageName(language)} support?`)) return;
      try {
        setLoading(true);
        await handleApiCall("delete", "/language", { problem_id: selectedProblem.problem_id, language });
        setLanguages(languages.filter((lang) => lang.language !== language));
        if (selectedLanguage?.language === language) {
          reset();
          setSelectedLanguage(null);
        }
        setSuccess("Language removed successfully");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Failed to remove language");
      } finally {
        setLoading(false);
      }
    };

    const handleEditLanguage = (lang: LanguageSupport) => {
      setSelectedLanguage(lang);
      setValue("language", lang.language, { shouldValidate: true });
      setValue("placeholder", lang.placeholder, { shouldValidate: true });
      setValue("code", lang.code, { shouldValidate: true });
      setValue("template", lang.template || "", { shouldValidate: true });
    };

    const toggleTemplateFullScreen = () => setIsTemplateFullScreen(!isTemplateFullScreen);
    const togglePlaceholderFullScreen = () => setIsPlaceholderFullScreen(!isPlaceholderFullScreen);
    const toggleCodeFullScreen = () => setIsCodeFullScreen(!isCodeFullScreen);

    return (
      <div>
        {!(isTemplateFullScreen || isPlaceholderFullScreen || isCodeFullScreen) && (
          <>
            <div className="mb-6 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setView("list")}
                className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Languages: {selectedProblem?.title || "No problem selected"}
              </h1>
            </div>

            {error && (
              <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 mb-6">
                <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </CardContent>
              </Card>
            )}

            {success && (
              <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 mb-6">
                <CardContent className="p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <p>{success}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Supported Languages</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Languages available for this problem
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {languages.length > 0 ? (
                      <div className="space-y-2">
                        {languages.map((lang) => (
                          <div
                            key={lang.language}
                            className="flex justify-between items-center p-3 rounded-md border border-gray-200 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {getLanguageIcon(lang.language)}
                              <span className="font-medium text-gray-900 dark:text-gray-200">
                                {formatLanguageName(lang.language)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLanguage(lang)}
                                disabled={loading}
                                className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeLanguage(lang.language)}
                                disabled={loading}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-gray-200 dark:border-[#1F1F23]"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <CodeIcon className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-600 dark:text-gray-400">No languages configured yet.</p>
                      </div>
                    )}

                    {!selectedLanguage && (
                      <div className="mt-4">
                        <Label htmlFor="language" className="text-gray-700 dark:text-gray-300">
                          Add New Language
                        </Label>
                        <Controller
                          name="language"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleLanguageSelect(value);
                              }}
                              value={field.value}
                            >
                              <SelectTrigger className="mt-1 border-gray-200 dark:border-[#1F1F23] dark:bg-[#0F0F12] text-gray-900 dark:text-gray-100">
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23] text-gray-900 dark:text-gray-100">
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
                          )}
                        />
                        {errors.language && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.language.message}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      {selectedLanguage ? `Edit ${formatLanguageName(selectedLanguage.language)}` : "Configure Language"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {selectedLanguage ? "Update language settings" : "Add code templates and validation"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(selectedLanguage ? updateLanguage : addLanguage)} className="space-y-4">
                      <div className="relative">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="template" className="text-gray-700 dark:text-gray-300">
                            Template Code
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTemplateFullScreen}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            {isTemplateFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Controller
                          name="template"
                          control={control}
                          render={({ field }) => (
                            <Editor
                              height={isTemplateFullScreen ? "100vh" : "150px"}
                              width={isTemplateFullScreen ? "100vw" : "100%"}
                              language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                              value={field.value}
                              onChange={(value) => field.onChange(value || "")}
                              className={`mt-1 border-gray-200 dark:border-[#1F1F23] rounded-md ${isTemplateFullScreen ? 'absolute top-0 left-0 z-50' : ''}`}
                              theme="vs-dark"
                              options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                folding: false,
                                lineNumbers: "on",
                                glyphMargin: false,
                                renderValidationDecorations: "off",
                                hover: { enabled: false },
                                quickSuggestions: false,
                                codeLens: false,
                              }}
                            />
                          )}
                        />
                        {errors.template && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.template.message}</p>
                        )}
                      </div>
                      <div className="relative">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="placeholder" className="text-gray-700 dark:text-gray-300">
                            Placeholder Code
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePlaceholderFullScreen}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            {isPlaceholderFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Controller
                          name="placeholder"
                          control={control}
                          render={({ field }) => (
                            <Editor
                              height={isPlaceholderFullScreen ? "100vh" : "150px"}
                              width={isPlaceholderFullScreen ? "100vw" : "100%"}
                              language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                              value={field.value}
                              onChange={(value) => field.onChange(value || "")}
                              className={`mt-1 border-gray-200 dark:border-[#1F1F23] rounded-md ${isPlaceholderFullScreen ? 'absolute top-0 left-0 z-50' : ''}`}
                              theme="vs-dark"
                              options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                folding: false,
                                lineNumbers: "on",
                                glyphMargin: false,
                                renderValidationDecorations: "off",
                                hover: { enabled: false },
                                quickSuggestions: false,
                                codeLens: false,
                              }}
                            />
                          )}
                        />
                        {errors.placeholder && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.placeholder.message}</p>
                        )}
                      </div>
                      <div className="relative">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">
                            Validation Code
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleCodeFullScreen}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            {isCodeFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Controller
                          name="code"
                          control={control}
                          render={({ field }) => (
                            <Editor
                              height={isCodeFullScreen ? "100vh" : "150px"}
                              width={isCodeFullScreen ? "100 provincie%" : "100%"}
                              language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                              value={field.value}
                              onChange={(value) => field.onChange(value || "")}
                              className={`mt-1 border-gray-200 dark:border-[#1F1F23] rounded-md ${isCodeFullScreen ? 'absolute top-0 left-0 z-50' : ''}`}
                              theme="vs-dark"
                              options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                folding: false,
                                lineNumbers: "on",
                                glyphMargin: false,
                                renderValidationDecorations: "off",
                                hover: { enabled: false },
                                quickSuggestions: false,
                                codeLens: false,
                              }}
                            />
                          )}
                        />
                        {errors.code && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.code.message}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={isSubmitting || loading}
                          className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                        >
                          {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {selectedLanguage ? "Update Language" : "Add Language"}
                        </Button>
                        {selectedLanguage && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              reset();
                              setSelectedLanguage(null);
                            }}
                            disabled={isSubmitting || loading}
                            className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {isTemplateFullScreen && (
          <div className="absolute top-0 left-0 w-full h-full z-50 bg-white dark:bg-[#0F0F12]">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1F1F23] border-b border-gray-200 dark:border-[#2C2C2C]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Template Code Editor</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTemplateFullScreen}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Minimize2 className="h-6 w-6" />
              </Button>
            </div>
            <Controller
              name="template"
              control={control}
              render={({ field }) => (
                <Editor
                  height="calc(100vh - 48px)"
                  width="100vw"
                  language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                  value={field.value}
                  onChange={(value) => field.onChange(value || "")}
                  className="border-gray-200 dark:border-[#1F1F23] rounded-md"
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    folding: false,
                    lineNumbers: "on",
                    glyphMargin: false,
                    renderValidationDecorations: "off",
                    hover: { enabled: false },
                    quickSuggestions: false,
                    codeLens: false,
                  }}
                />
              )}
            />
          </div>
        )}

        {isPlaceholderFullScreen && (
          <div className="absolute top-0 left-0 w-full h-full z-50 bg-white dark:bg-[#0F0F12]">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1F1F23] border-b border-gray-200 dark:border-[#2C2C2C]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Placeholder Editor</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlaceholderFullScreen}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Minimize2 className="h-6 w-6" />
              </Button>
            </div>
            <Controller
              name="placeholder"
              control={control}
              render={({ field }) => (
                <Editor
                  height="calc(100vh - 48px)"
                  width="100vw"
                  language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                  value={field.value}
                  onChange={(value) => field.onChange(value || "")}
                  className="border-gray-200 dark:border-[#1F1F23] rounded-md"
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    folding: false,
                    lineNumbers: "on",
                    glyphMargin: false,
                    renderValidationDecorations: "off",
                    hover: { enabled: false },
                    quickSuggestions: false,
                    codeLens: false,
                  }}
                />
              )}
            />
          </div>
        )}

        {isCodeFullScreen && (
          <div className="absolute top-0 left-0 w-full h-full z-50 bg-white dark:bg-[#0F0F12]">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1F1F23] border-b border-gray-200 dark:border-[#2C2C2C]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Code Editor</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCodeFullScreen}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Minimize2 className="h-6 w-6" />
              </Button>
            </div>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Editor
                  height="calc(100vh - 48px)"
                  width="100vw"
                  language={languageMap[selectedLanguage?.language as keyof typeof languageMap] || "javascript"}
                  value={field.value}
                  onChange={(value) => field.onChange(value || "")}
                  className="border-gray-200 dark:border-[#1F1F23] rounded-md"
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    folding: false,
                    lineNumbers: "on",
                    glyphMargin: false,
                    renderValidationDecorations: "off",
                    hover: { enabled: false },
                    quickSuggestions: false,
                    codeLens: false,
                  }}
                />
              )}
            />
          </div>
        )}
      </div>
    );
  };

  // Validation View
  const ValidationView = () => {
    const [validationResult, setValidationResult] = useState<any>(null)
    const [isValidating, setIsValidating] = useState(false)

    const onValidate = async () => {
      if (!selectedProblem) return setError("Please select a problem first.")
      setIsValidating(true)
      try {
        const res = await handleApiCall("get", "/validate", null, { problem_id: selectedProblem.problem_id })
        setValidationResult({
          success: res.success,
          message: res.message || (res.success ? "All checks passed" : "Validation failed"),
          error_type: res.error_type,
        })
      } catch (error) {
        setValidationResult({
          success: false,
          message: "Validation failed",
          error_type: null,
        })
      } finally {
        setIsValidating(false)
      }
    }

    return (
      <div>
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setView("list")}
            className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Validate: {selectedProblem?.title}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Problem Validation</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Check if the problem is correctly configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-zinc-900/50 dark:text-zinc-100/50" />
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Validate test cases and language support configuration.
                </p>
                <Button
                  onClick={onValidate}
                  disabled={isValidating || loading}
                  size="lg"
                  className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
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
                  ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10"
                  : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10"
              }
            >
              <CardHeader>
                <CardTitle
                  className={
                    validationResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }
                >
                  {validationResult.success ? "Validation Successful" : "Validation Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {validationResult.success ? (
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p
                      className={
                        validationResult.success
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {validationResult.message}
                    </p>
                    {validationResult.error_type && (
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        Error Type: {validationResult.error_type}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (validationResult.success) {
                        setView("list")
                      } else if (validationResult.error_type?.includes("testcase")) {
                        setView("testcases")
                      } else if (validationResult.error_type?.includes("language")) {
                        setView("languages")
                      }
                    }}
                    className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                  >
                    {validationResult.success ? "Back to List" : "Fix Issues"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setView("api")}
                    className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
                  >
                    View API Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // API Response View
  const ApiResponseView = () => (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setView("list")}
          className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Response History</h1>
      </div>

      <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">API Call History</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            View all API requests and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] rounded-md border border-gray-200 dark:border-[#1F1F23]">
            {apiHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Server className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-600 dark:text-gray-400">No API calls recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {apiHistory.map((entry, index) => (
                  <div key={index} className="border rounded-md border-gray-200 dark:border-[#1F1F23]">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#1F1F23]/50">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                          {entry.method.toUpperCase()} {entry.url}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.timestamp}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(entry, null, 2))}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Sent Data</h4>
                        <SyntaxHighlighter
                          language="json"
                          style={tomorrow}
                          customStyle={{
                            padding: "12px",
                            fontSize: "13px",
                            backgroundColor: "transparent",
                            margin: 0,
                            borderRadius: "4px",
                            border: "1px solid",
                            borderColor: "rgba(229, 231, 235, 0.5)",
                          }}
                        >
                          {entry.sentData ? JSON.stringify(entry.sentData, null, 2) : "None"}
                        </SyntaxHighlighter>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Received Data</h4>
                        <SyntaxHighlighter
                          language="json"
                          style={tomorrow}
                          customStyle={{
                            padding: "12px",
                            fontSize: "13px",
                            backgroundColor: "transparent",
                            margin: 0,
                            borderRadius: "4px",
                            border: "1px solid",
                            borderColor: "rgba(229, 231, 235, 0.5)",
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
    <div className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setView("list")}
              className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
            >
              Problems
            </Button>
            <Button
              variant="outline"
              onClick={() => setView("api")}
              className="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
            >
              API History
            </Button>
          </div>
        </div>

        {view === "list" && <ProblemListView />}
        {view === "details" && <ProblemDetailsView />}
        {view === "testcases" && selectedProblem && <TestCasesView />}
        {view === "languages" && selectedProblem && <LanguagesView />}
        {view === "validation" && selectedProblem && <ValidationView />}
        {view === "api" && <ApiResponseView />}
      </div>
    </div>
  )
}


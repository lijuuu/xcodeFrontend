

import React, { useRef, useEffect, useState, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import ProblemListView from "@/pages-admin/ProblemsList"
import ApiResponseHistory from "@/pages-admin/ApiResponseHistory"
import TestCasesView from "@/pages-admin/TestCases"
import LanguagesView from "@/pages-admin/Languages"
import ValidationView from "@/pages-admin/Validate"
import ProblemDetailsView from "@/pages-admin/ProblemsDetails"

import {
  Server,
} from "lucide-react"

const BASE_URL = "http://localhost:7000/api/v1/problems"

export interface Problem {
  problem_id: string;
  title: string;
  difficulty: string;
  validated: boolean;
  tags: string[];
  description?: string;
  testcases?: {
    run: Array<{
      id?: string;
      input: any;
      expected: any;
    }>;
    submit: Array<{
      id?: string;
      input: any;
      expected: any;
    }>;
  };
  [key: string]: any;
}


interface ApiHistoryEntry {
  timestamp: string
  method: string
  url: string
  sentData: any
  receivedData: any
}

interface LanguageSupport {
  language: string
  placeholder: string
  code: string
  template: string
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



  return (
    <div className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12] min-h-screen">
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
              <Server className="h-4 w-4 mr-2" />
              API History
            </Button>
          </div>
        </div>

        {view === "list" && <ProblemListView
          setFilters={setFilters}
          filters={filters}
          setShowFilters={setShowFilters}
          showFilters={showFilters}
          loading={loading}
          filteredProblems={filteredProblems}
          setSelectedProblem={setSelectedProblem}
          getDifficultyColor={getDifficultyColor}
          fetchProblemDetails={fetchProblemDetails}
          setView={setView}
        />}
        {/* const ProblemDetailsView: React.FC<ProblemDetailsProps> = ({
          selectedProblem,
          setView,
          handleApiCall,
          loading,
          setSelectedProblem
        }) => {
  const {
            register,
            handleSubmit,
            reset,
            control,
            formState: {errors, isSubmitting},
  } = useForm<ProblemFormData>({
            resolver: zodResolver(problemSchema),
            defaultValues: selectedProblem
            ? {
              title: selectedProblem.title,
            description: selectedProblem.description,
            tags: selectedProblem.tags || [],
            difficulty: mapDifficulty(selectedProblem.difficulty),
        }
            : {title: "", description: "", tags: [], difficulty: "" },
  }); */}
        {view === "details" && <ProblemDetailsView selectedProblem={selectedProblem} setView={setView} handleApiCall={handleApiCall} loading={loading} setSelectedProblem={setSelectedProblem} />}
        {/* {view === "list" && <ProblemListView />} */}
        {view === "testcases" && selectedProblem && <TestCasesView selectedProblem={selectedProblem} setError={setError} handleApiCall={handleApiCall} setView={setView} loading={loading} />}
        {view === "languages" && selectedProblem && <LanguagesView selectedProblem={selectedProblem} handleApiCall={handleApiCall} setView={setView} />}
        {view === "validation" && selectedProblem && <ValidationView handleApiCall={handleApiCall} selectedProblem={selectedProblem} setView={setView} loading={loading} />}
        {view === "api" && <ApiResponseHistory apiHistory={apiHistory} setView={setView} />}

      </div>
    </div>
  )
}


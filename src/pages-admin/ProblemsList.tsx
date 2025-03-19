import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, Loader2, FileCode, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Define Problem interface (assuming this is what's imported from AdminDashboard)
interface Problem {
  problem_id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  validated: boolean;
}

// Props interface for MultiSelect
interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: { value: string; label: string }[];
  onChange: (selected: { value: string; label: string }[]) => void;
  placeholder: string;
  className?: string;
}


// Props interface for ProblemListView
interface ProblemListViewProps {
  setFilters: React.Dispatch<React.SetStateAction<{ search: string; difficulty: string; tags: string }>>;
  filters: { search: string; difficulty: string; tags: string };
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  showFilters: boolean;
  loading: boolean;
  filteredProblems: Problem[];
  setSelectedProblem: (problem: Problem | null) => void;  // Added missing prop
  getDifficultyColor: (difficulty: string) => string;
  fetchProblemDetails: (problemId: string) => void;
  setView: React.Dispatch<React.SetStateAction<"list" | "details" | "testcases" | "languages" | "validation" | "api">>;
}


const mapDifficulty = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    "1": "Easy",
    "2": "Medium",
    "3": "Hard",
    "E": "Easy",
    "M": "Medium",
    "H": "Hard"
  };
  return difficultyMap[difficulty] || difficulty;
};

const getValidationColorCSS = (validated: boolean) =>
  validated
    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
    : "bg-red-500/10 text-red-500 hover:bg-red-500/20";


const ProblemListView: React.FC<ProblemListViewProps> = ({
  setFilters,
  filters,
  setShowFilters,
  showFilters,
  loading,
  filteredProblems,
  setSelectedProblem,
  getDifficultyColor,
  fetchProblemDetails,
  setView,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

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

  const updateFilters = debounce((search: string, tags: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
      tags,
    }));
  }, 300);

  const handleSearchChange = () => {
    const searchValue = searchInputRef.current?.value || "";
    updateFilters(searchValue, tagInputRef.current?.value || "");
  };

  const handleTagChange = () => {
    const tagValue = tagInputRef.current?.value || "";
    updateFilters(searchInputRef.current?.value || "", tagValue);
  };

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
              onClick={() => { setSelectedProblem(null); setView("details") }}
              className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Problem
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="difficulty-filter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                >
                  Difficulty
                </label>
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
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="tag-filter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                >
                  Tag
                </label>
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
                  {problem.tags.slice(0, 3).map((tag) => (
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

export default ProblemListView;
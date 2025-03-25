import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, Loader2, FileCode } from "lucide-react";
import { useNavigate } from "react-router";
import NavHeader from "@/components/sub/NavHeader";

// Define the Problem interface based on ProblemMetadata
interface Problem {
  problem_id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  testcase_run: { run: { input: string; expected: string }[] };
  supported_languages: string[];
  validated: boolean;
  placeholder_maps: { [key: string]: string };
}

interface ProblemsHomeProps {}

const BASE_URL = "http://localhost:7000/api/v1/problems";

const mapDifficulty = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    "1": "Easy",
    "2": "Medium",
    "3": "Hard",
    "E": "Easy",
    "M": "Medium",
    "H": "Hard",
  };
  return difficultyMap[difficulty] || difficulty;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "E":
      return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
    case "M":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "H":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20";
  }
};

const ProblemListingHome: React.FC<ProblemsHomeProps> = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [filters, setFilters] = useState({ search: "", difficulty: "all", tags: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/metadata/list`, { params: { page: 1, page_size: 100 } });
      console.log('Raw API response:', res.data); // Log for debugging
      const problemList = res.data.payload?.problems || [];
      if (!Array.isArray(problemList)) throw new Error("Expected an array of problems");
      const mappedProblems: Problem[] = problemList.map((item: any) => ({
        problem_id: item.problem_id || '',
        title: item.title || 'Untitled',
        description: item.description || '',
        tags: item.tags || [],
        difficulty: item.difficulty || '',
        testcase_run: item.testcase_run || { run: [] },
        supported_languages: item.supported_languages || [],
        validated: item.validated || false,
        placeholder_maps: item.placeholder_maps || {},
      }));
      setProblems(mappedProblems);
      setFilteredProblems(mappedProblems);
    } catch (err) {
      setError((err as Error).message || "Failed to load problems");
      setProblems([]);
      setFilteredProblems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const debounce = useCallback(
    (func: (...args: string[]) => void, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: string[]) => {
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

  const navigate = useNavigate();

  const navigateProblemsExecutor = (problem_id: string) => {
    navigate(`/problems?problem_id=${problem_id}`);
  };

  return (
    <>
      <NavHeader name={"Problems"} logout={true} />
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-[#121212] min-h-screen">
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

          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredProblems.length} {filteredProblems.length === 1 ? "problem" : "problems"} found
              </p>
            </div>
          )}

          {filteredProblems.length === 0 && !loading && (
            <Card className="bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23]">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <FileCode className="h-6 w-6 text-zinc-900 dark:text-zinc-100 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No problems found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters.</p>
              </CardContent>
            </Card>
          )}

          {!loading && filteredProblems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProblems.map((problem) => (
                <Card
                  key={problem.problem_id}
                  className="bg-white dark:bg-[#151515] hover:dark:bg-[#181717] border-gray-200 dark:border-[#373738] hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-200 cursor-pointer"
                  onClick={() => navigateProblemsExecutor(problem.problem_id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={`${getDifficultyColor(problem.difficulty)} font-normal mb-2`}>
                        {mapDifficulty(problem.difficulty)}
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
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProblemListingHome;
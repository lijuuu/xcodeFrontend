import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import { toast } from "sonner";

const BASE_URL = 'http://localhost:7000/api/v1/problems';

const predefinedTags = [
  'Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'Linked List',
  'Stack', 'Queue', 'Heap', 'Backtracking', 'Greedy', 'Binary Search',
  'Sorting', 'Recursion', 'Bit Manipulation'
];

// Schemas (unchanged)
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
});

const testCaseSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  expected: z.string().min(1, 'Expected output is required'),
});

const bulkTestCaseSchema = z.object({
  run: z.array(z.object({ input: z.string(), expected: z.string() })).optional(),
  submit: z.array(z.object({ input: z.string(), expected: z.string() })).optional(),
}).refine(data => (data.run && data.run.length > 0) || (data.submit && data.submit.length > 0), {
  message: 'At least one run or submit test case is required',
});

const languageSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  placeholder: z.string().min(1, 'Placeholder is required'),
  code: z.string().min(1, 'Validation code is required'),
});

type ProblemFormData = z.infer<typeof problemSchema>;
type TestCaseFormData = z.infer<typeof testCaseSchema>;
type BulkTestCaseFormData = z.infer<typeof bulkTestCaseSchema>;
type LanguageFormData = z.infer<typeof languageSchema>;

interface LanguageSupport {
  language: string;
  placeholder: string;
  code: string;
}

const AdminDashboard: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const [languages, setLanguages] = useState<LanguageSupport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', difficulty: '', tags: '' });
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [view, setView] = useState<'list' | 'details' | 'testcases' | 'languages' | 'validation' | 'api'>('list');

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/list`, { params: { page: 1, page_size: 100 } });
      const problemList = res.data.payload?.problems || [];
      if (!Array.isArray(problemList)) throw new Error('Expected an array of problems');
      setProblems(problemList);
      setFilteredProblems(problemList);
    } catch (error: any) {
      setError(error.message || 'Failed to load problems');
      setProblems([]);
      setFilteredProblems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProblemDetails = useCallback(async (problemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [problemRes, languagesRes] = await Promise.all([
        axios.get(`${BASE_URL}/`, { params: { problem_id: problemId } }),
        axios.get(`${BASE_URL}/languages`, { params: { problem_id: problemId } }),
      ]);
      const problemData = problemRes.data.payload || problemRes.data;
      setSelectedProblem(problemData);
      const validateCode = problemData.validate_code || {};
      const languageSupports = Object.entries(validateCode).map(([language, code]: [string, any]) => ({
        language,
        placeholder: code.placeholder || '',
        code: code.code || '',
      }));
      setLanguages(languageSupports);
    } catch (error: any) {
      setError(error.message || 'Failed to load problem details');
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'list') fetchProblems();
  }, [fetchProblems, view]);

  const handleApiCall = useCallback(async (method: string, url: string, data?: any, params?: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const config = { method, url: `${BASE_URL}${url}`, data, params };
      const res = await axios(config);
      setApiResponse(res.data);
      await fetchProblems();
      if (selectedProblem?.problem_id) await fetchProblemDetails(selectedProblem.problem_id);
      setSuccess('Action completed successfully!');

      // Add toast notification with API response
      toast(
        <div className='p-5'>
          <div className="font-medium mb-2 w-[80%]">API Response</div>
          <SyntaxHighlighter
            language="json"
            style={tomorrow}
            customStyle={{
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              backgroundColor: '#1F2937',
              maxHeight: '300px',
              minWidth: '400px',
              width: '100%',
              overflow: 'auto'
            }}
          >
            {JSON.stringify(res.data, null, 2)}
          </SyntaxHighlighter>
        </div>,
        {
          duration: 8000,
          className: "bg-gray-900 border border-white/10 text-white max-w-[600px] w-full",
        }
      );

      setTimeout(() => setSuccess(null), 3000);
      return res.data;
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Action failed');
      setApiResponse(error.response?.data || error.message);

      // Add toast notification for error
      toast.error(
        <div>
          <div className="font-medium mb-2">Error</div>
          <SyntaxHighlighter
            language="json"
            style={tomorrow}
            customStyle={{
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              backgroundColor: '#1F2937',
              maxHeight: '300px',
              minWidth: '400px',
              width: '100%',
              overflow: 'auto'
            }}
          >
            {JSON.stringify(error.response?.data || error.message, null, 2)}
          </SyntaxHighlighter>
        </div>,
        {
          duration: 8000,
          className: "bg-gray-900 border border-white/10 text-white max-w-[600px] w-full",
        }
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProblems, fetchProblemDetails, selectedProblem]);

  const mapDifficulty = (short: string) => {
    switch (short) {
      case 'E': return 'Easy';
      case 'M': return 'Medium';
      case 'H': return 'Hard';
      default: return short;
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...problems];
    if (filters.search) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.difficulty) {
      filtered = filtered.filter(p => mapDifficulty(p.difficulty) === filters.difficulty);
    }
    if (filters.tags) {
      const tag = filters.tags.toLowerCase();
      filtered = filtered.filter(p => p.tags.some((t: string) => t.toLowerCase().includes(tag)));
    }
    setFilteredProblems(filtered);
  }, [problems, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#1F2937',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      '&:hover': { borderColor: '#60A5FA' },
      color: 'white',
      boxShadow: 'none',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#1F2937',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#60A5FA' : state.isFocused ? '#374151' : '#1F2937',
      color: state.isSelected ? '#111827' : 'white',
      '&:active': { backgroundColor: '#3B82F6' },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#60A5FA',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#111827',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#111827',
      '&:hover': { backgroundColor: '#3B82F6', color: '#111827' },
    }),
    singleValue: (provided: any) => ({ ...provided, color: 'white' }),
    placeholder: (provided: any) => ({ ...provided, color: '#9CA3AF' }),
  };

  // Metadata Header Component
  const MetadataHeader = ({ problem, title }: { problem: any | null; title: string }) => (
    <div className="bg-gray-900 p-6 border-b border-white/10 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{problem?.title || title}</h2>
          {problem && (
            <div className="text-sm text-gray-300 mt-1">
              <span className="font-medium text-blue-400">{mapDifficulty(problem.difficulty)}</span> •{' '}
              <span>{problem.tags.join(', ')}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setView('list')}
          className="bg-gray-800 text-white py-2 px-5 rounded-lg hover:bg-gray-700 transition border border-white/10"
        >
          Back to Dashboard
        </button>
      </div>
      <div className="mt-3 flex items-center gap-4">
        {loading && <p className="text-white text-sm animate-pulse">Loading...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-blue-400 text-sm">{success}</p>}
      </div>
    </div>
  );

  // Problem List View
  const ProblemListView = () => (
    <div className="min-h-screen bg-gray-950 text-white border-l border-white/10">
      <header className="sticky top-0 z-10 bg-gray-900 p-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Problem Dashboard</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition placeholder-gray-500 text-sm"
            />
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition text-sm"
            >
              <option value="" className="bg-gray-800">All Difficulties</option>
              <option value="Easy" className="bg-gray-800">Easy</option>
              <option value="Medium" className="bg-gray-800">Medium</option>
              <option value="Hard" className="bg-gray-800">Hard</option>
            </select>
            <input
              type="text"
              placeholder="Filter by tag..."
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
              className="bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition placeholder-gray-500 text-sm"
            />
            <button
              onClick={() => { setSelectedProblem(null); setView('details'); }}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition border border-white/10 text-sm font-medium"
            >
              + New Problem
            </button>
            {apiResponse && (
              <button
                onClick={() => setView('api')}
                className="text-blue-400 hover:text-blue-300 transition text-sm font-medium"
              >
                API Response
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4">
          {loading && <p className="text-white text-sm animate-pulse">Loading...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-blue-400 text-sm">{success}</p>}
        </div>
      </header>
      <main className="p-6">
        {filteredProblems.length === 0 && !loading ? (
          <p className="text-gray-400 text-center text-lg">No problems found. Create a new one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProblems.map((problem) => (
              <div
                key={problem.problem_id}
                className="bg-gray-900 p-5 rounded-md border border-white/10 hover:border-white/20 transition"
              >
                <h3 className="text-lg font-semibold text-white truncate">{problem.title}</h3>
                <p className="text-sm text-gray-300 mt-1">{mapDifficulty(problem.difficulty)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {problem.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-800 text-blue-400 px-2 py-1 rounded-full border border-white/10">{tag}</span>
                  ))}
                  {problem.tags.length > 3 && <span className="text-xs text-gray-400">+{problem.tags.length - 3}</span>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => { fetchProblemDetails(problem.problem_id); setView('details'); }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition border border-white/10 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { fetchProblemDetails(problem.problem_id); setView('testcases'); }}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition border border-white/10 text-sm"
                  >
                    Test Cases
                  </button>
                  <button
                    onClick={() => { fetchProblemDetails(problem.problem_id); setView('languages'); }}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition border border-white/10 text-sm"
                  >
                    Languages
                  </button>
                  <button
                    onClick={() => { fetchProblemDetails(problem.problem_id); setView('validation'); }}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition border border-white/10 text-sm"
                  >
                    Validate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  // Problem Details View
  const ProblemDetailsView = () => {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProblemFormData>({
      resolver: zodResolver(problemSchema),
      defaultValues: selectedProblem ? {
        title: selectedProblem.title,
        description: selectedProblem.description,
        tags: selectedProblem.tags || [],
        difficulty: mapDifficulty(selectedProblem.difficulty),
      } : {},
    });

    useEffect(() => {
      if (selectedProblem) {
        reset({
          title: selectedProblem.title,
          description: selectedProblem.description,
          tags: selectedProblem.tags || [],
          difficulty: mapDifficulty(selectedProblem.difficulty),
        });
      } else {
        reset({});
      }
    }, [selectedProblem, reset]);

    const onSubmit = async (data: ProblemFormData) => {
      const payload = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        difficulty: data.difficulty.charAt(0),
      };
      if (selectedProblem) {
        await handleApiCall('put', '/', { problem_id: selectedProblem.problem_id, ...payload });
      } else {
        await handleApiCall('post', '/', payload);
      }
      setView('list');
    };

    const onDelete = async () => {
      if (selectedProblem && window.confirm('Are you sure you want to delete this problem?')) {
        await handleApiCall('delete', '/', null, { problem_id: selectedProblem.problem_id });
        setSelectedProblem(null);
        setView('list');
      }
    };

    return (
      <div className="min-h-screen bg-gray-950 text-white border-l border-white/10">
        <MetadataHeader problem={selectedProblem} title={selectedProblem ? 'Edit Problem' : 'Create Problem'} />
        <div className="p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300">Title</label>
              <input
                {...register('title')}
                className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition placeholder-gray-500 text-sm"
                placeholder="Enter problem title"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                {...register('description')}
                className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none h-32 transition placeholder-gray-500 resize-none text-sm"
                placeholder="Describe the problem..."
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Tags</label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={predefinedTags.map(tag => ({ value: tag, label: tag }))}
                    value={field.value ? field.value.map(tag => ({ value: tag, label: tag })) : []}
                    onChange={(selected) => field.onChange(selected ? selected.map(s => s.value) : [])}
                    styles={customStyles}
                    className="mt-1"
                    placeholder="Select tags..."
                  />
                )}
              />
              {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Difficulty</label>
              <select
                {...register('difficulty')}
                className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition text-sm"
              >
                <option value="" className="bg-gray-800">Select Difficulty</option>
                <option value="Easy" className="bg-gray-800">Easy</option>
                <option value="Medium" className="bg-gray-800">Medium</option>
                <option value="Hard" className="bg-gray-800">Hard</option>
              </select>
              {errors.difficulty && <p className="text-red-400 text-xs mt-1">{errors.difficulty.message}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
              >
                {loading ? 'Saving...' : selectedProblem ? 'Update' : 'Create'}
              </button>
              {selectedProblem && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={loading}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Test Cases View
  const TestCasesView = () => {
    const { register: registerRun, handleSubmit: handleSubmitRun, reset: resetRun, formState: { errors: errorsRun } } = useForm<TestCaseFormData>({
      resolver: zodResolver(testCaseSchema),
      mode: 'onChange',
    });
    const { register: registerSubmit, handleSubmit: handleSubmitSubmit, reset: resetSubmit, formState: { errors: errorsSubmit } } = useForm<TestCaseFormData>({
      resolver: zodResolver(testCaseSchema),
      mode: 'onChange',
    });
    const { register: registerBulk, handleSubmit: handleSubmitBulk, setValue: setBulkValue, formState: { errors: errorsBulk } } = useForm<{ bulkJson: string }>({
      resolver: zodResolver(z.object({
        bulkJson: z.string().min(1, 'JSON is required').refine(
          (val) => {
            try {
              const parsed = JSON.parse(val);
              return bulkTestCaseSchema.safeParse(parsed).success;
            } catch {
              return false;
            }
          },
          'Invalid JSON format or structure'
        ),
      })),
      mode: 'onChange',
    });
    const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());

    const onAddRun = async (data: TestCaseFormData) => {
      if (!selectedProblem) return setError('Please select or create a problem first.');
      await handleApiCall('post', '/testcases', {
        problem_id: selectedProblem.problem_id,
        testcases: { run: [{ input: data.input, expected: data.expected }], submit: [] },
      });
      resetRun();
    };

    const onAddSubmit = async (data: TestCaseFormData) => {
      if (!selectedProblem) return setError('Please select or create a problem first.');
      await handleApiCall('post', '/testcases', {
        problem_id: selectedProblem.problem_id,
        testcases: { run: [], submit: [{ input: data.input, expected: data.expected }] },
      });
      resetSubmit();
    };

    const onRemove = async (testcaseId: string, isRun: boolean) => {
      if (!selectedProblem || !window.confirm('Are you sure you want to delete this test case?')) return;
      await handleApiCall('delete', '/testcases/single', {
        problem_id: selectedProblem.problem_id,
        testcase_id: testcaseId,
        is_run_testcase: isRun,
      });
    };

    const onBulkDelete = async () => {
      if (!selectedProblem || selectedTestCases.size === 0 || !window.confirm('Are you sure you want to delete selected test cases?')) return;
      const promises = Array.from(selectedTestCases).map(testcaseId => {
        const isRun = selectedProblem.testcases.run.some((tc: any) => (tc.id || tc.testcase_id) === testcaseId);
        return handleApiCall('delete', '/testcases/single', {
          problem_id: selectedProblem.problem_id,
          testcase_id: testcaseId,
          is_run_testcase: isRun,
        });
      });
      await Promise.all(promises);
      setSelectedTestCases(new Set());
    };

    const onBulkUpload = async (data: { bulkJson: string }) => {
      if (!selectedProblem) return setError('Please select or create a problem first.');
      try {
        const parsedJson = JSON.parse(data.bulkJson);
        await handleApiCall('post', '/testcases', {
          problem_id: selectedProblem.problem_id,
          testcases: parsedJson,
        });
        setBulkValue('bulkJson', '');
        toast.success("Test cases uploaded successfully!");
        setSuccess("Test cases uploaded successfully!");
      } catch (e: any) {
        toast.error(e.message || 'Failed to upload bulk test cases.');
        setError(e.message || 'Failed to upload bulk test cases.');
      }
    };

    const toggleTestCaseSelection = (testcaseId: string) => {
      const newSelected = new Set(selectedTestCases);
      if (newSelected.has(testcaseId)) newSelected.delete(testcaseId);
      else newSelected.add(testcaseId);
      setSelectedTestCases(newSelected);
    };

    const exampleJson = `{"run": [{"input": "1 2", "expected": "3"}], "submit": [{"input": "5 6", "expected": "11"}]}`;

    const copyExampleJson = () => {
      navigator.clipboard.writeText(exampleJson);
      toast.success("Example JSON copied to clipboard!");
      setSuccess("Example JSON copied to clipboard!");
      setTimeout(() => setSuccess(null), 2000);
    };

    return (
      <div className="min-h-screen bg-gray-950 text-white border-l border-white/10">
        <MetadataHeader problem={selectedProblem} title="Manage Test Cases" />
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white tracking-tight">Existing Test Cases</h3>
              {selectedTestCases.size > 0 && (
                <button
                  onClick={onBulkDelete}
                  disabled={loading}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
                >
                  Delete Selected ({selectedTestCases.size})
                </button>
              )}
            </div>
            <div className="bg-gray-900 rounded-md p-4 max-h-96 overflow-y-auto border border-white/10">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-300">
                    <th className="p-2 text-left w-10"></th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Input</th>
                    <th className="p-2 text-left">Expected</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProblem?.testcases?.run?.map((tc: any, i: number) => (
                    <tr key={i} className="border-b border-white/10 hover:bg-gray-800 transition">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedTestCases.has(tc.id || tc.testcase_id || `run_${i}`)}
                          onChange={() => toggleTestCaseSelection(tc.id || tc.testcase_id || `run_${i}`)}
                          className="accent-blue-500"
                        />
                      </td>
                      <td className="p-2">Run</td>
                      <td className="p-2 truncate max-w-xs">{tc.input}</td>
                      <td className="p-2 truncate max-w-xs">{tc.expected}</td>
                      <td className="p-2">
                        <button
                          onClick={() => onRemove(tc.id || tc.testcase_id || `run_${i}`, true)}
                          disabled={loading}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50 transition text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedProblem?.testcases?.submit?.map((tc: any, i: number) => (
                    <tr key={i} className="border-b border-white/10 hover:bg-gray-800 transition">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedTestCases.has(tc.id || tc.testcase_id || `submit_${i}`)}
                          onChange={() => toggleTestCaseSelection(tc.id || tc.testcase_id || `submit_${i}`)}
                          className="accent-blue-500"
                        />
                      </td>
                      <td className="p-2">Submit</td>
                      <td className="p-2 truncate max-w-xs">{tc.input}</td>
                      <td className="p-2 truncate max-w-xs">{tc.expected}</td>
                      <td className="p-2">
                        <button
                          onClick={() => onRemove(tc.id || tc.testcase_id || `submit_${i}`, false)}
                          disabled={loading}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50 transition text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!selectedProblem?.testcases?.run?.length && !selectedProblem?.testcases?.submit?.length) && (
                <p className="text-gray-400 text-center py-4">No test cases added yet.</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Add Run Test Case</h3>
              <form onSubmit={handleSubmitRun(onAddRun)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Input</label>
                  <input
                    {...registerRun('input')}
                    className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition placeholder-gray-500 text-sm"
                    placeholder="Enter input..."
                  />
                  {errorsRun.input && <p className="text-red-400 text-xs mt-1">{errorsRun.input.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Expected</label>
                  <input
                    {...registerRun('expected')}
                    className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition placeholder-gray-500 text-sm"
                    placeholder="Enter expected output..."
                  />
                  {errorsRun.expected && <p className="text-red-400 text-xs mt-1">{errorsRun.expected.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
                >
                  Add Run
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Add Submit Test Case</h3>
              <form onSubmit={handleSubmitSubmit(onAddSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Input</label>
                  <input
                    {...registerSubmit('input')}
                    className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition placeholder-gray-500 text-sm"
                    placeholder="Enter input..."
                  />
                  {errorsSubmit.input && <p className="text-red-400 text-xs mt-1">{errorsSubmit.input.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Expected</label>
                  <input
                    {...registerSubmit('expected')}
                    className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none transition placeholder-gray-500 text-sm"
                    placeholder="Enter expected output..."
                  />
                  {errorsSubmit.expected && <p className="text-red-400 text-xs mt-1">{errorsSubmit.expected.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
                >
                  Add Submit
                </button>
              </form>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Bulk Upload Test Cases <span className="text-gray-400 text-sm">(JSON)</span></h3>
            <form onSubmit={handleSubmitBulk(onBulkUpload)} className="space-y-4">
              <div className="relative">
                <textarea
                  {...registerBulk('bulkJson')}
                  onChange={(e) => setBulkValue('bulkJson', e.target.value)}
                  placeholder={exampleJson}
                  className="w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none h-28 transition placeholder-gray-500 resize-none text-sm"
                />
                {errorsBulk.bulkJson && <p className="text-red-400 text-xs mt-1">{errorsBulk.bulkJson.message}</p>}
                <button
                  type="button"
                  onClick={copyExampleJson}
                  className="absolute top-2 right-2 text-gray-400 hover:text-blue-400 p-1 rounded hover:bg-gray-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
                >
                  Upload Bulk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkValue('bulkJson', exampleJson);
                    setSuccess("Example JSON loaded!");
                    setTimeout(() => setSuccess(null), 2000);
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded hover:bg-gray-800 transition border border-white/10"
                >
                  Load Example
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Languages View
  const LanguagesView = () => {
    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<LanguageFormData>({
      resolver: zodResolver(languageSchema),
      mode: 'onChange',
    });
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageSupport | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formatLanguageName = (lang: string) => {
      switch (lang.toLowerCase()) {
        case 'python': return 'Python';
        case 'javascript': return 'JavaScript';
        case 'cpp': return 'C++';
        case 'go': return 'Go';
        default: return lang;
      }
    };

    const defaultPlaceholder = {
      python: { placeholder: "# Write your Python solution here\n", code: "def validate_solution():\n    # Add validation logic here\n    pass\n" },
      javascript: { placeholder: "// Write your JavaScript solution here\n", code: "function validateSolution() {\n    // Add validation logic here\n}\n" },
      cpp: { placeholder: "// Write your C++ solution here\n#include <iostream>\n", code: "#include <iostream>\nbool validateSolution() {\n    // Add validation logic here\n    return true;\n}\n" },
      go: { placeholder: "// Write your Go solution here\npackage main\n", code: "package main\nfunc validateSolution() bool {\n    // Add validation logic here\n    return true\n}\n" }
    };

    const handleLanguageSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedLang = event.target.value;
      if (selectedLang) {
        const defaults = defaultPlaceholder[selectedLang as keyof typeof defaultPlaceholder];
        setValue('language', selectedLang, { shouldValidate: true });
        setValue('placeholder', defaults.placeholder, { shouldValidate: true });
        setValue('code', defaults.code, { shouldValidate: true });
      }
    };

    const addLanguage = async (data: LanguageFormData) => {
      if (!selectedProblem) return setError('Please select or create a problem first.');
      setIsLoading(true);
      const langDefaults = defaultPlaceholder[data.language as keyof typeof defaultPlaceholder] || {
        placeholder: "// Write your solution here\n",
        code: "// Add validation logic here\n"
      };
      try {
        await handleApiCall('post', '/language', {
          problem_id: selectedProblem.problem_id,
          language: data.language,
          validation_code: { placeholder: data.placeholder || langDefaults.placeholder, code: data.code || langDefaults.code },
        });
        setSuccess('Language added successfully');
        setLanguages([...languages, { language: data.language, placeholder: data.placeholder || langDefaults.placeholder, code: data.code || langDefaults.code }]);
        reset();
      } catch (err) {
        setError('Failed to add language support');
      } finally {
        setIsLoading(false);
      }
    };

    const updateLanguage = async (data: LanguageFormData) => {
      if (!selectedProblem) return setError('Please select a problem first.');
      setIsLoading(true);
      try {
        await handleApiCall('put', '/language', {
          problem_id: selectedProblem.problem_id,
          language: data.language,
          validation_code: { placeholder: data.placeholder, code: data.code },
        });
        setSuccess('Language updated successfully');
        setLanguages(languages.map(lang => lang.language === data.language ? { ...data } : lang));
        setSelectedLanguage(null);
        reset();
      } catch (err) {
        setError('Failed to update language support');
      } finally {
        setIsLoading(false);
      }
    };

    const removeLanguage = async (language: string) => {
      if (!selectedProblem || !window.confirm(`Are you sure you want to remove ${formatLanguageName(language)} support?`)) return;
      setIsLoading(true);
      try {
        await handleApiCall('delete', '/language', { problem_id: selectedProblem.problem_id, language });
        setSuccess('Language removed successfully');
        setLanguages(languages.filter(lang => lang.language !== language));
        if (selectedLanguage?.language === language) {
          reset();
          setSelectedLanguage(null);
        }
      } catch (err) {
        setError('Failed to remove language support');
      } finally {
        setIsLoading(false);
      }
    };

    const handleEditLanguage = (lang: LanguageSupport) => {
      setSelectedLanguage(lang);
      setValue('language', lang.language, { shouldValidate: true });
      setValue('placeholder', lang.placeholder, { shouldValidate: true });
      setValue('code', lang.code, { shouldValidate: true });
    };

    return (
      <div className="min-h-screen bg-gray-950 text-white border-l border-white/10">
        <MetadataHeader problem={selectedProblem} title="Manage Languages" />
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Supported Languages ({languages.length})</h3>
            {languages.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {languages.map((lang) => (
                  <div key={lang.language} className="bg-gray-900 p-4 rounded-md border border-white/10 hover:border-white/20 transition">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-medium text-lg">{formatLanguageName(lang.language)}</span>
                      <div className="flex gap-3">
                        <button onClick={() => handleEditLanguage(lang)} disabled={isLoading} className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50 transition text-sm">Edit</button>
                        <button onClick={() => removeLanguage(lang.language)} disabled={isLoading} className="text-red-400 hover:text-red-300 disabled:opacity-50 transition text-sm">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-lg">No languages configured yet</p>
            )}
          </div>
          <form onSubmit={handleSubmit(selectedLanguage ? updateLanguage : addLanguage)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300">Language</label>
              <select
                {...register('language')}
                onChange={(e) => { register('language').onChange(e); if (!selectedLanguage) handleLanguageSelect(e); }}
                disabled={!!selectedLanguage || isSubmitting}
                className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none disabled:opacity-50 transition text-sm"
              >
                <option value="" className="bg-gray-800">Select a language</option>
                {['python', 'javascript', 'cpp', 'go'].filter(lang => !languages.some(l => l.language === lang)).map(lang => (
                  <option key={lang} value={lang} className="bg-gray-800">{formatLanguageName(lang)}</option>
                ))}
              </select>
              {errors.language && <p className="text-red-400 text-xs mt-1">{errors.language.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Placeholder Code</label>
              <textarea
                {...register('placeholder')}
                className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none h-24 resize-none transition placeholder-gray-500 text-sm"
                placeholder="Enter default code shown to users..."
              />
              {errors.placeholder && <p className="text-red-400 text-xs mt-1">{errors.placeholder.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Validation Code</label>
              <textarea
                {...register('code')}
                className="mt-1 w-full bg-gray-800 text-white p-2 rounded-md border border-white/10 focus:border-blue-400 focus:outline-none h-40 resize-none transition placeholder-gray-500 text-sm"
                placeholder="Enter code to validate submissions..."
              />
              {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
              >
                {isSubmitting ? 'Saving...' : selectedLanguage ? 'Apply Changes' : 'Add Language'}
              </button>
              <button
                type="button"
                onClick={() => { reset(); setSelectedLanguage(null); }}
                disabled={isSubmitting || isLoading}
                className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
              >
                {selectedLanguage ? 'Cancel Edit' : 'Clear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Validation View
  const ValidationView = () => {
    const [validationResult, setValidationResult] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);

    const onValidate = async () => {
      if (!selectedProblem) return setError('Please select a problem first.');
      setIsValidating(true);
      try {
        const res = await handleApiCall('get', '/validate', null, { problem_id: selectedProblem.problem_id });
        setValidationResult(res);
      } catch (error) {
        setError('Validation failed');
      } finally {
        setIsValidating(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-950 text-white border-l border-white/10">
        <MetadataHeader problem={selectedProblem} title="Validate Problem" />
        <div className="p-6 max-w-2xl mx-auto space-y-5">
          <button
            onClick={onValidate}
            disabled={isValidating || loading}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-600 transition border border-white/10 text-sm font-medium"
          >
            {isValidating ? 'Validating...' : 'Run Validation'}
          </button>
          {validationResult && (
            <div className="bg-gray-900 p-4 rounded-md border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Validation Result</h3>
              <div className="text-white space-y-2 text-sm">
                <p><strong>Success:</strong> {validationResult.success ? 'Yes' : 'No'}</p>
                {validationResult.message && <p><strong>Message:</strong> {validationResult.message}</p>}
                {validationResult.error_type && <p><strong>Error Type:</strong> {validationResult.error_type}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // API Response View
  const ApiResponseView = () => (
    <div className="min-h-screen bg-gray-950 text-white border-l border-white/10">
      <MetadataHeader problem={null} title="API Response" />
      <div className="p-6 max-w-3xl mx-auto">
        <SyntaxHighlighter language="json" style={tomorrow} customStyle={{ padding: '16px', borderRadius: '8px', fontSize: '14px', backgroundColor: '#1F2937', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {JSON.stringify(apiResponse, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-gray-950 pointer-events-none border-l border-white/10 z-[-1]"></div>
      {view === 'list' && <ProblemListView />}
      {view === 'details' && <ProblemDetailsView />}
      {view === 'testcases' && selectedProblem && <TestCasesView />}
      {view === 'languages' && selectedProblem && <LanguagesView />}
      {view === 'validation' && selectedProblem && <ValidationView />}
      {view === 'api' && apiResponse && <ApiResponseView />}
    </div>
  );
};

export default AdminDashboard;
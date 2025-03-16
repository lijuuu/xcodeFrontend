import React, { useCallback } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// --- Form Schemas ---
const problemSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  tags: z.string().min(1, 'Tags are required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
});

const testCaseSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  runInput: z.string().min(1, 'Run Input is required'),
  runExpected: z.string().min(1, 'Run Expected is required'),
  submitInput: z.string().min(1, 'Submit Input is required'),
  submitExpected: z.string().min(1, 'Submit Expected is required'),
});

const languageSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  language: z.string().min(1, 'Language is required'),
  placeholder: z.string().min(1, 'Placeholder is required'),
  code: z.string().min(1, 'Code is required'),
});

const listParamsSchema = z.object({
  page: z.string().min(1, 'Page is required'),
  pageSize: z.string().min(1, 'Page Size is required'),
  tags: z.string().optional(),
  difficulty: z.string().optional(),
  searchQuery: z.string().optional(),
});

type ProblemFormData = z.infer<typeof problemSchema>;
type TestCaseFormData = z.infer<typeof testCaseSchema>;
type LanguageFormData = z.infer<typeof languageSchema>;
type ListParamsFormData = z.infer<typeof listParamsSchema>;

const BASE_URL = 'http://localhost:7000/api/v1/problems';

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [response, setResponse] = React.useState<any>(null);

  // Memoized handleTabChange to prevent unnecessary re-renders
  const handleTabChange = useCallback((newValue: number) => {
    setTabValue(newValue);
    setResponse(null);
  }, []);

  const handleApiCall = async (method: string, url: string, data?: any, params?: any) => {
    try {
      const config = { method, url: `${BASE_URL}${url}`, data, params };
      const res = await axios(config);
      setResponse(res.data);
    } catch (error: any) {
      setResponse(error.response?.data || { success: false, error: { message: 'API call failed' } });
    }
  };

  const renderResponse = () => {
    if (!response) return null;
    return (
      <div className="mt-8 bg-gray-bg border border-gray-border rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-2 text-teal-primary">Response:</h3>
        <pre className="text-sm overflow-auto max-h-40 bg-[#2C2C2C] p-2 rounded">{JSON.stringify(response, null, 2)}</pre>
      </div>
    );
  };

  const ProblemCRUD = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ProblemFormData>({
      resolver: zodResolver(problemSchema),
      defaultValues: {
        problemId: '',
        title: '',
        description: '',
        tags: '',
        difficulty: '',
      },
    });

    const onSubmit = (data: ProblemFormData) => {
      handleApiCall('post', '/', {
        title: data.title,
        description: data.description,
        tags: data.tags.split(',').map(tag => tag.trim()),
        difficulty: data.difficulty,
      });
    };

    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold text-white">Problem CRUD</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-white block mb-2">Problem ID</label>
            <input
              type="text"
              placeholder="Problem ID"
              {...register('problemId')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.problemId && <p className="text-teal-primary text-sm mt-1">{errors.problemId.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Title</label>
            <input
              type="text"
              placeholder="Title"
              {...register('title')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.title && <p className="text-teal-primary text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="text-sm text-white block mb-2">Description</label>
            <input
              type="text"
              placeholder="Description"
              {...register('description')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.description && <p className="text-teal-primary text-sm mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              {...register('tags')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.tags && <p className="text-teal-primary text-sm mt-1">{errors.tags.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Difficulty</label>
            <input
              type="text"
              placeholder="Difficulty"
              {...register('difficulty')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.difficulty && <p className="text-teal-primary text-sm mt-1">{errors.difficulty.message}</p>}
          </div>
          <div className="col-span-2 flex flex-wrap gap-4">
            <button
              type="submit"
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Create Problem
            </button>
            <button
              type="button"
              onClick={() => {
                const data = { problemId: '', title: '', description: '', tags: '', difficulty: '' }; // Replace with form data if needed
                handleApiCall('put', '/', {
                  problem_id: data.problemId,
                  title: data.title,
                  description: data.description,
                  tags: data.tags.split(',').map(tag => tag.trim()),
                  difficulty: data.difficulty,
                });
              }}
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Update Problem
            </button>
            <button
              type="button"
              onClick={() => handleApiCall('delete', '/', null, { problem_id: '' })}
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Delete Problem
            </button>
            <button
              type="button"
              onClick={() => handleApiCall('get', '/', null, { problem_id: '' })}
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Get Problem
            </button>
          </div>
        </form>
      </div>
    );
  };

  const TestCases = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<TestCaseFormData>({
      resolver: zodResolver(testCaseSchema),
      defaultValues: {
        problemId: '',
        runInput: '',
        runExpected: '',
        submitInput: '',
        submitExpected: '',
      },
    });

    const onSubmit = (data: TestCaseFormData) => {
      handleApiCall('post', '/testcases', {
        problem_id: data.problemId,
        testcases: {
          run: [{ input: data.runInput, expected: data.runExpected }],
          submit: [{ input: data.submitInput, expected: data.submitExpected }],
        },
      });
    };

    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold text-white">Test Cases</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-white block mb-2">Problem ID</label>
            <input
              type="text"
              placeholder="Problem ID"
              {...register('problemId')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.problemId && <p className="text-teal-primary text-sm mt-1">{errors.problemId.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Run Input</label>
            <input
              type="text"
              placeholder="Run Input"
              {...register('runInput')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.runInput && <p className="text-teal-primary text-sm mt-1">{errors.runInput.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Run Expected</label>
            <input
              type="text"
              placeholder="Run Expected"
              {...register('runExpected')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.runExpected && <p className="text-teal-primary text-sm mt-1">{errors.runExpected.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Submit Input</label>
            <input
              type="text"
              placeholder="Submit Input"
              {...register('submitInput')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.submitInput && <p className="text-teal-primary text-sm mt-1">{errors.submitInput.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Submit Expected</label>
            <input
              type="text"
              placeholder="Submit Expected"
              {...register('submitExpected')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.submitExpected && <p className="text-teal-primary text-sm mt-1">{errors.submitExpected.message}</p>}
          </div>
          <div className="col-span-2 flex gap-4">
            <button
              type="submit"
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Add Test Cases
            </button>
            <button
              type="button"
              onClick={() => handleApiCall('delete', '/testcases', { problem_id: '', run_indices: [0], submit_indices: [0] })}
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Remove Test Cases
            </button>
          </div>
        </form>
      </div>
    );
  };

  const LanguageSupport = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LanguageFormData>({
      resolver: zodResolver(languageSchema),
      defaultValues: {
        problemId: '',
        language: '',
        placeholder: '',
        code: '',
      },
    });

    const onSubmit = (data: LanguageFormData) => {
      handleApiCall('post', '/language', {
        problem_id: data.problemId,
        language: data.language,
        validation_code: { placeholder: data.placeholder, code: data.code },
      });
    };

    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold text-white">Language Support</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-white block mb-2">Problem ID</label>
            <input
              type="text"
              placeholder="Problem ID"
              {...register('problemId')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.problemId && <p className="text-teal-primary text-sm mt-1">{errors.problemId.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Language</label>
            <input
              type="text"
              placeholder="Language"
              {...register('language')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.language && <p className="text-teal-primary text-sm mt-1">{errors.language.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="text-sm text-white block mb-2">Placeholder</label>
            <input
              type="text"
              placeholder="Placeholder"
              {...register('placeholder')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.placeholder && <p className="text-teal-primary text-sm mt-1">{errors.placeholder.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="text-sm text-white block mb-2">Code</label>
            <textarea
              placeholder="Code"
              {...register('code')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200 h-32"
            />
            {errors.code && <p className="text-teal-primary text-sm mt-1">{errors.code.message}</p>}
          </div>
          <div className="col-span-2 flex gap-4">
            <button
              type="submit"
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Add Language Support
            </button>
            <button
              type="button"
              onClick={() => handleApiCall('put', '/language', { problem_id: '', language: '', validate: { placeholder: '', code: '' } })}
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Update Language Support
            </button>
            <button
              type="button"
              onClick={() => handleApiCall('delete', '/language', { problem_id: '', language: '' })}
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Remove Language Support
            </button>
          </div>
        </form>
      </div>
    );
  };

  const ListProblems = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ListParamsFormData>({
      resolver: zodResolver(listParamsSchema),
      defaultValues: {
        page: '1',
        pageSize: '10',
        tags: '',
        difficulty: '',
        searchQuery: '',
      },
    });

    const onSubmit = (data: ListParamsFormData) => {
      handleApiCall('get', '/list', null, {
        page: data.page,
        page_size: data.pageSize,
        tags: data.tags?.split(',').map(tag => tag.trim()),
        difficulty: data.difficulty,
        search_query: data.searchQuery,
      });
    };

    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold text-white">List Problems</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-white block mb-2">Page</label>
            <input
              type="text"
              placeholder="Page"
              {...register('page')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.page && <p className="text-teal-primary text-sm mt-1">{errors.page.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Page Size</label>
            <input
              type="text"
              placeholder="Page Size"
              {...register('pageSize')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.pageSize && <p className="text-teal-primary text-sm mt-1">{errors.pageSize.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              {...register('tags')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.tags && <p className="text-teal-primary text-sm mt-1">{errors.tags.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white block mb-2">Difficulty</label>
            <input
              type="text"
              placeholder="Difficulty"
              {...register('difficulty')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.difficulty && <p className="text-teal-primary text-sm mt-1">{errors.difficulty.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="text-sm text-white block mb-2">Search Query</label>
            <input
              type="text"
              placeholder="Search Query"
              {...register('searchQuery')}
              className="w-full bg-[#2C2C2C] border border-gray-border text-white rounded-md p-3 focus:outline-none focus:border-teal-primary focus:ring-teal-primary transition-all duration-200"
            />
            {errors.searchQuery && <p className="text-teal-primary text-sm mt-1">{errors.searchQuery.message}</p>}
          </div>
          <div className="col-span-2 flex gap-4">
            <button
              type="submit"
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              List Problems
            </button>
            <button
              type="button"
              onClick={() => handleApiCall('get', '/validate', null, { problem_id: '' })}
              className="bg-teal-primary text-dark-bg py-2 px-4 rounded-md hover:bg-teal-hover transition-colors duration-200"
            >
              Validate Problem
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-dark-bg text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1D1D1D] p-4 border-r border-gray-border">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold text-white">xcode</h1>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => handleTabChange(0)}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-bg ${tabValue === 0 ? 'bg-gray-bg' : ''}`}
          >
            Problem CRUD
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-bg ${tabValue === 1 ? 'bg-gray-bg' : ''}`}
          >
            Test Cases
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-bg ${tabValue === 2 ? 'bg-gray-bg' : ''}`}
          >
            Language Support
          </button>
          <button
            onClick={() => handleTabChange(3)}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-bg ${tabValue === 3 ? 'bg-gray-bg' : ''}`}
          >
            List & Validate
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>
        <div className="bg-gray-bg border border-gray-border rounded-lg p-6 shadow-lg">
          {tabValue === 0 && <ProblemCRUD />}
          {tabValue === 1 && <TestCases />}
          {tabValue === 2 && <LanguageSupport />}
          {tabValue === 3 && <ListProblems />}
          {renderResponse()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
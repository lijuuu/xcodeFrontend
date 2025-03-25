import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Clock, CheckCircle, XCircle, ArrowLeft, Plus } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/hooks/theme-provider';
import { useNavigate } from 'react-router-dom';
import * as monaco from 'monaco-editor';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type TestCase = {
  id?: string;
  input: string;
  expected: string;
};

type TestCaseRunOnly = {
  run: TestCase[];
};

type ProblemMetadata = {
  problem_id: string;
  title: string;
  description: string;
  tags: string[];
  testcase_run: TestCaseRunOnly;
  difficulty: string;
  supported_languages: string[];
  validated?: boolean;
  placeholder_maps: { [key: string]: string };
};

type TestResult = {
  testCaseIndex: number;
  input: any;
  expected: any;
  received: any;
  passed: boolean;
  error?: string;
};

type ExecutionResult = {
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  overallPass: boolean;
  failedTestCase?: TestResult;
  syntaxError?: string;
};

type ApiResponsePayload = {
  problem_id: string;
  language: string;
  is_run_testcase: boolean;
  rawoutput: ExecutionResult;
};

type GenericResponse = {
  success: boolean;
  status: number;
  payload: ApiResponsePayload;
  error?: { errorType: string; message: string };
};

const API_BASE_URL = 'http://localhost:7000/api/v1';

const mapDifficulty = (difficulty: string): string => {
  switch (difficulty) {
    case 'E': return 'Easy';
    case 'M': return 'Medium';
    case 'H': return 'Hard';
    default: return difficulty;
  }
};

const fetchProblemById = async (problemId: string): Promise<ProblemMetadata> => {
  const response = await fetch(`${API_BASE_URL}/problems/metadata?problem_id=${problemId}`);
  if (!response.ok) throw new Error('Failed to fetch problem');
  const data = await response.json();
  const problemData = data.payload || data;
  return {
    problem_id: problemData.problem_id || '',
    title: problemData.title || 'Untitled',
    description: problemData.description || '',
    tags: problemData.tags || [],
    testcase_run: problemData.testcase_run || { run: [] }, // Ensure testcase_run is always defined
    difficulty: mapDifficulty(problemData.difficulty || ''),
    supported_languages: problemData.supported_languages || [],
    validated: problemData.validated || false,
    placeholder_maps: problemData.placeholder_maps || {},
  };
};

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const Timer: React.FC = () => {
  const [time, setTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isActive) interval = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div className="flex items-center gap-4 px-5 py-2 bg-editor-darker rounded-md shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center gap-2 text-sm text-editor-text">
        <Clock className="h-5 w-5 text-editor-accent" />
        <span className="font-medium">{formatTime(time)}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setIsActive(true)} disabled={isActive} className="h-8 px-3 text-xs font-medium text-editor-text bg-editor-darker hover:bg-editor-border">Start</Button>
      <Button variant="ghost" size="sm" onClick={() => { setIsActive(false); setTime(0); }} className="h-8 px-3 text-xs font-medium text-editor-text bg-editor-darker hover:bg-editor-border">Reset</Button>
    </motion.div>
  );
};

const ProblemDescription: React.FC<{ problem: ProblemMetadata }> = ({ problem }) => {
  const navigate = useNavigate();
  return (
    <motion.div className="glass-panel p-4 overflow-y-auto h-full bg-editor-darker border-r border-editor-border relative" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-editor-accent">{problem.title}</h2>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-editor-line text-editor-text">{problem.difficulty}</span>
          {problem.tags.map((tag, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-editor-border text-editor-text">{tag}</span>)}
        </div>
        <div className="text-sm text-editor-text/90">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-editor-accent mt-4 mb-2" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-md font-semibold text-white mt-4 mb-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-sm font-medium text-white mt-3 mb-1" {...props} />,
              p: ({ node, ...props }) => <p className="text-editor-text/90 mb-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 text-editor-accent space-y-1 mb-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-editor-text/90" {...props} />,
              code: ({ node, ...props }) => <code className="text-editor-accent rounded-md my-2" {...props} />,
            }}
          >
            {problem.description}
          </ReactMarkdown>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => navigate('/problemset')} className="absolute bottom-4 left-4 right-4 w-full bg-gray-800 text-editor-accent hover:bg-gray-800 hover:text-editor-accent">
        <ArrowLeft className="h-4 w-4 mr-2" /> View All Problems
      </Button>
    </motion.div>
  );
};

const CodeEditor: React.FC<{ value: string; onChange: (value: string) => void; language: string }> = ({ value, onChange, language }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { theme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<string>(theme === 'dark' ? 'vs-dark' : 'light');

  useEffect(() => setEditorTheme(theme === 'dark' ? 'vs-dark' : 'light'), [theme]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.focus();
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => { if (editorRef.current) editorRef.current.layout(); });
    const container = document.getElementById('editor-container');
    if (container) resizeObserver.observe(container);
    return () => { if (container) resizeObserver.unobserve(container); };
  }, []);

  return (
    <motion.div id="editor-container" className="w-full h-full overflow-hidden rounded-md glass-panel bg-editor-darker border border-editor-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange(v || '')}
        onMount={handleEditorDidMount}
        theme={editorTheme}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineHeight: 22,
          fontFamily: 'JetBrains Mono, monospace, Consolas, "Courier New"',
          tabSize: 2,
          wordWrap: 'on',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          contextmenu: true,
          suggest: { showMethods: true, showFunctions: true, showConstructors: true, showFields: true, showVariables: true, showClasses: true, showInterfaces: true },
        }}
      />
    </motion.div>
  );
};

const Console: React.FC<{
  output: string[];
  executionResult: ExecutionResult | null;
  isMobile: boolean;
  onReset: () => void;
  testCases: TestCase[];
  customTestCases: TestCase[];
  onAddCustomTestCase: (input: string, expected: string) => void;
  activeTab: 'output' | 'tests' | 'custom';
  setActiveTab: (tab: 'output' | 'tests' | 'custom') => void;
}> = ({ output = [], executionResult, isMobile, onReset, testCases = [], customTestCases = [], onAddCustomTestCase, activeTab, setActiveTab }) => {
  const [customInput, setCustomInput] = useState('');
  const [customExpected, setCustomExpected] = useState('');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current && activeTab === 'output') consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [output, activeTab]);

  const handleAddCustomTestCase = () => {
    if (customInput && customExpected) {
      onAddCustomTestCase(customInput, customExpected);
      setCustomInput('');
      setCustomExpected('');
    }
  };

  return (
    <motion.div className="h-full overflow-hidden flex flex-col bg-editor-darker border-t border-editor-border" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      <div className="flex items-center justify-between border-b border-editor-border px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-editor-accent/80"></div>
          <h3 className="text-sm font-medium text-white">Console</h3>
          <div className="flex text-xs">
            <button onClick={() => setActiveTab('output')} className={`px-2 py-1 rounded-l-md ${activeTab === 'output' ? 'bg-editor-accent text-white' : 'bg-editor-darker text-editor-text hover:bg-editor-border'}`}>Output</button>
            <button onClick={() => setActiveTab('tests')} className={`px-2 py-1 ${activeTab === 'tests' ? 'bg-editor-accent text-white' : 'bg-editor-darker text-editor-text hover:bg-editor-border'}`}>Test Cases</button>
            <button onClick={() => setActiveTab('custom')} className={`px-2 py-1 rounded-r-md ${activeTab === 'custom' ? 'bg-editor-accent text-white' : 'bg-editor-darker text-editor-text hover:bg-editor-border'}`}>Custom Tests</button>
          </div>
        </div>
        {isMobile && (
          <motion.button onClick={onReset} className="glass-panel px-2 py-1 rounded-md flex items-center gap-1 text-editor-text hover:bg-editor-accent/10" whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
            <RefreshCw className="h-4 w-4" /> Reset
          </motion.button>
        )}
      </div>
      <div className="overflow-y-auto p-3 font-mono text-sm flex-grow bg-editor-darker">
        {activeTab === 'output' ? (
          output.length > 0 ? (
            output.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">
                {line.startsWith('[Error]') ? <span className="text-red-400">{line}</span> : line.match(/Array|Object/) ? <span className="text-editor-accent">{line}</span> : <span className="text-editor-text">{line}</span>}
              </div>
            ))
          ) : (
            <div className="text-editor-text/60 italic">Run your code to see output here...</div>
          )
        ) : activeTab === 'tests' ? (
          <div>
            <h4 className="text-white font-medium mb-2">Run Test Cases</h4>
            {testCases.length > 0 ? (
              testCases.map((tc, i) => (
                <div key={tc.id || i} className="p-2 rounded-md bg-editor-border/20 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-editor-text">Test Case {i + 1}</span>
                    {executionResult && executionResult.failedTestCase && executionResult.failedTestCase.testCaseIndex === i ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : executionResult && executionResult.passedTestCases > i ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : null}
                  </div>
                  <div className="ml-6 mt-1 text-xs space-y-1">
                    <div>Input: <span className="text-editor-accent">{tc.input}</span></div>
                    <div>Expected: <span className="text-editor-accent">{tc.expected}</span></div>
                    {executionResult && executionResult.failedTestCase && executionResult.failedTestCase.testCaseIndex === i && (
                      <>
                        {JSON.stringify(executionResult.failedTestCase.received) && <div>Received: <span className="text-red-400">{JSON.stringify(executionResult.failedTestCase.received)}</span></div>}
                        {executionResult.failedTestCase.error && <div>Error: <span className="text-red-400">{executionResult.failedTestCase.error}</span></div>}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-editor-text/60 italic">No run test cases available.</div>
            )}
            {executionResult && (
              <div className="mt-4">
                <div className="mb-2">
                  <span className="text-editor-text">Total Test Cases: {executionResult.totalTestCases}</span><br />
                  <span className="text-green-400">Passed: {executionResult.passedTestCases}</span><br />
                  <span className="text-red-400">Failed: {executionResult.failedTestCases}</span>
                </div>
                {executionResult.failedTestCase?.testCaseIndex !== -1 && (
                  <div className="p-2 rounded-md bg-red-900/20">
                    <h4 className="text-red-400 font-medium">Failed Test Case Details</h4>
                    <div className="ml-2 mt-1 text-xs space-y-1">
                      <div>Test Case Index: <span className="text-editor-text">{executionResult.failedTestCase?.testCaseIndex}</span></div>
                      <div>Input: <span className="text-editor-accent">{JSON.stringify(executionResult.failedTestCase?.input)}</span></div>
                      <div>Expected: <span className="text-editor-accent">{JSON.stringify(executionResult.failedTestCase?.expected)}</span></div>
                      <div>Received: <span className="text-red-400">{JSON.stringify(executionResult.failedTestCase?.received)}</span></div>
                      {executionResult.failedTestCase?.error && <div>Error: <span className="text-red-400">{executionResult.failedTestCase?.error}</span></div>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Add Custom Test Case</h4>
              <Input placeholder='e.g., { "nums": [2,7,11,15], "target": 9 }' value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="mb-2 bg-editor-darker text-editor-text border-editor-border" />
              <Input placeholder="e.g., [0,1]" value={customExpected} onChange={(e) => setCustomExpected(e.target.value)} className="mb-2 bg-editor-darker text-editor-text border-editor-border" />
              <Button onClick={handleAddCustomTestCase} className="w-full bg-editor-accent text-white hover:bg-editor-accent/90"><Plus className="h-4 w-4 mr-2" /> Add Test Case</Button>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Custom Test Cases</h4>
              {customTestCases.length > 0 ? (
                customTestCases.map((tc, i) => (
                  <div key={i} className="p-2 rounded-md bg-editor-border/20 mb-2">
                    <div>Input: <span className="text-editor-accent">{tc.input}</span></div>
                    <div>Expected: <span className="text-editor-accent">{tc.expected}</span></div>
                  </div>
                ))
              ) : (
                <div className="text-editor-text/60 italic">No custom test cases added yet...</div>
              )}
            </div>
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>
    </motion.div>
  );
};

const Playground: React.FC = () => {
  const [problemId, setProblemId] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string[]>([]);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [problem, setProblem] = useState<ProblemMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([]);
  const [consoleTab, setConsoleTab] = useState<'output' | 'tests' | 'custom'>('tests');
  const isMobile = useIsMobile();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlProblemId = queryParams.get('problem_id') || '';
    setProblemId(urlProblemId);

    if (!urlProblemId) {
      setIsLoading(false);
      return;
    }

    const storedLanguage = localStorage.getItem('language');

    setIsLoading(true);
    fetchProblemById(urlProblemId)
      .then(data => {
        setProblem(data);
        const firstLang = storedLanguage && data.supported_languages.includes(storedLanguage)
          ? storedLanguage
          : data.supported_languages[0] || 'go';
        setLanguage(firstLang);
        localStorage.setItem('language', firstLang);

        const codeKey = `${urlProblemId}_${firstLang}`;
        const storedCode = localStorage.getItem(codeKey);
        setCode(storedCode || data.placeholder_maps[firstLang] || '');
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching problem:', error);
        // Set a default problem to prevent undefined states
        setProblem({
          problem_id: '',
          title: 'Error Loading Problem',
          description: 'Failed to load problem data. Please try again later.',
          tags: [],
          testcase_run: { run: [] },
          difficulty: 'Unknown',
          supported_languages: ['javascript', 'go', 'python', 'cpp'],
          placeholder_maps: {
            javascript: '// Write your JavaScript solution here\n',
            go: '// Write your Go solution here\npackage main\n',
            python: '# Write your Python solution here\n',
            cpp: '// Write your C++ solution here\n#include <string>\n',
          },
        });
        setLanguage(storedLanguage || 'javascript');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (problem && language) {
      const codeKey = `${problem.problem_id}_${language}`;
      const storedCode = localStorage.getItem(codeKey);
      setCode(storedCode || problem.placeholder_maps[language] || '');
      setOutput([]);
      setExecutionResult(null);
      localStorage.setItem('language', language);
    }
  }, [problem, language]);

  useEffect(() => {
    if (problemId && language && code) {
      const codeKey = `${problemId}_${language}`;
      localStorage.setItem(codeKey, code);
    }
  }, [code, problemId, language]);

  const handleCodeExecution = useCallback(async (type: string) => {
    if (!problem) return;

    setIsExecuting(true);
    setOutput([]);
    setExecutionResult(null);

    const allTestCases = type === 'run' ? [...problem.testcase_run.run, ...customTestCases] : problem.testcase_run.run;

    try {
      const response = await fetch(`${API_BASE_URL}/problems/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problem.problem_id,
          language: language,
          user_code: code,
          is_run_testcase: type === 'run',
        }),
      });

      const data: GenericResponse = await response.json();
      const payload: ApiResponsePayload = data.payload;
      const executionResult: ExecutionResult = payload.rawoutput;
      alert(JSON.stringify(data))


      if (!data.success) {
        let errorMessage = executionResult.failedTestCase?.error || 'Unknown error';
        if (executionResult.syntaxError) {
          errorMessage = `Syntax Error: ${executionResult.syntaxError}`;
        } else if (data.error) {
          errorMessage = `${data.error.errorType}: ${data.error.message}`;
        }


        setOutput([`[Error] ${errorMessage}`]);
        setExecutionResult(executionResult);
        setConsoleTab('output');

        toast.error(`${type === 'run' ? 'Run' : 'Submit'} Failed`, {
          description: errorMessage,
        });
      } else {
        setOutput([
          `ProblemID: ${payload.problem_id}`,
          `Language: ${payload.language}`,
          `IsRunTestcase: ${payload.is_run_testcase}`,
          `ExecutionResult: ${JSON.stringify(executionResult, null, 2)}`,
        ]);
        setExecutionResult(executionResult);

        if (type === 'run') {
          if (executionResult.overallPass) {
            toast.success('Run Successful', {
              description: `All ${executionResult.totalTestCases} test cases passed!`,
            });
            setConsoleTab('output');
          } else {
            toast.warning('Run Partially Successful', {
              description: `${executionResult.passedTestCases} of ${executionResult.totalTestCases} test cases passed.`,
            });
            setConsoleTab('tests');
          }
        } else if (type === 'submit') {
          if (executionResult.overallPass) {
            toast.success('Submission Accepted', {
              description: 'All test cases passed! Great job!',
            });
            setConsoleTab('output');
          } else {
            toast.error('Submission Failed', {
              description: `${executionResult.failedTestCases} test case(s) failed. Check the details.`,
            });
            setConsoleTab('tests');
          }
        }
      }
    } catch (error) {
      const errorMsg = (error as Error).message || 'Network error occurred';
      setOutput([`[Error] ${errorMsg}`]);
      setExecutionResult({
        totalTestCases: allTestCases.length,
        passedTestCases: 0,
        failedTestCases: 0,
        overallPass: false,
        failedTestCase: { testCaseIndex: -1, input: null, expected: null, received: null, passed: false, error: errorMsg },
      });
      setConsoleTab('output');

      toast.error(`${type === 'run' ? 'Run' : 'Submit'} Failed`, {
        description: errorMsg,
      });
    } finally {
      setIsExecuting(false);
    }
  }, [code, problem, language, customTestCases]);

  const handleResetCode = () => {
    if (problem && language) {
      const codeKey = `${problem.problem_id}_${language}`;
      localStorage.removeItem(codeKey);
      setCode(problem.placeholder_maps[language] || '');
      setOutput([]);
      setExecutionResult(null);
      setCustomTestCases([]);
      setConsoleTab('tests');
      toast.info('Code Reset', { description: 'Editor reset to default code.' });
    }
  };

  const handleAddCustomTestCase = (input: string, expected: string) => {
    setCustomTestCases(prev => [...prev, { input, expected }]);
    toast.success('Custom Test Case Added', { description: 'Added to your test cases.' });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-editor-text">Loading...</div>;
  if (!problem) return <div className="min-h-screen flex items-center justify-center text-editor-text">No problem specified or failed to load.</div>;

  return (
    <motion.div className="min-h-screen flex flex-col bg-editor-bg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <ResizablePanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-grow">
        <ResizablePanel defaultSize={isMobile ? 40 : 35} minSize={20} className="relative">
          <ProblemDescription problem={problem} />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-editor-border" />
        <ResizablePanel defaultSize={isMobile ? 60 : 65} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={30}>
              <motion.div className="p-3 space-y-3 h-full flex flex-col bg-editor-darker" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <motion.button onClick={() => handleCodeExecution("run")} disabled={isExecuting} className="glass-panel px-3 py-1 rounded-md flex items-center gap-2 text-white hover:bg-editor-accent/10" whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
                      {isExecuting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-editor-accent" />}
                      <span className="hidden sm:inline text-sm">Run</span>
                    </motion.button>
                    <motion.button onClick={() => handleCodeExecution("submit")} disabled={isExecuting} className="glass-panel px-3 py-1 rounded-md flex items-center gap-2 text-white hover:bg-editor-accent/10" whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
                      {isExecuting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-editor-accent" />}
                      <span className="hidden sm:inline text-sm">Submit</span>
                    </motion.button>
                  </div>
                  <Timer />
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-editor-darker text-editor-text px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none text-sm">
                    {problem.supported_languages.map(lang => <option key={lang} value={lang} className="bg-editor-darker text-editor-text">{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>)}
                  </select>
                </div>
                <div className="flex-grow">
                  <CodeEditor value={code} onChange={setCode} language={language} />
                </div>
              </motion.div>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-editor-border" />
            <ResizablePanel defaultSize={30} minSize={5}>
              <Console
                output={output}
                executionResult={executionResult}
                isMobile={isMobile}
                onReset={handleResetCode}
                testCases={problem.testcase_run.run || []} 
                customTestCases={customTestCases}
                onAddCustomTestCase={handleAddCustomTestCase}
                activeTab={consoleTab}
                setActiveTab={setConsoleTab}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </motion.div>
  );
};

export default Playground;
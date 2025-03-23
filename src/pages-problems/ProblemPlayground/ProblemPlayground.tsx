import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Play, RefreshCw, Lightbulb, Clock, CheckCircle, XCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/hooks/theme-provider';
import * as monaco from 'monaco-editor';


type TestCase = {
  input: unknown;
  expected: unknown;
};

type Problem = {
  id: string;
  title: string;
  difficulty: string;
  tags: string[];
  description: string;
  starterCode: { [key: string]: string };
  constraints: string[];
  testCases: TestCase[];
  supportedLanguages: string[];
};

type TestResult = {
  passed: boolean;
  name: string;
  expected?: string;
  actual?: string;
};

const mapDifficulty = (difficulty: string): string => {
  switch (difficulty) {
    case 'E':
      return 'Easy';
    case 'M':
      return 'Medium';
    case 'H':
      return 'Hard';
    default:
      return difficulty;
  }
};

const problems: Problem[] = [
  {
    id: '67d96452d3fe6af39801337b',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'String', 'Linked List'],
    description: `
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to the target.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Examples

### Example 1:
- **Input**: \`nums = [2,7,11,15], target = 9\`
- **Output**: \`[0,1]\`
- **Explanation**: Because \`nums[0] + nums[1] == 9\`, we return \`[0, 1]\`.

### Example 2:
- **Input**: \`nums = [3,2,4], target = 6\`
- **Output**: \`[1,2]\`

## Constraints
- \`2 <= nums.length <= 10⁴\`
- \`-10⁹ <= nums[i] <= 10⁹\`
- \`-10⁹ <= target <= 10⁹\`
- Only one valid answer exists.

## Follow-up
Can you come up with an algorithm that is less than O(n²) time complexity?
    `.trim(),
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  return [];\n}',
      go: 'package main\nfunc twoSum(nums []int, target int) []int {\n  return []int{}\n}',
      python: 'def two_sum(nums, target):\n    return []',
      cpp: '#include <vector>\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n  return {};\n}',
    },
    constraints: [
      '2 <= nums.length <= 10⁴',
      '-10⁹ <= nums[i] <= 10⁹',
      '-10⁹ <= target <= 10⁹',
      'Only one valid answer exists.',
    ],
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1],
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2],
      },
    ],
    supportedLanguages: ['javascript', 'go', 'python', 'cpp'],
  },
  {
    id: '67d96452d3fe6af39801337c',
    title: 'Reverse a String',
    difficulty: mapDifficulty('E'),
    tags: ['String', 'Array'],
    description: 'Reverse the given string.',
    starterCode: {
      javascript: 'function reverseString(s) {\n  return "";\n}',
      go: 'package main\nfunc reverseString(s string) string {\n  return ""\n}',
      python: 'def reverse_string(s):\n    return ""',
      cpp: '#include <string>\nstd::string reverseString(std::string s) {\n  return "";\n}',
    },
    constraints: [],
    testCases: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
    ],
    supportedLanguages: ['javascript', 'go', 'python', 'cpp'],
  },
  {
    id: '67d96452d3fe6af39801337d',
    title: 'Fibonacci Number',
    difficulty: mapDifficulty('M'),
    tags: ['Recursion', 'Dynamic Programming'],
    description: 'Find the nth Fibonacci number.',
    starterCode: {
      javascript: 'function fibonacci(n) {\n  return 0;\n}',
      go: 'package main\nfunc fibonacci(n int) int {\n  return 0\n}',
      python: 'def fibonacci(n):\n    return 0',
      cpp: '#include <iostream>\nint fibonacci(int n) {\n  return 0;\n}',
    },
    constraints: [],
    testCases: [
      { input: 5, expected: 5 },
      { input: 10, expected: 55 },
    ],
    supportedLanguages: ['javascript', 'go', 'python', 'cpp'],
  },
];

const getProblemById = (id: string, problemsList: Problem[]): Problem | undefined => problemsList.find(p => p.id === id);

const runTests = (code: string, testCases: TestCase[], problemId: string, language: string): { results: TestResult[]; logs: string[] } => {
  const results: TestResult[] = [];
  const logs: string[] = [];

  try {
    const func = new Function(`return ${code}`)();

    testCases.forEach((test: any, i) => {
      let result;
      if (problemId === '67d96452d3fe6af39801337b') {
        result = func(test.input.nums, test.input.target);
      } else if (problemId === '67d96452d3fe6af39801337c') {
        result = func(test.input);
      } else if (problemId === '67d96452d3fe6af39801337d') {
        result = func(test.input);
      } else {
        result = func(test.input);
      }

      const passed = JSON.stringify(result) === JSON.stringify(test.expected);
      results.push({
        passed,
        name: `Test ${i + 1}`,
        expected: JSON.stringify(test.expected),
        actual: JSON.stringify(result),
      });
      logs.push(`Test ${i + 1}: ${passed ? 'Passed' : 'Failed'}`);
    });
  } catch (e) {
    results.push({ passed: false, name: 'Execution', expected: 'Valid Output', actual: (e as Error).message });
    logs.push(`Error: ${(e as Error).message}`);
  }

  return { results, logs };
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
    if (isActive) {
      interval = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-1 text-sm text-editor-text">
        <Clock className="h-4 w-4 text-emerald-400" />
        <span>{formatTime(time)}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsActive(true)}
        disabled={isActive}
        className="h-7 px-2 text-xs text-editor-text hover:bg-editor-accent/10"
      >
        Start
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setIsActive(false); setTime(0); }}
        className="h-7 px-2 text-xs text-editor-text hover:bg-editor-accent/10"
      >
        Reset
      </Button>
    </motion.div>
  );
};

const ProblemDescription: React.FC<{ problem: Problem }> = ({ problem }) => {
  return (
    <motion.div
      className="glass-panel p-4 overflow-y-auto h-full bg-editor-darker"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-white">{problem.title}</h2>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-editor-line text-editor-text">
              {problem.difficulty}
            </span>
            {problem.tags.map((tag, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-editor-border text-editor-text">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm text-editor-text/90">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-md font-semibold text-white mt-4 mb-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-sm font-medium text-white mt-3 mb-1" {...props} />,
              p: ({ node, ...props }) => <p className="text-editor-text/90 mb-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 text-editor-text/90 space-y-1 mb-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-editor-text/90" {...props} />,
              code: ({ node, ...props }) => (
                <code className="text-editor-accent rounded-md my-2" {...props} />
              ),
            }}
          >
            {problem.description}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

const CodeEditor: React.FC<{ value: string; onChange: (value: string) => void; language: string }> = ({ value, onChange, language }) => {
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
    (editor as { focus: () => void }).focus();
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) (editorRef.current as { layout: () => void }).layout();
    });
    const container = document.getElementById('editor-container');
    if (container) resizeObserver.observe(container);
    return () => {
      if (container) resizeObserver.unobserve(container);
    };
  }, []);


  const { theme } = useTheme();
  useEffect(() => {
    const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs';
    monaco.editor.setTheme(editorTheme);
  }, [theme]);


  return (
    <motion.div
      id="editor-container"
      className="w-full h-full overflow-hidden rounded-md glass-panel animate-fade-in bg-editor-darker"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange(v || '')}
        onMount={handleEditorDidMount}
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
          padding: { top: 16, bottom: 16 },
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          contextmenu: true,
          suggest: {
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showInterfaces: true,
          },
          theme: theme === 'dark' ? 'vs-dark' : 'vs', // Initial theme
        }}
      />
    </motion.div>
  );
};

const Console: React.FC<{
  output: string[];
  testResults: TestResult[];
  isMobile: boolean;
  onHint: () => void;
  onReset: () => void;
}> = ({ output, testResults, isMobile, onHint, onReset }) => {
  const [tab, setTab] = useState<'output' | 'tests'>('output');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current && tab === 'output') {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, tab]);

  return (
    <motion.div
      className="glass-panel h-full overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between border-b border-editor-border px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-editor-accent/80"></div>
          <h3 className="text-sm font-medium text-white">Console</h3>
          <div className="flex text-xs">
            <button
              onClick={() => setTab('output')}
              className={`px-3 py-1 rounded-l-md ${tab === 'output' ? 'bg-editor-accent text-white' : 'bg-editor-darker text-editor-text hover:bg-editor-border'}`}
            >
              Output
            </button>
            <button
              onClick={() => setTab('tests')}
              className={`px-3 py-1 rounded-r-md ${tab === 'tests' ? 'bg-editor-accent text-white' : 'bg-editor-darker text-editor-text hover:bg-editor-border'}`}
            >
              Test Cases
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMobile ? (
            <>
              <motion.button
                onClick={onHint}
                className="glass-panel px-2 py-1 rounded-md flex items-center gap-1 text-white hover:bg-editor-accent/10 focus:outline-none text-xs"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
              >
                <Lightbulb className="h-4 w-4 text-editor-accent" />
                Hint
              </motion.button>
              <motion.button
                onClick={onReset}
                className="glass-panel px-2 py-1 rounded-md flex items-center gap-1 text-white hover:bg-editor-accent/10 focus:outline-none text-xs"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={onHint}
              className="glass-panel px-2 py-1 rounded-md flex items-center gap-1 text-white hover:bg-editor-accent/10 focus:outline-none text-xs"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
            >
              <Lightbulb className="h-4 w-4 text-editor-accent" />
              Hint
            </motion.button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto p-3 font-mono text-sm flex-grow bg-editor-darker">
        {tab === 'output' ? (
          output.length > 0 ? output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line.startsWith('[Error]') ? (
                <span className="text-red-400">{line}</span>
              ) : line.match(/Array|Object/) ? (
                <span className="text-editor-accent">{line}</span>
              ) : (
                <span className="text-editor-text">{line}</span>
              )}
            </div>
          )) : (
            <div className="text-editor-text/60 italic">Run your code to see output here...</div>
          )
        ) : testResults.length > 0 ? testResults.map((test, i) => (
          <div key={i} className={`p-2 rounded-md ${test.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              {test.passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              <span className={`font-medium ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                Test Case {i + 1}: {test.name}
              </span>
            </div>
            {!test.passed && test.expected && test.actual && (
              <div className="ml-6 mt-1 text-xs space-y-1">
                <div>Expected: <span className="text-editor-accent">{test.expected}</span></div>
                <div>Actual: <span className="text-red-400">{test.actual}</span></div>
              </div>
            )}
          </div>
        )) : (
          <div className="text-editor-text/60 italic">Run your code to see test results here...</div>
        )}
        <div ref={consoleEndRef} />
      </div>
    </motion.div>
  );
};

const Playground: React.FC = () => {
  const [problemId, setProblemId] = useState<string>(problems[0].id);
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [problemsList, setProblemsList] = useState<Problem[]>(problems);
  const isMobile = useIsMobile();
  const problem = getProblemById(problemId, problemsList);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const fetchedProblemId = queryParams.get('problem_id') || problems[0].id;

    fetch(`http://localhost:7000/api/v1/problems/?problem_id=${fetchedProblemId}`)
      .then(response => response.json())
      .then(data => {
        const transformedProblem: Problem = {
          id: data._id,
          title: data.title,
          difficulty: mapDifficulty(data.difficulty),
          tags: data.tags,
          description: data.description,
          starterCode: {
            javascript: data.validate_code?.javascript?.placeholder || 'function solution() {\n  return null;\n}',
            go: data.validate_code?.go?.placeholder || 'package main\nfunc solution() {\n  return nil\n}',
            python: data.validate_code?.python?.placeholder || 'def solution():\n    return None',
            cpp: data.validate_code?.cpp?.placeholder || '#include <iostream>\nvoid solution() {\n  return;\n}',
          },
          constraints: data.constraints || [],
          testCases: data.testcases?.run?.map((tc: { input: string; expected: string }) => ({
            input: JSON.parse(tc.input.replace(/'/g, '"')),
            expected: JSON.parse(tc.expected.replace(/'/g, '"')),
          })) || [],
          supportedLanguages: data.supported_languages || ['javascript', 'go', 'python', 'cpp'],
        };

        setProblemsList(prev => {
          if (!prev.some(p => p.id === transformedProblem.id)) {
            return [...prev, transformedProblem];
          }
          return prev;
        });
        setProblemId(fetchedProblemId);
      })
      .catch(error => {
        console.error('Failed to fetch problem:', error);
        setProblemId(problems[0].id);
      });
  }, []);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language]);
      setOutput([]);
      setTestResults([]);
    }
  }, [problemId, language, problem]);

  //dummycode
  const handleRunCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    setTestResults([]);
    setTimeout(() => {
      try {
        const logs: string[] = [];
        console.log = (...args: unknown[]) => logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        console.error = (...args: unknown[]) => logs.push(`[Error] ${args.join(' ')}`);
        const result = new Function(code)();
        if (result !== undefined && !logs.some(log => log.includes(String(result)))) logs.push(`Result: ${JSON.stringify(result)}`);
        setOutput(logs);
        if (problem?.testCases) {
          const { results, logs: testLogs } = runTests(code, problem.testCases, problem.id, language);
          setTestResults(results);
          setOutput(prev => [...prev, '--- Test Results ---', ...testLogs]);
        }
      } catch (error) {
        setOutput([`[Error] ${(error as Error).message}`]);
        setTestResults([{ passed: false, name: 'Execution', expected: 'Valid Output', actual: (error as Error).message }]);
      }
      setIsRunning(false);
    }, 300);
  }, [code, problem, language]);

  const handleResetCode = () => {
    if (problem) setCode(problem.starterCode[language]);
    setOutput([]);
    setTestResults([]);
  };

  //dummy code
  const handleShowHint = () => {
    setOutput([
      'Hint:',
      problem?.id === '67d96452d3fe6af39801337b' ? 'Use a hash map to store numbers and check for complements.' :
        problem?.id === '67d96452d3fe6af39801337c' ? 'Use two pointers or built-in reverse methods.' :
          problem?.id === '67d96452d3fe6af39801337d' ? 'Consider using dynamic programming to optimize the recursive solution.' :
            'Try breaking down the problem into smaller subproblems.',
    ]);
  };


  if (!problem) return null;

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-editor-bg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="glass-panel z-10 border-b border-editor-border px-4 py-3 flex justify-between items-center"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <select
          value={problemId}
          onChange={(e) => setProblemId(e.target.value)}
          className="bg-editor-darker text-editor-text px-3 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none text-sm"
        >
          {problemsList.map(p => <option key={p.id} value={p.id}>{p.title} - {p.difficulty}</option>)}
        </select>
        <div className="flex items-center gap-3">
          <Timer />
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-md bg-editor-darker text-editor-text hover:bg-editor-accent/10"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
        </div>
      </motion.div>

      <ResizablePanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-grow">
        <ResizablePanel defaultSize={isMobile ? 40 : 35} minSize={20} className="relative">
          <ProblemDescription problem={problem} />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-editor-border" />

        <ResizablePanel defaultSize={isMobile ? 60 : 65} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={50}>
              <motion.div
                className="p-4 space-y-4 h-full flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="glass-panel px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-white hover:bg-editor-accent/10 focus:outline-none"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {isRunning ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 text-editor-accent" />
                    )}
                    <span className="hidden sm:inline">Run Code</span>
                  </motion.button>

                  <motion.button
                    onClick={handleResetCode}
                    className="glass-panel px-3 py-2 rounded-md text-white hover:bg-editor-accent/10 focus:outline-none"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.button>

                  <div className="flex items-center gap-2">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-editor-darker text-editor-text px-3 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none text-sm"
                    >
                      {problem.supportedLanguages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-grow">
                  <CodeEditor value={code} onChange={setCode} language={language} />
                </div>
              </motion.div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-editor-border" />

            <ResizablePanel defaultSize={30} minSize={20}>
              <Console
                output={output}
                testResults={testResults}
                isMobile={isMobile}
                onHint={handleShowHint}
                onReset={handleResetCode}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </motion.div>
  );
};

export default Playground;
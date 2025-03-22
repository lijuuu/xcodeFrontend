import { useState, useEffect, useCallback } from 'react';
import { getProblemById, problems } from '@/utils/problemData';
import { runTests, type TestResult } from '@/utils/testRunner';
import { useIsMobile } from '@/hooks/use-mobile';
import TopBar from '@/pages-problems/ProblemPlayground/components/TopBar';
import MobileMenu from '@/pages-problems/ProblemPlayground/components/MobileMenu';
import ProblemPanel from '@/pages-problems/ProblemPlayground/components/ProblemPanel';
import EditorPanel from '@/pages-problems/ProblemPlayground/components/EditorPanel';
import React from 'react';

const ProblemPlayground = () => {
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0].id);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMobile = useIsMobile();
  const selectedProblem = getProblemById(selectedProblemId);

  useEffect(() => {
    if (selectedProblem) {
      setCode(selectedProblem.starterCode);
      setOutput([]);
      setTestResults([]);
      setShowHint(false);
    }
  }, [selectedProblemId]);

  useEffect(() => {
    if (isMobile) {
      setIsPanelOpen(false);
    } else {
      setIsPanelOpen(true);
    }
  }, [isMobile]);

  const handleRunCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    setTestResults([]);

    setTimeout(() => {
      try {
        const consoleLog = console.log;
        const consoleError = console.error;
        const consoleWarn = console.warn;

        const logs: string[] = [];

        console.log = (...args) => {
          logs.push(args.map(arg =>
            typeof arg === 'object'
              ? JSON.stringify(arg, null, 2)
              : String(arg)
          ).join(' '));
        };

        console.error = (...args) => {
          logs.push(`[Error] ${args.map(arg => String(arg)).join(' ')}`);
        };

        console.warn = (...args) => {
          logs.push(`[Warning] ${args.map(arg => String(arg)).join(' ')}`);
        };

        const result = new Function(code)();

        if (result !== undefined && !logs.some(log => log.includes(String(result)))) {
          logs.push(`Result: ${JSON.stringify(result, null, 2)}`);
        }

        console.log = consoleLog;
        console.error = consoleError;
        console.warn = consoleWarn;

        setOutput(logs);

        if (selectedProblem && selectedProblem.testCases) {
          const { results, logs: testLogs } = runTests(code, selectedProblem.testCases);
          setTestResults(results);
          setOutput(prev => [...prev, '', '--- Test Results ---', ...testLogs]);
        }
      } catch (error: any) {
        setOutput([`[Error] ${error.message}`]);
        setTestResults([{
          passed: false,
          name: 'Code Execution',
          expected: 'Valid JavaScript',
          actual: error.message
        }]);
      } finally {
        setIsRunning(false);
      }
    }, 300);
  }, [code, selectedProblem]);

  const handleShowHint = () => {
    setShowHint(!showHint);
    if (!showHint && selectedProblem) {
      setOutput([
        'Here is a hint:',
        '',
        selectedProblem.id === 'two-sum'
          ? 'Consider using a hash map to store each number and its index. For each number, check if its complement (target - current number) exists in the hash map.'
          : 'First, clean the input string by removing non-alphanumeric characters and converting to lowercase. Then, you can check if it reads the same forwards and backwards using two pointers.',
      ]);
    }
  };

  const handleResetCode = () => {
    if (selectedProblem) {
      setCode(selectedProblem.starterCode);
      setOutput([]);
      setTestResults([]);
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!selectedProblem) return null;

  return (
    <div className="min-h-screen flex flex-col bg-editor-bg overflow-hidden">
      <TopBar
        selectedProblemId={selectedProblemId}
        onSelectProblem={setSelectedProblemId}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {isMobile && isMobileMenuOpen && (
        <MobileMenu
          isPanelOpen={isPanelOpen}
          togglePanel={togglePanel}
          onShowHint={handleShowHint}
        />
      )}

      <div className="flex flex-col md:flex-row flex-grow h-[calc(100vh-56px)] overflow-hidden">
        <ProblemPanel
          isPanelOpen={isPanelOpen}
          togglePanel={togglePanel}
          selectedProblem={selectedProblem}
          isMobile={isMobile}
        />

        <EditorPanel
          code={code}
          setCode={setCode}
          output={output}
          testResults={testResults}
          isPanelOpen={isPanelOpen}
          isMobile={isMobile}
          isRunning={isRunning}
          handleRunCode={handleRunCode}
          handleResetCode={handleResetCode}
          handleShowHint={handleShowHint}
        />
      </div>
    </div>
  );
};

export default ProblemPlayground;
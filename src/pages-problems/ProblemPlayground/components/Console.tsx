import React,{ useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface ConsoleProps {
  output: string[];
  testResults?: {
    passed: boolean;
    name: string;
    expected?: string;
    actual?: string;
  }[];
}

const Console = ({ output, testResults }: ConsoleProps) => {
  const [activeTab, setActiveTab] = useState<'output' | 'tests'>('output');
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when output changes
    if (consoleEndRef.current && activeTab === 'output') {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, activeTab]);

  return (
    <motion.div 
      className="glass-panel h-full overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
    >
      <div className="flex items-center justify-between border-b border-editor-border px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-editor-accent/80"></div>
          <h3 className="text-sm font-medium text-white">Console</h3>
        </div>
        <div className="flex text-xs">
          <button 
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1 rounded-l-md ${activeTab === 'output' 
              ? 'bg-editor-accent text-white' 
              : 'bg-editor-darker text-editor-text hover:bg-editor-border'}`}
          >
            Output
          </button>
          <button 
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1 rounded-r-md ${activeTab === 'tests' 
              ? 'bg-editor-accent text-white' 
              : 'bg-editor-darker text-editor-text hover:bg-editor-border'}`}
          >
            Test Cases
          </button>
        </div>
      </div>
      
      {activeTab === 'output' ? (
        <div className="overflow-y-auto p-3 font-mono text-sm flex-grow bg-editor-darker">
          <div className="space-y-1">
            {output.length > 0 ? (
              output.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap break-all">
                  {line.startsWith('[Error]') ? (
                    <span className="text-red-400">{line}</span>
                  ) : line.match(/Array|Object/) ? (
                    <span className="text-editor-accent">{line}</span>
                  ) : (
                    <span>{line}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-editor-text/60 italic">Run your code to see output here...</div>
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto p-3 font-mono text-sm flex-grow bg-editor-darker">
          {testResults && testResults.length > 0 ? (
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className={`p-2 rounded-md ${test.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {test.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`font-medium ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                      Test Case {index + 1}: {test.name}
                    </span>
                  </div>
                  {!test.passed && test.expected && test.actual && (
                    <div className="ml-6 mt-1 text-xs space-y-1">
                      <div>Expected: <span className="text-editor-accent">{test.expected}</span></div>
                      <div>Actual: <span className="text-red-400">{test.actual}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-editor-text/60 italic">Run your code to see test results here...</div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Console;
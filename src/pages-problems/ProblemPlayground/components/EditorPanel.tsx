import { motion } from "framer-motion";
import CodeEditor from "./CodeEditor";
import Console from "./Console";
import CodeActions from "@/pages-problems/ProblemPlayground/components/CodeActions";
import { TestResult } from "@/utils/testRunner";
import React from "react";

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  output: string[];
  testResults: TestResult[];
  isPanelOpen: boolean;
  isMobile: boolean;
  isRunning: boolean;
  handleRunCode: () => void;
  handleResetCode: () => void;
  handleShowHint: () => void;
}

const EditorPanel = ({ 
  code, 
  setCode,
  output,
  testResults,
  isPanelOpen,
  isMobile,
  isRunning,
  handleRunCode,
  handleResetCode,
  handleShowHint
}: EditorPanelProps) => {
  return (
    <motion.div 
      className={`flex flex-col flex-grow p-4 space-y-4 overflow-hidden ${!isPanelOpen || !isMobile ? 'block' : 'hidden'}`}
      initial={{ width: isPanelOpen && !isMobile ? '65%' : '100%' }}
      animate={{ width: isPanelOpen && !isMobile ? '65%' : '100%' }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <CodeActions
        onRunCode={handleRunCode}
        onResetCode={handleResetCode}
        onShowHint={handleShowHint}
        isRunning={isRunning}
        isMobile={isMobile}
      />
      
      <div className="flex-grow">
        <CodeEditor 
          value={code} 
          onChange={setCode} 
          language="javascript" 
        />
      </div>
      
      <div className="h-[30%]">
        <Console output={output} testResults={testResults} />
      </div>
    </motion.div>
  );
};

export default EditorPanel;
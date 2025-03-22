import { motion } from "framer-motion";
import { Play, RefreshCw, Lightbulb } from "lucide-react";
import React from "react";

interface CodeActionsProps {
  onRunCode: () => void;
  onResetCode: () => void;
  onShowHint: () => void;
  isRunning: boolean;
  isMobile: boolean;
}

const CodeActions = ({ onRunCode, onResetCode, onShowHint, isRunning, isMobile }: CodeActionsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.button
          onClick={onRunCode}
          disabled={isRunning}
          className="glass-panel px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-white hover:bg-editor-accent/10 focus:outline-none"
          whileTap={{ scale: 0.97 }}
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 text-editor-accent" />
          )}
          <span className="hidden sm:inline">Run Code</span>
        </motion.button>
        
        <motion.button
          onClick={onResetCode}
          className="glass-panel px-3 py-2 rounded-md text-white hover:bg-editor-accent/10 focus:outline-none"
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCw className="h-4 w-4" />
        </motion.button>
      </div>
      
      {!isMobile && (
        <motion.button
          onClick={onShowHint}
          className="glass-panel px-4 py-2 rounded-md flex items-center gap-2 text-white hover:bg-editor-accent/10 focus:outline-none"
          whileTap={{ scale: 0.97 }}
        >
          <Lightbulb className="h-4 w-4 text-editor-accent" />
          <span>Hint</span>
        </motion.button>
      )}
    </div>
  );
};

export default CodeActions;
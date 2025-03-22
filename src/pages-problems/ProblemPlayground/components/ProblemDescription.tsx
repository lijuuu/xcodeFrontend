import { motion } from 'framer-motion';
import { Problem } from '@/utils/problemData';
import React from 'react';

interface ProblemDescriptionProps {
  problem: Problem;
}

const ProblemDescription = ({ problem }: ProblemDescriptionProps) => {
  return (
    <motion.div 
      className="glass-panel p-4 overflow-y-auto h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="space-y-4">
        <div>
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-editor-accent/20 text-editor-accent mb-2">
            Problem
          </span>
          <h2 className="text-xl font-semibold text-white">{problem.title}</h2>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-editor-line text-editor-text">
              {problem.difficulty}
            </span>
            {problem.tags.map((tag, index) => (
              <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-editor-border text-editor-text">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-editor-text prose prose-invert max-w-none">
          <p>{problem.description}</p>
        </div>

        {problem.examples.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-medium text-white">Examples:</h3>
            {problem.examples.map((example, index) => (
              <div key={index} className="bg-editor-highlight p-3 rounded-md text-sm">
                <p className="font-medium text-white mb-1">Example {index + 1}:</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-editor-text">
                  <span className="font-medium">Input:</span>
                  <code className="text-editor-accent">{example.input}</code>
                  <span className="font-medium">Output:</span>
                  <code className="text-editor-accent">{example.output}</code>
                  {example.explanation && (
                    <>
                      <span className="font-medium">Explanation:</span>
                      <p>{example.explanation}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {problem.constraints && (
          <div>
            <h3 className="text-md font-medium text-white mb-2">Constraints:</h3>
            <ul className="list-disc list-inside text-sm text-editor-text space-y-1 pl-1">
              {problem.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProblemDescription;
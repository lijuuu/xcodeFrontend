import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
function Output({ className }: { className?: string }) {
  const { loading, result } = useSelector((state: any) => state.app);

  return (
    <div className={cn("col-span-1 md:col-span-4 h-[calc(80vh-64px)] bg-background/60", className)}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-2 bg-dark-100 rounded-md shadow-md">
          <h2 className="text-base font-semibold mb-2 md:mb-0">Output</h2>
          <div className="flex flex-row items-center">
            {result.execution_time && (
              <div className="bg-yellow-200 text-black px-3 py-1 rounded-md text-sm mr-2">
                Time: {result.execution_time}
              </div>
            )}
            <div className="flex justify-center items-center">
              {result.success ? (
                <span className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">Success</span>
              ) : !result.success && result.status_message ? (
                <span className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">Error</span>
              ) : null}
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4 bg-muted rounded-md border">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center h-full"
              >
                <div className="text-muted-foreground">Running your code...</div>
              </motion.div>
            ) : result.success ? (
              result.output ? (
                <motion.pre
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-mono whitespace-pre-wrap text-foreground"
                >
                  <p>{result.output}</p>
                </motion.pre>
              ) : (
                <motion.div
                  key="no-output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center items-center h-full text-muted-foreground"
                >
                  <p>No output available.</p>
                </motion.div>
              )
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center items-center h-full text-red-400"
              >
                <p>{result.output || 'An error occurred.'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
}

export default Output;
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RootState } from '@/redux/store'; 

function Output({ className }: { className?: string }) {
  const { loading, result } = useSelector((state: RootState) => state.xCodeCompiler);

  return (
    <div className={cn('h-full bg-background', className)}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-2 bg-muted/20 rounded-md border border-border/50">
          <h2 className="text-base font-semibold text-foreground mb-2 md:mb-0">Output</h2>
          <div className="flex flex-row items-center gap-2">
            {result.execution_time && (
              <div className="bg-yellow-200/20 text-yellow-600 px-3 py-1 rounded-md text-sm border border-yellow-600/20">
                Time: {result.execution_time}
              </div>
            )}
            <div className="flex justify-center items-center">
              {result.success === true ? (
                <span className="bg-green-500/20 text-green-600 px-3 py-1 rounded-md text-sm border border-green-600/20">
                  Success
                </span>
              ) : result.success === false && (result.status_message || result.error) ? (
                <span className="bg-red-500/20 text-red-600 px-3 py-1 rounded-md text-sm border border-red-600/20">
                  Error
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4 bg-muted/20 rounded-md border border-border/50">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start h-full"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className="w-[150px] h-[20px] mb-2 rounded-full bg-muted" />
                  <Skeleton className="w-[100px] h-[20px] mb-2 rounded-full bg-muted" />
                  <Skeleton className="w-[170px] h-[20px] rounded-full bg-muted" />
                </div>
              </motion.div>
            ) : result.success === true ? (
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
            ) : result.success === false && (result.status_message || result.error) ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center items-center h-full text-red-400"
              >
                <p>{result.output || result.status_message || result.error || 'An error occurred.'}</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center items-center h-full text-muted-foreground"
              >
                <p>No result yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <ScrollBar className="w-2" orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}

export default Output;
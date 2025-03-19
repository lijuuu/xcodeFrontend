import React, { useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RootState } from '@/redux/store';
import { Copy, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

// Define the result type based on expected structure
interface CompilerResult {
  success?: boolean;
  output?: string;
  status_message?: string;
  error?: string;
  execution_time?: string;
}

// Define props interface
interface OutputProps {
  className?: string;
}

function Output({ className }: OutputProps) {
  const { loading, result } = useSelector((state: RootState) => state.xCodeCompiler) as {
    loading: boolean;
    result: CompilerResult;
  };
  const [copied, setCopied] = useState(false);
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);

  const handleCopy = async () => {
    const textToCopy = result.output || result.status_message || result.error || '';
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Enhanced error/output formatting
  const formatOutput = (text: string | undefined, type: 'output' | 'error' | 'status') => {
    if (!text) return null;
    const lines = text.split('\n').filter((line) => line.trim());
    return lines.map((line, index) => (
      <div
        key={index}
        className={cn(
          'py-1',
          type === 'error' && 'text-red-400',
          type === 'status' && 'text-yellow-400',
          type === 'output' && 'text-red-400'
        )}
      >
        {line}
      </div>
    ));
  };

  // Determine if content is long enough to warrant collapsing
  const isLongContent = (text: string | undefined) => (text?.split('\n').length || 0) > 5;

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
            {(result.output || result.status_message || result.error) && (
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-muted/30 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
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
                <div className="w-full space-y-2">
                  <Skeleton className="w-3/4 h-4 rounded-full bg-muted animate-pulse" />
                  <Skeleton className="w-1/2 h-4 rounded-full bg-muted animate-pulse delay-200" />
                  <Skeleton className="w-2/3 h-4 rounded-full bg-muted animate-pulse delay-400" />
                </div>
              </motion.div>
            ) : result.success === true ? (
              result.output ? (
                <motion.div
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-mono whitespace-pre-wrap"
                >
                  {formatOutput(result.output, 'output')}
                </motion.div>
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
                className="text-sm font-mono"
              >
                <div className="space-y-2">
                  {result.status_message && (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-semibold">Status Message:</span>
                        {isLongContent(result.status_message) && (
                          <button
                            onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isErrorExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      {(isErrorExpanded || !isLongContent(result.status_message)) && (
                        <div className="pl-4">{formatOutput(result.status_message, 'status')}</div>
                      )}
                    </div>
                  )}
                  {result.error && (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-semibold">Error:</span>
                        {isLongContent(result.error) && (
                          <button
                            onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isErrorExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      {(isErrorExpanded || !isLongContent(result.error)) && (
                        <div className="pl-4 border-l-4 border-red-500">
                          {formatOutput(result.error, 'error')}
                        </div>
                      )}
                    </div>
                  )}
                  {result.output && (
                    <div>
                      <span className="text-foreground font-semibold">Output:</span>
                      <div className="pl-4">{formatOutput(result.output, 'output')}</div>
                    </div>
                  )}
                </div>
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
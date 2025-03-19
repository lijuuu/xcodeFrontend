import React, { useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RootState } from '@/redux/store';
import { Copy, CheckCheck, ChevronDown, ChevronUp, LightbulbIcon } from 'lucide-react';
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
  
  // Get code, language and file info from Redux store
  const { code, language, files, currentFile } = useSelector(
    (state: RootState) => state.xCodeCompiler
  );
  
  const [copied, setCopied] = useState(false);
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);
  const [hints, setHints] = useState<string | null>(null);
  const [loadingHints, setLoadingHints] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintsMinimized, setHintsMinimized] = useState(false);

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

  const fetchHints = async () => {
    setLoadingHints(true);
    setShowHints(true);
    setHintsMinimized(false);
    
    try {
      // Format the prompt with context about the code and error if any
      const errorContext = result.error || result.status_message || '';
      
      // Using the correct Gemini API endpoint and payload structure
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyATP4kvlgboNEPOz60PtvgeqrLurYO6AoM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { 
                  text: `As a coding assistant, please provide 3 concise hints to improve or fix this ${language} code:
                  \`\`\`${language}
                  ${code}
                  \`\`\`
                  
                  ${errorContext ? `The code has the following error: ${errorContext}` : ''}
                  
                  Provide logical answer straight forward and tell me the exact code that I need to fix or replace within few lines`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 256,
          },
          safetySettings: []
        })
      });
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        setHints(data.candidates[0].content.parts[0].text);
      } else {
        setHints("Could not generate hints at this time. Please try again later.");
      }
    } catch (error) {
      setHints("Error fetching hints. Please check your API key and try again.");
      console.error("Error fetching hints:", error);
    } finally {
      setLoadingHints(false);
    }
  };

  const toggleHints = () => {
    setHintsMinimized(!hintsMinimized);
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
          type === 'output' && 'text-gray-400'
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
            <button
              onClick={fetchHints}
              disabled={loadingHints || !code}
              className={cn(
                "px-3 py-1 rounded-md text-sm border flex items-center gap-1 transition-colors",
                loadingHints ? "bg-yellow-200/10 text-yellow-600/50 border-yellow-600/10" : 
                "bg-blue-500/20 text-blue-600 border-blue-600/20 hover:bg-blue-500/30"
              )}
              title="Get code suggestions using Gemini"
            >
              <LightbulbIcon className="h-4 w-4" />
              {loadingHints ? "Loading..." : "Suggest Hints"}
            </button>
            
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
            {result.execution_time && (
              <div className="bg-yellow-200/20 text-yellow-600 px-3 py-1 rounded-md text-sm border border-yellow-600/20">
                Time: {result.execution_time?.split('.')[0]} ms
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
        
        {/* Hints section that appears when hints are available */}
        <AnimatePresence>
          {showHints && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: 1, 
                height: hintsMinimized ? '40px' : 'auto' 
              }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 bg-blue-500/10 rounded-md border border-blue-500/20">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                    <LightbulbIcon className="h-4 w-4" />
                    Code Hints
                  </h3>
                  <button 
                    onClick={toggleHints}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {hintsMinimized ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {loadingHints ? (
                  <div className="space-y-2">
                    <Skeleton className="w-full h-4 rounded-full bg-blue-200/30 animate-pulse" />
                    <Skeleton className="w-3/4 h-4 rounded-full bg-blue-200/30 animate-pulse" />
                    <Skeleton className="w-1/2 h-4 rounded-full bg-blue-200/30 animate-pulse" />
                  </div>
                ) : (
                  <div className={cn(
                    "text-md text-zinc-200 whitespace-pre-line",
                    hintsMinimized ? "line-clamp-1" : "overflow-auto max-h-96"
                  )}>
                    {hints}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <ScrollArea className="flex-1 p-4 bg-muted/20 rounded-md border border-border/50 overflow-auto">
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
                  className="text-sm font-mono whitespace-pre-wrap overflow-auto"
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
                className="text-sm font-mono overflow-auto"
              >
                <div className="space-y-2">
                  {result.status_message && (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-semibold">Status:</span>
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
                        <div className="pl-4 overflow-auto">{formatOutput(result.status_message, 'status')}</div>
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
                        <div className="pl-4 border-l-4 border-red-500 overflow-auto">
                          {formatOutput(result.error, 'error')}
                        </div>
                      )}
                    </div>
                  )}
                  {!result.success ? (
                    <div>
                      <div className="pl-4 overflow-auto">{formatOutput(result.output?.replaceAll("/app/temp/code", "main"), 'error')}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="pl-4 overflow-auto">{formatOutput(result.output, 'output')}</div>
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
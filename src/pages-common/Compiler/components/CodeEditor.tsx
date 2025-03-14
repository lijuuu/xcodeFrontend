// CodeEditor.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { File } from '@/pages-common/Compiler/CompilerPage';
import { Download, Minus, PlayIcon, Plus, Copy, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { setCode } from '@/redux/xCodeCompiler';
import { useTheme } from '@/hooks/theme-provider';
import { cn } from '@/lib/utils';
import { languages } from '@/pages-common/Compiler/CompilerPage';
import { RootState } from '@/redux/store';
import { AppDispatch } from '@/redux/store';
import { runCode } from '@/redux/xCodeCompiler';
import { toast } from 'sonner';

const CodeEditor: React.FC<{ className?: string, isMobile: boolean }> = ({ className, isMobile }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { code, language, files, currentFile } = useSelector(
    (state: RootState) => state.xCodeCompiler
  );

  const handleRun = () => {
    const reqLang = languages.find((lang) => lang.value === language)?.req || '';
    dispatch(runCode({ code, reqLang }));
  };

  const handleDownload = () => {
    const currentLang = languages.find(l => l.value === language);
    const extension = currentLang?.file || 'txt';
    const filename = `code.${extension}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className={cn("w-full h-full flex flex-col p-4 bg-background", className)}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-foreground">
          {currentFile ? files.find((f: File) => f.id === currentFile)?.name || 'Editor' : 'Editor'}
        </div>
        <div className="flex space-x-2">
          {
            !isMobile && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize(fontSize + 1)}
                  className="border-border/50 hover:bg-muted"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Increase Font Size
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize(fontSize - 1)}
                  className="border-border/50 hover:bg-muted"
                >
                  <Minus className="h-3.5 w-3.5 mr-1" />
                  Decrease Font Size
                </Button>
              </>
            )
          }
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-border/50 hover:bg-muted"
          >
            {copied ? (
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1" />
            )}
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="border-border/50 hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
          <Button
            onClick={handleRun}
            disabled={!code.trim()}
            size="sm"
            className="gap-1 bg-primary hover:bg-primary/90"
          >
            <PlayIcon className="h-3.5 w-3.5" />
            <span>Run</span>
          </Button>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 rounded-md overflow-hidden border border-border/50"
      >
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => dispatch(setCode(value || ''))}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: fontSize,
            lineNumbers: 'on',
            padding: { top: 10 },
            scrollBeyondLastLine: false,
          }}
          loading={<div className="bg-background w-full h-full" />}
        />
      </motion.div>
    </div>
  );
}

export default CodeEditor;
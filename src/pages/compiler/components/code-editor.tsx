import React from 'react';
import { Button } from '@/components/ui/button';
import { File } from '@/pages/compiler/compiler-main';
import { SaveIcon, PlayIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { handleRequest, saveCurrentFile } from '@/pages/compiler/utils/req';
import { setCode } from '@/pages/compiler/redux/actions';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

function CodeEditor({ className }: { className?: string }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { code, language, files, currentFile } = useSelector((state: any) => state.app);

  const handleRun = () => {
    handleRequest(dispatch, code, language);
  };

  const handleSave = () => {
    saveCurrentFile(dispatch, currentFile, code, files);
  };

  return (
    <div className={cn("col-span-1 md:col-span-7 w-full h-full flex flex-col p-1", className)}>
      <div className="flex justify-between items-center mb-">
        <div className="text-sm font-medium">
          {currentFile ? files.find((f: File) => f.id === currentFile)?.name || 'Editor' : 'Editor'}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={!currentFile}>
            <SaveIcon className="h-3.5 w-3.5 mr-1" />
            Save
          </Button>
          <Button onClick={handleRun} disabled={!code.trim()} size="sm" className="gap-1">
            <PlayIcon className="h-3.5 w-3.5" />
            <span>Run</span>
          </Button>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="relative flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => dispatch(setCode(value || ''))}
          options={{
            theme: theme === 'dark' ? 'vs-dark' : 'vs',
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
          }}
        />
      </motion.div>
    </div>
  );
}

export default CodeEditor;
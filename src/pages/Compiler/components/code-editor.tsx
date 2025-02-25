import React from 'react';
import { Button } from '@/components/ui/button';
import { File } from '@/pages/Compiler/compiler-main';
import { SaveIcon, PlayIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { setCode } from '@/pages/Compiler/redux/slice';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { languages } from '@/pages/Compiler/compiler-main';
import { RootState } from '../redux/store';
import { AppDispatch } from '../redux/store';
import { runCode, saveCurrentFile } from '../redux/slice';

const CodeEditor: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { code, language, files, currentFile } = useSelector(
    (state: RootState) => state.xCode
  );

  const handleRun = () => {
    const reqLang = languages.find((lang) => lang.value === language)?.req || '';
    dispatch(runCode({ code, reqLang }));
  };

  const handleSave = () => {
    if (currentFile) {
      dispatch(saveCurrentFile({ currentFile, code }));
    }
  };

  return (
    <div className={cn("col-span-1 md:col-span-7 w-full h-full flex flex-col p-4", className)}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {currentFile ? files.find((f: File) => f.id === currentFile)?.name || 'Editor' : 'Editor'}
        </div>
        <div className="flex space-x-2 mb-2">
          <Button variant="outline" size="sm" onClick={handleSave} >
            <SaveIcon className="h-3.5 w-3.5 mr-1" />
            Save
          </Button>
          <Button onClick={handleRun} disabled={!code.trim()} size="sm" className="gap-1">
            <PlayIcon className="h-3.5 w-3.5" />
            <span>Run</span>
          </Button>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex-1">
        <Editor
          className='w-full h-full bg-black'
          height="100%"
          language={language}
          value={code}
          onChange={(value) => dispatch(setCode(value || ''))}
          options={{
            theme: theme === 'dark' ? 'vs-dark' : 'light',
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
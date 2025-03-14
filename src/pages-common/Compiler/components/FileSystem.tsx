// src/components/FileSystem.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FileIcon, PlusIcon, TrashIcon, Edit2Icon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { File } from '@/pages-common/Compiler/CompilerPage';
import { RootState, AppDispatch } from '@/redux/store';
import {
  setCode,
  setFiles,
  setCurrentFile,
  setNewFileName,
  setRenaming,
} from '@/redux/xCodeCompiler';

const FileSystem: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { code, language, file, files, currentFile } = useSelector(
    (state: RootState) => state.xCodeCompiler
  );
  const [nameError, setNameError] = useState('');
  const [isRenaming, setIsRenamingLocal] = useState(false);
  const [newFileName, setNewFileNameLocal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadFilesFromLocalStorage = () => {
      try {
        const storedFiles = localStorage.getItem('xcode-files');
        if (storedFiles) {
          const parsedFiles: File[] = JSON.parse(storedFiles);
          if (Array.isArray(parsedFiles)) {
            dispatch(setFiles(parsedFiles));
            if (parsedFiles.length > 0 && currentFile === null) {
              const sortedFiles = [...parsedFiles].sort(
                (a, b) =>
                  new Date(b.lastModified).getTime() -
                  new Date(a.lastModified).getTime()
              );
              dispatch(setCurrentFile(sortedFiles[0].id));
            }
          }
        }
      } catch (error) {
        console.error('Error loading files from localStorage:', error);
      }
    };
    loadFilesFromLocalStorage();
  }, [dispatch, currentFile]);

  const getPlaceholder = (language: string): string => {
    switch (language) {
      case 'js':
        return "console.log('Hello, world!');";
      case 'python':
        return "print('Hello, world!')";
      case 'go':
        return 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, world!")\n}';
      case 'cpp':
        return '#include <iostream>\n\nint main() {\n  std::cout << "Hello, world!" << std::endl;\n  return 0;\n}';
      default:
        return '// Type your code here';
    }
  };

  const createNewFile = () => {
    const newId = Date.now().toString();
    const newFile: File = {
      id: newId,
      name: `NewFile${files.length + 1}.${file}`,
      language,
      content: files.length === 0 ? code : getPlaceholder(language),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    const updatedFiles = [...files, newFile];
    dispatch(setFiles(updatedFiles)); // This already updates localStorage via the reducer
    dispatch(setCurrentFile(newId));
    dispatch(setCode(newFile.content));
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter((f: File) => f.id !== id);
    dispatch(setFiles(updatedFiles)); // This already updates localStorage via the reducer
    if (currentFile === id) {
      if (updatedFiles.length > 0) {
        dispatch(setCurrentFile(updatedFiles[0].id));
        dispatch(setCode(updatedFiles[0].content));
      } else {
        dispatch(setCurrentFile(null));
        dispatch(setCode(''));
      }
    }
  };

  const startRenameFile = (id: string) => {
    const file = files.find((f: File) => f.id === id);
    if (file) {
      setNewFileNameLocal(file.name);
      dispatch(setRenaming(true));
      setIsRenamingLocal(true);
    }
  };

  const completeRename = () => {
    if (!newFileName.trim() || !currentFile) {
      if (newFileName.trim() === '') {
        setNameError('File name cannot be empty');
        return;
      }
      return;
    }
    const updatedFiles = files.map((file: File) =>
      file.id === currentFile
        ? { ...file, name: newFileName, lastModified: new Date().toISOString() }
        : file
    );
    dispatch(setFiles(updatedFiles)); // This already updates localStorage via the reducer
    dispatch(setRenaming(false));
    setIsRenamingLocal(false);
  };

  const setCurrentFileFn = (id: string) => {
    dispatch(setCurrentFile(id)); // This updates code and language via the reducer
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewFileNameLocal(value);
    dispatch(setNewFileName(value));
    if (value.length > 15) {
      setErrorMessage('File name cannot be longer than 15 characters');
    } else {
      setErrorMessage('');
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" className="bg-muted/20 text-foreground border-r border-border/50">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between p-2">
            <SidebarGroupLabel className="text-lg font-semibold">Files</SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewFile}
              className="hover:bg-muted rounded-full"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground mb-2 ml-2 block">Ctrl+B to Hide/Unhide</span>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(90vh-130px)]">
              <AnimatePresence>
                {files.length > 0 ? (
                  files.map((file: File) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.2 }}
                      className={`group flex items-center justify-between p-2 rounded text-sm cursor-pointer hover:bg-muted ${currentFile === file.id ? 'bg-muted/50' : ''}`}
                      onClick={() => setCurrentFileFn(file.id)}
                    >
                      <div className="flex items-center">
                        <FileIcon className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-muted/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            startRenameFile(file.id);
                          }}
                        >
                          <Edit2Icon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-muted/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-center py-4 text-xs">
                    No files yet. Create a new file to get started.
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Dialog open={isRenaming} onOpenChange={(open) => !open && dispatch(setRenaming(false))}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 text-foreground">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={handleFileNameChange}
              placeholder="Enter new filename"
              className="w-full bg-muted border-border/50 text-foreground placeholder-muted-foreground"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && completeRename()}
            />
          </div>
          {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenamingLocal(false)}
              className="border-border/50 text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button onClick={completeRename} className="bg-primary hover:bg-primary/90">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default FileSystem;
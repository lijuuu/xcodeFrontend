import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileIcon, PlusIcon, TrashIcon, Edit2Icon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setCode, setFiles, setCurrentFile, setNewFileName } from '@/pages/Compiler/redux/actions';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { File } from '@/pages/Compiler/compiler-main';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function FileSystem() {
  const dispatch = useDispatch();
  const { language, file, files, currentFile } = useSelector((state: any) => state.app);

  const [nameError, setNameError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load filesystem from localStorage on initial render
  useEffect(() => {
    const loadFilesFromLocalStorage = () => {
      try {
        const storedFiles = localStorage.getItem('xcode-files');
        if (storedFiles) {
          const parsedFiles: File[] = JSON.parse(storedFiles);
          if (Array.isArray(parsedFiles)) {
            dispatch(setFiles(parsedFiles));
            if (parsedFiles.length > 0 && currentFile === null) {
              const sortedFiles = [...parsedFiles].sort((a, b) =>
                new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
              );
              dispatch(setCurrentFile(sortedFiles[0].id));
            }
          }
        }
      } catch (error) {
        console.error("Error loading files from localStorage:", error);
      }
    };

    loadFilesFromLocalStorage();
  }, [dispatch, currentFile]);

  const createNewFile = () => {
    const newId = Date.now().toString();
    const newFile = {
      id: newId,
      name: `NewFile${files.length + 1}.${file}`, // Default to JavaScript
      language: language,
      content: getPlaceholder(language),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const updatedFiles = [...files, newFile];
    dispatch(setFiles(updatedFiles));
    localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));
    dispatch(setCurrentFile(newId));
    dispatch(setCode(newFile.content));
  };

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
        return "// Type your code here";
    }
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter((file: File) => file.id !== id);
    dispatch(setFiles(updatedFiles));
    localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));

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
      setNewFileName(file.name);
      setIsRenaming(true);
    }
  };

  const completeRename = () => {
    if (!newFileName.trim() || !currentFile) {
      if (newFileName.trim() === '') {
        setNameError('File name cannot be empty');
        return;
      }
    }

    const updatedFiles = files.map((file: File) =>
      file.id === currentFile
        ? { ...file, name: newFileName, lastModified: new Date().toISOString() }
        : file
    );

    dispatch(setFiles(updatedFiles));
    localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));
    setIsRenaming(false);
  };

  const setCurrentFileFn = (id: string) => {
    const file = files.find((f: File) => f.id === id);
    if (file) {
      dispatch(setCode(file.content));
      dispatch(setCurrentFile(id));
    }
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewFileName(value);

    // Check the length in real-time
    if (value.length > 15) {
      setErrorMessage('File name cannot be longer than 15 characters');
    } else {
      setErrorMessage(''); // Clear error message if valid
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" className="bg-gray-900 text-white ">
      <SidebarContent >
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">Files</SidebarGroupLabel>
          <span className="text-xs text-gray-400 mb-2 ml-2">Ctrl+B to Hide/Unhide</span>
          <Button variant="ghost" size="icon" onClick={createNewFile} className="hover:bg-gray-700">
            <PlusIcon className="h-4 w-4" />
          </Button>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(90vh-130px)] overflow-x-hidden overflow-y-auto">
              <AnimatePresence>
                {files.length > 0 ? (
                  files.map((file: File) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.2 }}
                      className={`group flex items-center justify-between p-2 rounded text-sm cursor-pointer hover:bg-gray-700 ${currentFile === file.id ? 'bg-gray-600' : ''}`}
                      onClick={() => setCurrentFileFn(file.id)}
                    >
                      <div className="flex items-center">
                        <FileIcon className="h-4 w-4 mr-2 " />
                        <span className=" text-xs w-12">{file.name}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); startRenameFile(file.id); }}>
                          <Edit2Icon className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}>
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4 text-xs">
                    No files yet. Create a new file to get started.
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={(open) => !open && setIsRenaming(false)}>
        <DialogContent className="sm:max-w-md bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={handleFileNameChange}
              placeholder="Enter new filename"
              className="w-full bg-gray-700 text-white placeholder-gray-400"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && completeRename()}
            />
          </div>
          {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenaming(false)} className="border-gray-600 text-gray-400 hover:bg-gray-700">
              Cancel
            </Button>
            <Button onClick={completeRename} className="bg-gray-600 hover:bg-gray-500">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}

export default FileSystem;
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileIcon, PlusIcon, TrashIcon, Edit2Icon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setCode, setFiles, setCurrentFile, setRenaming, setNewFileName } from '@/pages/compiler/redux/actions';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { File } from '@/pages/compiler/compiler-main';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function FileSystem() {
  const dispatch = useDispatch();
  const { files, currentFile, newFileName, isRenaming } = useSelector((state: any) => state.app);

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
      name: `NewFile${files.length + 1}.js`, // Default to JavaScript
      language: 'js',
      content: getPlaceholder('js'),
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
      dispatch(setNewFileName(file.name));
      dispatch(setRenaming(true));
    }
  };

  const completeRename = () => {
    if (!newFileName.trim() || !currentFile) {
      dispatch(setRenaming(false));
      return;
    }

    const updatedFiles = files.map((file: File) =>
      file.id === currentFile
        ? { ...file, name: newFileName, lastModified: new Date().toISOString() }
        : file
    );

    dispatch(setFiles(updatedFiles));
    localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));
    dispatch(setRenaming(false));
  };

  const setCurrentFileFn = (id: string) => {
    const file = files.find((f: File) => f.id === id);
    if (file) {
      dispatch(setCode(file.content));
      dispatch(setCurrentFile(id));
    }
  };

  return (
    <Sidebar >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">Files</SidebarGroupLabel>
          <Button variant="ghost" size="icon" onClick={createNewFile}>
            <PlusIcon className="h-4 w-4" />
          </Button>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(90vh-130px)]">
              <AnimatePresence>
                {files.map((file: File) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex items-center justify-between p-2 rounded text-sm cursor-pointer hover:bg-accent ${currentFile === file.id ? 'bg-muted' : ''}`}
                    onClick={() => setCurrentFileFn(file.id)}
                  >
                    <div className="flex items-center overflow-hidden">
                      <FileIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); startRenameFile(file.id); }}>
                        <Edit2Icon className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}>
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {files.length === 0 && (
                <div className="text-muted-foreground text-center py-4 text-xs">
                  No files yet. Create a new file to get started.
                </div>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={(open) => !open && dispatch(setRenaming(false))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => dispatch(setNewFileName(e.target.value))}
              placeholder="Enter new filename"
              className="w-full"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && completeRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch(setRenaming(false))}>
              Cancel
            </Button>
            <Button onClick={completeRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}

export default FileSystem;
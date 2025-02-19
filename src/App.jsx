import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from './components/theme-provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  FileIcon,
  SaveIcon,
  PlusIcon,
  PlayIcon,
  TrashIcon,
  SettingsIcon,
  CodeIcon,
  Edit2Icon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function App() {
  const [code, setCode] = useState('');
  const [data, setData] = useState({});
  const [language, setLanguage] = useState("js");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [files, setFiles] = useState(() => {
    const storedFiles = localStorage.getItem('xcode-files');
    return storedFiles ? JSON.parse(storedFiles) : [];
  });
  const [currentFile, setCurrentFile] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [fileToRename, setFileToRename] = useState(null);
  const { theme, setTheme } = useTheme();

  const previousFileRef = useRef(currentFile); // Ref to track previous currentFile

  const languages = [
    { value: 'js', label: 'JavaScript', icon: '📜' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'go', label: 'Go', icon: '🔄' },
    { value: 'cpp', label: 'C++', icon: '⚙️' }
  ];

  // Load filesystem from localStorage on initial render
  useEffect(() => {
    const loadFilesFromLocalStorage = () => {
      try {
        const storedFiles = localStorage.getItem('xcode-files');
        if (storedFiles) {
          const parsedFiles = JSON.parse(storedFiles);
          if (Array.isArray(parsedFiles)) {
            setFiles(parsedFiles);
            if (parsedFiles.length > 0) {
              const sortedFiles = [...parsedFiles].sort((a, b) =>
                new Date(b.lastModified) - new Date(a.lastModified)
              );
              setCurrentFile(sortedFiles[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Error loading files from localStorage:", error);
      }
    };

    loadFilesFromLocalStorage();
  }, []);

  // Save current file to localStorage immediately on code change
  useEffect(() => {
    if (currentFile) {
      const updatedFiles = files.map(file =>
        file.id === currentFile
          ? { ...file, content: code, language, lastModified: new Date().toISOString() }
          : file
      );

      // Only update state if there are changes
      if (JSON.stringify(updatedFiles) !== JSON.stringify(files)) {
        setFiles(updatedFiles);
        localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));
      }
    }
  }, [code, currentFile]);

  // Load file content when changing files
  useEffect(() => {
    if (currentFile && currentFile !== previousFileRef.current) {
      const file = files.find(f => f.id === currentFile);
      if (file) {
        setCode(file.content);
        setLanguage(file.language);
      }
      previousFileRef.current = currentFile; // Update the ref to the current file
    }
  }, [currentFile, files]);

  const handleRequest = async () => {
    try {
      setLoading(true);
      setOutput('');

      const response = await axios.post('https://xengine.lijuu.me/execute', {
        code: btoa(code),
        language: language,
      });

      setData(response.data);
      setOutput(JSON.stringify(response.data, null, 2));

      // Automatically save the executed code
      if (currentFile) {
        saveCurrentFile();
      }
    } catch (error) {
      if (error.response) {
        setOutput(`Error: ${error.response.data.output || 'Unknown error'}`);
      } else {
        setOutput('Execution failed. Please check your code or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new file with default content
  const createNewFile = () => {
    const newId = Date.now().toString();
    const newFile = {
      id: newId,
      name: `NewFile${files.length + 1}.${getFileExtension()}`,
      language: language,
      content: getPlaceholder(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setFiles(prevFiles => [...prevFiles, newFile]);
    setCurrentFile(newId);
    setCode(newFile.content);

    // Save to localStorage immediately
    localStorage.setItem('xcode-files', JSON.stringify([...files, newFile]));
  };

  const getFileExtension = () => {
    switch (language) {
      case 'js': return 'js';
      case 'python': return 'py';
      case 'go': return 'go';
      case 'cpp': return 'cpp';
      default: return 'txt';
    }
  };

  const saveCurrentFile = () => {
    if (!currentFile) return;

    const updatedFiles = files.map(file =>
      file.id === currentFile
        ? { ...file, content: code, language, lastModified: new Date().toISOString() }
        : file
    );

    setFiles(updatedFiles);

    // Save to localStorage immediately
    localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));

    // Show a save notification animation
    const saveNotification = document.getElementById('save-notification');
    if (saveNotification) {
      saveNotification.classList.add('opacity-100');
      setTimeout(() => {
        saveNotification.classList.remove('opacity-100');
      }, 1500);
    }
  };

  const deleteFile = (id) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);

    // Save to localStorage immediately
    localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));

    if (currentFile === id) {
      if (updatedFiles.length > 0) {
        // Select another file if available
        setCurrentFile(updatedFiles[0].id);
        setCode(updatedFiles[0].content);
        setLanguage(updatedFiles[0].language);
      } else {
        // No files left
        setCurrentFile(null);
        setCode('');
      }
    }
  };

  const startRenameFile = (id) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setFileToRename(id);
      setNewFileName(file.name);
      setIsRenaming(true);
    }
  };

  const completeRename = () => {
    if (!newFileName.trim() || !fileToRename) {
      setIsRenaming(false);
      return;
    }

    const updatedFiles = files.map(file =>
      file.id === fileToRename
        ? { ...file, name: newFileName, lastModified: new Date().toISOString() }
        : file
    );

    setFiles(updatedFiles);

    // Save to localStorage immediately
    localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));

    setIsRenaming(false);
    setFileToRename(null);
    setNewFileName('');
  };

  const getPlaceholder = () => {
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

  const setCurrentFileFn = (id) => {
    if (currentFile) {
      const updatedFiles = files.map(file =>
        file.id === currentFile
          ? { ...file, content: code, language, lastModified: new Date().toISOString() }
          : file
      );

      // Check if updatedFiles is different from files to avoid unnecessary updates
      if (JSON.stringify(updatedFiles) !== JSON.stringify(files)) {
        setFiles(updatedFiles);
        localStorage.setItem('xcode-files', JSON.stringify(updatedFiles));
      }
    }

    const file = files.find(f => f.id === id);
    if (file) {
      setCode(file.content);
      setLanguage(file.language);
      setCurrentFile(id);
    }
  };

  const containerRef = useRef(null);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 p-4">
      <Card className="h-[90vh] max-w-full mx-auto shadow-lg overflow-hidden border">
        <CardHeader className="bg-muted p-4 flex flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <CodeIcon className="h-5 w-5" />
            <CardTitle className="text-2xl font-bold"> xcode</CardTitle>
          </div>

          <div className="flex items-center gap-4">
            <Tabs>
              <TabsList>
                {languages.map((lang) => (
                  <TabsTrigger
                    key={lang.value}
                    value={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={cn(
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      "hover:bg-muted/50"
                    )}
                  >
                    <span className="mr-1">{lang.icon}</span> {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 h-[calc(90vh-64px)]">
          {/* File Explorer - hidden on mobile */}
          <div className="col-span-1 md:col-span-2 border-r md:border-r-0 hidden md:block">
            <div className="p-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Files</h3>
                <Button variant="ghost" size="icon" onClick={createNewFile}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(90vh-130px)]">
                <AnimatePresence>
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.2 }}
                      className={`group flex items-center justify-between p-2 rounded text-sm cursor-pointer hover:bg-accent ${currentFile === file.id ? 'bg-muted' : ''
                        }`}
                      onClick={() => setCurrentFileFn(file.id)}
                    >
                      <div className="flex items-center overflow-hidden">
                        <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
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
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                        >
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
            </div>
          </div>

          {/* Code Editor - full width on mobile */}
          <div className="col-span-1 md:col-span-5 h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">
                {currentFile ? (
                  files.find(f => f.id === currentFile)?.name || 'Editor'
                ) : 'Editor'}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCurrentFile}
                  disabled={!currentFile}
                >
                  <SaveIcon className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={handleRequest}
                  disabled={loading || !code.trim()}
                  size="sm"
                  className="gap-1"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Running</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-3.5 w-3.5" />
                      <span>Run</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative flex-1"
            >
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={getPlaceholder()}
                className="h-full w-full p-4 bg-muted/30 text-foreground font-mono text-sm rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <div
                id="save-notification"
                className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded opacity-0 transition-opacity duration-300"
              >
                Saved
              </div>
            </motion.div>
          </div>

          {/* Output Panel - full width on mobile */}
          <div className="col-span-1 md:col-span-5 h-full bg-background/60">
            <div className="p-4 h-full flex flex-col">
              <h2 className="text-sm font-medium mb-2">Output</h2>
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
                  ) : output ? (
                    <motion.pre
                      key="output"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-mono whitespace-pre-wrap text-foreground"
                    >
                      {output}
                    </motion.pre>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground italic flex flex-col items-center justify-center h-full"
                    >
                      <CodeIcon className="h-12 w-12 mb-2 opacity-20" />
                      <div>Run your code to see the output here</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-2 text-xs text-muted-foreground border-t">
          <div className="flex justify-between items-center">
            <div>
              {currentFile && files.find(f => f.id === currentFile) && (
                <span>
                  Last modified: {new Date(files.find(f => f.id === currentFile).lastModified).toLocaleString()}
                </span>
              )}
            </div>
            <div>
              Files: {files.length} | Language: {languages.find(l => l.value === language)?.label}
            </div>
          </div>
        </div>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={(open) => !open && setIsRenaming(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new filename"
              className="w-full"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && completeRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenaming(false)}>
              Cancel
            </Button>
            <Button onClick={completeRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default App;
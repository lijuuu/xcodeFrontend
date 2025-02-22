import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsIcon, CodeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDispatch, useSelector } from 'react-redux';
import { setCode, setLanguage } from '@/pages/compiler/redux/actions';
import { SidebarTrigger } from "@/components/ui/sidebar";
import Output from '@/pages/compiler/components/output';
import CodeEditor from '@/pages/compiler/components/code-editor';
import FileSystem from '@/pages/compiler/components/file-system';
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";

interface File {
  id: string;
  name: string;
  language: string;
  content: string;
  createdAt: string;
  lastModified: string;
}

interface Response {
  output?: string;
  status_message?: string;
  error?: string;
  success?: boolean;
  execution_time?: number;
}

function App() {
  const dispatch = useDispatch();
  const { language, files, currentFile } = useSelector((state: any) => state.app);
  const { setTheme } = useTheme();
  const previousFileRef = useRef<string | null>(currentFile);
  const filesRef = useRef(files);

  // Update filesRef when files change
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Languages supported by the xengine
  const languages = [
    { value: 'js', file: 'js', label: 'JavaScript', icon: '📜' },
    { value: 'python', file: 'py', label: 'Python', icon: '🐍' },
    { value: 'go', file: 'go', label: 'Go', icon: '🔄' },
    { value: 'cpp', file: 'cpp', label: 'C++', icon: '⚙️' }
  ];

  // Load file content when changing files
  useEffect(() => {
    if (currentFile && currentFile !== previousFileRef.current) {
      const file = files.find((f: File) => f.id === currentFile);
      if (file) {
        dispatch(setCode(file.content));
        dispatch(setLanguage(file.language));
      } else {
        // Reset to default if file is not found
        dispatch(setCode(''));
        dispatch(setLanguage('js'));
      }
      previousFileRef.current = currentFile; // Update the ref to the current file
    }
  }, [currentFile, files, dispatch]);

  return (
    <div className="max-h-screen bg-background transition-colors duration-300 p-2 w-full overflow-hidden">
      <Card className="flex-1 w-full shadow-lg border">
        <CardHeader className="bg-muted p-2 flex flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <CodeIcon className="h-5 w-5" />
            <CardTitle className="text-xl font-bold"> xcode <span className="text-xs text-muted-foreground"> -- building a better compiler</span></CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Tabs>
                <TabsList>
                  {languages.map((lang) => (
                    <TabsTrigger
                      key={lang.value}
                      value={lang.value}
                      onClick={() => dispatch(setLanguage(lang.value))}
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
            </div>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <span className="mr-1">{languages.find(l => l.value === language)?.icon}</span>
                    {languages.find(l => l.value === language)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem key={lang.value} onClick={() => dispatch(setLanguage(lang.value))}>
                      <span className="mr-1">{lang.icon}</span> {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
        <SidebarTrigger/>
        <ResizablePanelGroup direction="horizontal" className="h-[calc(90vh-64px)]">
          {/* File Explorer - Hidden on Mobile */}
          <ResizablePanel defaultSize={0} minSize={0} maxSize={0} className="hidden md:flex">
            <FileSystem />
          </ResizablePanel>
          <ResizableHandle />

          {/* Code Editor - Takes Main Space */}
          <ResizablePanel defaultSize={55} minSize={50} maxSize={Infinity} className="flex-grow">
            <CodeEditor />
          </ResizablePanel>

          <ResizableHandle />

          {/* Output Panel */}
          <ResizablePanel defaultSize={30} minSize={30} maxSize={60} >
            <Output />
          </ResizablePanel>
        </ResizablePanelGroup>

      </Card>
    </div>
  );
}

export type { File, Response };
export default App;
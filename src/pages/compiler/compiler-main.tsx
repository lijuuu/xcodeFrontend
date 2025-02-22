import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsIcon, CodeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDispatch, useSelector } from 'react-redux';
import { setCode, setCurrentFile, setFile, setFiles, setLanguage } from '@/pages/compiler/redux/actions';
import { SidebarTrigger } from "@/components/ui/sidebar";
import Output from '@/pages/compiler/components/output';
import CodeEditor from '@/pages/compiler/components/code-editor';

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


export const languages = [
  { value: 'javascript', file: 'js', req: 'js', label: 'JavaScript', icon: '📜' },
  { value: 'python', file: 'py', req: 'python', label: 'Python', icon: '🐍' },
  { value: 'go', file: 'go', req: 'go', label: 'Go', icon: '🔄' },
  { value: 'cpp', file: 'cpp', req: 'cpp', label: 'C++', icon: '⚙️' }
];

function CompilerMain() {
  const dispatch = useDispatch();
  const { language, files, currentFile } = useSelector((state: any) => state.app);
  const { setTheme } = useTheme();
  const previousFileRef = useRef<string | null>(currentFile);
  const filesRef = useRef(files);

  // Update filesRef when files change
  useEffect(() => {
    filesRef.current = files;
  }, [files]);



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
        dispatch(setLanguage('javascript'));
      }
      previousFileRef.current = currentFile;
    }
  }, [currentFile, files, dispatch]);

  useEffect(() => {
    if (files.length > 0 && currentFile === null) {
      const firstFile = files[0];
      dispatch(setCode(firstFile.content));
      dispatch(setCurrentFile(firstFile.id));
      dispatch(setLanguage(firstFile.language));
    }
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className=" bg-background transition-colors duration-300 p-2 w-full h-full ">
      <Card className="rounded-none flex-1 w-full shadow-lg ">
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
                      onClick={() => {
                        dispatch(setLanguage(lang.value))
                        dispatch(setFile(lang.file))
                      }}
                      className={cn(
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                        "hover:bg-muted/50",
                        { 'bg-primary text-primary-foreground': lang.value === language } // Set active state based on current language
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
      {/* Dynamically change ResizablePanelGroup layout */}
      <div className="flex flex-col md:flex-row h-[calc(95vh-64px)] ">
        {/* Sidebar / File Explorer */}
        {!isMobile && <div className="flex items-center justify-center border-none">
          <SidebarTrigger className="w-full h-full pl-3 pr-3 rounded-none" />
        </div>}

        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          {/* Code Editor */}
          <ResizablePanel defaultSize={isMobile ? 90 : 55} minSize={30} maxSize={80} className="flex-grow">
            <CodeEditor className="h-full " />
          </ResizablePanel>

          <ResizableHandle className="w-0.5 h-full bg-red-500" />

          {/* Output Panel moves down on mobile */}
          <ResizablePanel defaultSize={isMobile ? 0 : 30} minSize={isMobile ? 0 : 25} maxSize={80} className=" h-full md:w-[calc(30%)]">
            <Output className="h-full md:h-[calc(90vh-64px)]" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export type { File, Response };
export default CompilerMain;
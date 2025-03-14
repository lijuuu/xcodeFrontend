import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/theme-provider';
import { Button } from '@/components/ui/button';
import { Download, Settings, Code as CodeIcon, Menu, Maximize2, Minimize2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDispatch, useSelector } from 'react-redux';
import { setCode, setCurrentFile, setFile, setLanguage } from '@/redux/xCodeCompiler';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Output from '@/pages-common/Compiler/components/Output';
import CodeEditor from '@/pages-common/Compiler/components/CodeEditor';
import FileSystem from '@/pages-common/Compiler/components/FileSystem';
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { SiJavascript, SiPython, SiGo, SiCplusplus } from 'react-icons/si';

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
  {
    value: 'javascript',
    file: 'js',
    req: 'js',
    label: 'JavaScript',
    icon: <SiJavascript className="h-4 w-4 text-yellow-400" />
  },
  {
    value: 'python',
    file: 'py',
    req: 'python',
    label: 'Python',
    icon: <SiPython className="h-4 w-4 text-blue-400" />
  },
  {
    value: 'go',
    file: 'go',
    req: 'go',
    label: 'Go',
    icon: <SiGo className="h-4 w-4 text-cyan-400" />
  },
  {
    value: 'cpp',
    file: 'cpp',
    req: 'cpp',
    label: 'C++',
    icon: <SiCplusplus className="h-4 w-4 text-purple-400" />
  }
];

function OnlineCompilerPage() {
  const dispatch = useDispatch();
  const { language, files, currentFile, code } = useSelector((state: any) => state.xCodeCompiler);
  const { setTheme } = useTheme();
  const previousFileRef = useRef<string | null>(currentFile);
  const filesRef = useRef(files);
  const [isMobile, setIsMobile] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [panelLayout, setPanelLayout] = useState({
    editor: isMobile ? 100 : 65,
    output: isMobile ? 0 : 35
  });

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
        dispatch(setCode(''));
        dispatch(setLanguage(''));
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

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);

      // Reset panel layout when switching between mobile and desktop
      if (newIsMobile !== isMobile) {
        setPanelLayout({
          editor: newIsMobile ? (outputExpanded ? 0 : 100) : 65,
          output: newIsMobile ? (outputExpanded ? 100 : 0) : 35
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, outputExpanded]);

  // Function to download code
  const handleDownloadCode = () => {
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

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle output panel on mobile
  const toggleOutputPanel = () => {
    if (isMobile) {
      const newExpanded = !outputExpanded;
      setOutputExpanded(newExpanded);
      setPanelLayout({
        editor: newExpanded ? 0 : 100,
        output: newExpanded ? 100 : 0
      });
    }
  };

  return (
    <SidebarProvider>
      <FileSystem />
      <div className="bg-background transition-colors duration-300 h-screen w-full flex flex-col">
        {/* Header - Enhanced styling */}
        <div className="flex items-center justify-between border-b border-border/50 p-2 h-12 bg-muted/20">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-8 w-8 p-0 hover:bg-muted rounded-md">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div className="flex items-center">
              <span className="font-medium text-foreground">xcode</span>
              <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">compiler</span>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 md:px-3 border-border/50 hover:bg-muted">
                  <span className="flex items-center">
                    {languages.find(l => l.value === language)?.icon}
                    <span className="hidden sm:inline ml-2">
                      {languages.find(l => l.value === language)?.label}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border/50">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.value}
                    onClick={() => {
                      dispatch(setLanguage(lang.value));
                      dispatch(setFile(lang.file));
                    }}
                    className="hover:bg-muted flex items-center"
                  >
                    <span className="mr-2">{lang.icon}</span> {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                onClick={toggleOutputPanel}
                title={outputExpanded ? "Show Editor" : "Show Output"}
              >
                {outputExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border/50">
                <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-muted">
                  Light Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-muted">
                  Dark Mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-grow overflow-hidden bg-background">
          {isMobile ? (
            <div className="h-full">
              <div
                className="h-full transition-all duration-300"
                style={{ display: outputExpanded ? 'none' : 'block' }}
              >
                <CodeEditor className="h-full" isMobile={true} />
              </div>
              <div
                className="h-full transition-all duration-300"
                style={{ display: outputExpanded ? 'block' : 'none' }}
              >
                <Output className="h-full" />
              </div>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="bg-background">
              <ResizablePanel defaultSize={65} minSize={40} className="flex flex-col overflow-hidden">
                <CodeEditor className="flex-grow" isMobile={false} />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-border/50" />
              <ResizablePanel defaultSize={25} maxSize={45} minSize={20} className="overflow-hidden">
                <Output className="h-full" />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export type { File, Response };
export default OnlineCompilerPage;
import React from "react";
import CompilerMain from "./pages/compiler/compiler-main";
import { SidebarProvider } from "./components/ui/sidebar";
import FileSystem from "./pages/compiler/components/file-system";

function App() {
  return (
    <>
    <SidebarProvider>
      <FileSystem />
      <CompilerMain />
    </SidebarProvider>
    </>
  );
}

export default App;
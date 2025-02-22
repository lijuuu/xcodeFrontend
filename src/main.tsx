import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/pages/compiler/compiler-main';
import { ThemeProvider } from '@/components/theme-provider';
import './index.css';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Provider } from 'react-redux';
import store from '@/pages/compiler/redux/store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          {/* <SidebarTrigger /> */}
          <App />
        </SidebarProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);


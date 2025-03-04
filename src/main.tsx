import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@/hooks/theme-provider';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Analytics } from "@vercel/analytics/react"
import App from '@/App';
import { Toaster } from '@/components/ui/sonner';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <Analytics />
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <Toaster />
        <App />
      </ThemeProvider>
    </Provider>
    </>
  ,
);
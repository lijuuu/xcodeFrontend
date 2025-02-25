import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@/components/theme-provider';
import './index.css';
import { Provider } from 'react-redux';
import { store } from '@/pages/Compiler/redux/store';
import { Analytics } from "@vercel/analytics/react"
import App from '@/App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Analytics />
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
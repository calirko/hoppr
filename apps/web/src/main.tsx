import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { applyTheme, getTheme } from '@/lib/theme';
import App from './App.tsx';

applyTheme(getTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <Toaster />
    </TooltipProvider>
  </StrictMode>,
);

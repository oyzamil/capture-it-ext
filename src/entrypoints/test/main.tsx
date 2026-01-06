import '@/assets/patterns.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '@/providers/ThemeProvider.tsx';
import Test from './Test.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Test />
    </ThemeProvider>
  </StrictMode>
);

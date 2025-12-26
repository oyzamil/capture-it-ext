import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '@/providers/ThemeProvider.tsx';
import Editor from './Editor.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Editor />
    </ThemeProvider>
  </StrictMode>
);

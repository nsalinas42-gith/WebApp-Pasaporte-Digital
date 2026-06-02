import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './translations';
import { SolanaProvider } from './components/SolanaProvider.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SolanaProvider>
        <App />
      </SolanaProvider>
    </LanguageProvider>
  </StrictMode>,
);


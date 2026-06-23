import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './translations';
import { SolanaProvider } from './components/SolanaProvider.tsx';
import './index.css';

// Safe defense: capture and gracefully silence benign cross-origin iframe script errors
if (typeof window !== 'undefined') {
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || '');
    if (msgStr.includes('Script error.') || !source || !source.includes(window.location.origin)) {
      console.warn('Gracefully suppressed cross-origin script error:', message, 'from', source);
      return true; // Return true prevents firing the default event handler
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    const isScriptError = event.message === 'Script error.' || !event.filename || !event.filename.includes(window.location.origin);
    if (isScriptError) {
      event.stopImmediatePropagation();
      event.preventDefault();
      console.warn('Gracefully handled cross-origin/third-party iframe script notification:', event.message);
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason && (event.reason.message || String(event.reason));
    if (message && (message.includes('Script error') || message.includes('google') || message.includes('maps'))) {
      event.stopImmediatePropagation();
      event.preventDefault();
      console.warn('Gracefully handled cross-origin/third-party promise rejection:', message);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SolanaProvider>
        <App />
      </SolanaProvider>
    </LanguageProvider>
  </StrictMode>,
);


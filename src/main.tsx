/** @jsxImportSource react */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

// Remove loading spinner once React starts to render
const loader = document.getElementById('initial-loader');
if (loader) {
  loader.style.display = 'none';
}

try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Error rendering the app:', error);
  // Show error in the UI
  rootElement.innerHTML = `
    <div style="color: white; text-align: center; padding: 20px;">
      <h1>Something went wrong</h1>
      <p>Please try refreshing the page. If the problem persists, contact support.</p>
      <pre style="color: red; margin-top: 20px;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `;
}

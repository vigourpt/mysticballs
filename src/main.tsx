/** @jsxImportSource react */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { UserProvider } from './context/UserContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

// Handle browser navigation without full page reload
let isFirstLoad = true;
window.addEventListener('popstate', (event) => {
  event.preventDefault();
  if (!isFirstLoad) {
    // Update app state instead of reloading
    window.dispatchEvent(new CustomEvent('app:navigation'));
  }
  isFirstLoad = false;
});

try {
  root.render(
    <StrictMode>
      <UserProvider>
        <App />
      </UserProvider>
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

import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_cGVyZmVjdC1tb2NjYXNpbi0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);

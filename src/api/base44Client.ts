import { createClient, getAccessToken } from '@base44/sdk';

/**
 * Base44 client for the StudySpace app.
 *
 * The appId is provided via VITE_BASE44_APP_ID env var (set when publishing through Base44).
 * If not set, the app falls back to localStorage-based persistence.
 */

// Read appId from Vite env (with fallback for non-Vite environments)
const appId = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BASE44_APP_ID) || '';

export const base44 = appId
  ? createClient({
      appId,
      options: {
        onError: (error: Error) => {
          console.error('Base44 API error:', error);
        },
      },
    })
  : null;

export const isBase44Enabled = () => base44 !== null;

// Auto-attach token from URL/localStorage if present
if (base44 && typeof window !== 'undefined') {
  const token = getAccessToken();
  if (token) {
    base44.auth.setToken(token);
  }
}

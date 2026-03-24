import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Warn at startup if running on device with localhost (will always fail)
if (__DEV__ && BASE_URL.includes('localhost')) {
  console.warn(
    '[api] EXPO_PUBLIC_API_URL is set to localhost. ' +
    'This will fail on a physical device. ' +
    'Set it to your machine\'s local IP, e.g. http://192.168.x.x:3000'
  );
}

/**
 * Get the current Supabase session token.
 * Reads from the live Supabase session first, falls back to SecureStore.
 * This ensures we always have a fresh, valid token.
 */
async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    // Keep SecureStore in sync for the upload helper
    await SecureStore.setItemAsync('access_token', session.access_token);
    return session.access_token;
  }
  // Fallback: read from SecureStore (set by _layout.tsx onAuthStateChange)
  return SecureStore.getItemAsync('access_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, { ...options, headers });
    const json = await response.json();

    if (!response.ok) {
      const errMsg = json.error || `HTTP ${response.status}`;
      console.error(`[api] ${options.method || 'GET'} ${url} → ${response.status}: ${errMsg}`);
      return { data: null, error: errMsg };
    }

    return { data: json.data ?? json, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.error(`[api] ${options.method || 'GET'} ${url} → FAILED: ${message}`);
    return { data: null, error: message };
  }
}

export const api = {
  // Auth
  signup: (email: string, password: string, full_name: string) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    }),

  signin: (email: string, password: string) =>
    request<{ session: { access_token: string }; user: unknown }>(
      '/api/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    ),

  // Users
  getProfile: () => request('/api/users/me'),
  updateProfile: (data: Record<string, unknown>) =>
    request('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Documents
  getDocuments: () => request('/api/documents'),
  getDocument: (id: string) => request(`/api/documents/${id}`),

  uploadDocument: async (fileUri: string, fileName: string) => {
    const token = await getToken();
    const url = `${BASE_URL}/api/documents/upload`;

    if (!token) {
      console.error('[api] uploadDocument: no auth token available');
      return { data: null, error: 'Not authenticated. Please sign in again.' };
    }

    console.log(`[api] Reading PDF for upload: ${fileName}`);

    try {
      // Read file as base64 — reliable on all Android/iOS versions
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64' as any,
      });

      console.log(`[api] Uploading PDF to ${url}, size: ${base64.length} chars`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_name: fileName, file_data: base64 }),
      });

      let json: any;
      try {
        json = await response.json();
      } catch {
        console.error(`[api] uploadDocument: non-JSON response (${response.status})`);
        return { data: null, error: `Server error (${response.status})` };
      }

      if (!response.ok) {
        const errMsg = json?.error || `HTTP ${response.status}`;
        console.error(`[api] uploadDocument: ${response.status} — ${errMsg}`);
        return { data: null, error: errMsg };
      }

      return { data: json.data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      console.error(`[api] uploadDocument FAILED: ${message}`);
      return { data: null, error: message };
    }
  },

  // Biomarkers
  getBiomarkerDefinitions: () => request('/api/biomarkers/definitions'),
  getBiomarkerResults: (params?: { limit?: number; biomarker_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.biomarker_id) query.set('biomarker_id', params.biomarker_id);
    return request(`/api/biomarkers/results?${query}`);
  },
  getBiomarkerHistory: (biomarkerId: string) =>
    request(`/api/biomarkers/results/${biomarkerId}/history`),

  // Check-ins
  createCheckin: (data: Record<string, unknown>) =>
    request('/api/checkins', { method: 'POST', body: JSON.stringify(data) }),
  getCheckins: (limit = 30) => request(`/api/checkins?limit=${limit}`),
  getFollowUpQuestions: (goal: string) => request(`/api/checkins/follow-up/${goal}`),

  // Goals
  getGoalScores: () => request('/api/goals/scores'),

  // Priority
  getPriority: () => request('/api/priority'),
  recalculatePriority: () => request('/api/priority/recalculate', { method: 'POST' }),

  // Recommendations
  getRecommendations: (goal?: string) =>
    request(`/api/recommendations${goal ? `?goal=${goal}` : ''}`),
  dismissRecommendation: (id: string) =>
    request(`/api/recommendations/${id}`, { method: 'DELETE' }),

  // Timeline
  getTimeline: (limit = 30) => request(`/api/timeline?limit=${limit}`),

  // Weekly Review
  getLatestReview: () => request('/api/weekly-review/latest'),
  generateReview: () => request('/api/weekly-review/generate', { method: 'POST' }),
};

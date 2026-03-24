import { create } from 'zustand';
import { Profile, GoalScore, BiomarkerResult, Recommendation, PriorityState } from '@wellness-copilot/types';

interface AppState {
  // Auth
  userId: string | null;
  accessToken: string | null;
  profile: Profile | null;

  // Data
  goalScores: GoalScore[];
  priority: PriorityState | null;
  biomarkerResults: BiomarkerResult[];
  recommendations: Recommendation[];

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (userId: string, token: string) => void;
  clearAuth: () => void;
  setProfile: (profile: Profile) => void;
  setGoalScores: (scores: GoalScore[]) => void;
  setPriority: (priority: PriorityState) => void;
  setBiomarkerResults: (results: BiomarkerResult[]) => void;
  setRecommendations: (recs: Recommendation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  accessToken: null,
  profile: null,
  goalScores: [],
  priority: null,
  biomarkerResults: [],
  recommendations: [],
  isLoading: false,
  error: null,

  setAuth: (userId, accessToken) => set({ userId, accessToken }),
  clearAuth: () =>
    set({
      userId: null,
      accessToken: null,
      profile: null,
      goalScores: [],
      priority: null,
      biomarkerResults: [],
      recommendations: [],
    }),
  setProfile: (profile) => set({ profile }),
  setGoalScores: (goalScores) => set({ goalScores }),
  setPriority: (priority) => set({ priority }),
  setBiomarkerResults: (biomarkerResults) => set({ biomarkerResults }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

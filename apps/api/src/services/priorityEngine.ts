import { supabase } from '../lib/supabase';
import { HealthGoal, GoalScore, PriorityState } from '@wellness-copilot/types';
import { calculateGoalScores } from './goalEngine';

const FOCUS_LOCK_DAYS = 7;
const USER_PREFERENCE_BOOST = 20;

export async function recalculatePriority(userId: string): Promise<PriorityState> {
  // Get user profile for preference
  const { data: profile } = await supabase
    .from('profiles')
    .select('primary_goal, focus_lock_until')
    .eq('id', userId)
    .single();

  const goalScores = await calculateGoalScores(userId);

  // Check if focus lock is active
  const now = new Date();
  const focusLockUntil = profile?.focus_lock_until ? new Date(profile.focus_lock_until) : null;
  const isLocked = focusLockUntil ? focusLockUntil > now : false;

  // Apply user preference boost
  const userPreference = profile?.primary_goal as HealthGoal | null;
  const adjustedScores = goalScores.map((gs: GoalScore) => {
    if (gs.goal === userPreference && !isLocked) {
      return { ...gs, score: Math.min(100, gs.score + USER_PREFERENCE_BOOST) };
    }
    return gs;
  });

  // Sort by score
  const sorted = [...adjustedScores].sort((a, b) => b.score - a.score);
  const primaryGoal = sorted[0].goal;
  const secondaryGoals = sorted.slice(1, 3).map((gs) => gs.goal);

  // Update focus lock if primary goal changed
  let newFocusLockUntil = profile?.focus_lock_until || null;
  if (!isLocked && profile?.primary_goal !== primaryGoal) {
    const lockDate = new Date();
    lockDate.setDate(lockDate.getDate() + FOCUS_LOCK_DAYS);
    newFocusLockUntil = lockDate.toISOString();

    await supabase
      .from('profiles')
      .update({
        primary_goal: primaryGoal,
        focus_lock_until: newFocusLockUntil,
      })
      .eq('id', userId);
  }

  // Upsert priority state
  const priorityState: Omit<PriorityState, 'id' | 'created_at'> = {
    user_id: userId,
    primary_goal: isLocked ? (profile?.primary_goal as HealthGoal) : primaryGoal,
    secondary_goals: secondaryGoals,
    goal_scores: adjustedScores,
    focus_lock_until: newFocusLockUntil,
    user_preference_boost: userPreference,
    recalculated_at: now.toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from('priority_states')
    .upsert({ ...priorityState }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;

  return upserted as PriorityState;
}

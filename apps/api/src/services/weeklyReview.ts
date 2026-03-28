import { supabase } from '../lib/supabase';
import { HealthGoal, WeeklyReview, GoalScore } from '../types';
import { calculateGoalScores } from './goalEngine';

export async function generateWeeklyReview(userId: string): Promise<WeeklyReview> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const goalScores = await calculateGoalScores(userId);

  // Get previous priority state
  const { data: prevPriority } = await supabase
    .from('priority_states')
    .select('primary_goal, recalculated_at')
    .eq('user_id', userId)
    .order('recalculated_at', { ascending: false })
    .limit(2);

  const currentPrimary: HealthGoal = goalScores.sort((a, b) => b.score - a.score)[0].goal;
  const previousPrimary: HealthGoal | null =
    prevPriority && prevPriority.length > 1
      ? (prevPriority[1].primary_goal as HealthGoal)
      : null;

  const focusChanged = previousPrimary !== null && previousPrimary !== currentPrimary;

  // Get recent check-ins
  const { data: checkins } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .gte('checked_in_at', weekStart.toISOString())
    .order('checked_in_at', { ascending: false });

  // Get recent biomarker results
  const { data: results } = await supabase
    .from('biomarker_results')
    .select('normalized_name, status, lab_date')
    .eq('user_id', userId)
    .gte('lab_date', weekStart.toISOString().split('T')[0])
    .order('lab_date', { ascending: false })
    .limit(10);

  // Build summary bullets
  const bullets: string[] = [];

  // Top scoring goal
  const topGoal = goalScores[0];
  bullets.push(
    `Your ${topGoal.label} is your strongest area this week with a score of ${topGoal.score}/100.`
  );

  // Lowest scoring goal
  const bottomGoal = goalScores[goalScores.length - 1];
  if (bottomGoal.score < 50) {
    bullets.push(
      `${bottomGoal.label} has the most room for improvement at ${bottomGoal.score}/100.`
    );
  }

  // Check-in summary
  if (checkins && checkins.length > 0) {
    bullets.push(`You completed ${checkins.length} check-in${checkins.length > 1 ? 's' : ''} this week.`);
  } else {
    bullets.push('No check-ins recorded this week. Daily check-ins improve personalization.');
  }

  // Recent lab results
  if (results && results.length > 0) {
    const optimal = results.filter((r: any) => r.status === 'optimal').length;
    bullets.push(
      `${optimal} of ${results.length} recent biomarker results are in the optimal range.`
    );
  }

  // Focus change
  if (focusChanged) {
    bullets.push(
      `Your primary focus has shifted from ${previousPrimary} to ${currentPrimary} based on your latest data.`
    );
  }

  const review = {
    user_id: userId,
    week_start: weekStart.toISOString(),
    week_end: now.toISOString(),
    summary_bullets: bullets,
    focus_changed: focusChanged,
    new_primary_goal: focusChanged ? currentPrimary : null,
    previous_primary_goal: focusChanged ? previousPrimary : null,
  };

  const { data, error } = await supabase
    .from('weekly_reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;

  return data as WeeklyReview;
}

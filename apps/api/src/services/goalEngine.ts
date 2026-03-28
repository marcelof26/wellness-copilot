import { supabase } from '../lib/supabase';
import { HealthGoal, GoalScore, BiomarkerResult, CheckIn } from '../types';

const GOAL_LABELS: Record<HealthGoal, string> = {
  energy: 'Daily Energy',
  sleep_recovery: 'Sleep & Recovery',
  metabolism: 'Metabolic Health',
  longevity_prevention: 'Longevity',
  performance: 'Performance',
};

function scoreFromStatus(status: string): number {
  switch (status) {
    case 'optimal': return 100;
    case 'normal': return 75;
    case 'borderline': return 40;
    case 'abnormal': return 15;
    default: return 50;
  }
}

export async function calculateGoalScores(userId: string): Promise<GoalScore[]> {
  // Get latest biomarker results
  const { data: results } = await supabase
    .from('biomarker_results')
    .select(`
      *,
      biomarker_definitions (name, goals)
    `)
    .eq('user_id', userId)
    .order('lab_date', { ascending: false })
    .limit(100);

  // Get last 7 days of check-ins
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: checkins } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .gte('checked_in_at', sevenDaysAgo.toISOString())
    .order('checked_in_at', { ascending: false });

  const goals: HealthGoal[] = [
    'energy',
    'sleep_recovery',
    'metabolism',
    'longevity_prevention',
    'performance',
  ];

  return goals.map((goal) => {
    const relevantResults = (results || []).filter((r: any) => {
      const biomarkerGoals: HealthGoal[] = r.biomarker_definitions?.goals || [];
      return biomarkerGoals.includes(goal);
    });

    // Calculate biomarker score
    let biomarkerScore = 50; // default
    const contributing: string[] = [];

    if (relevantResults.length > 0) {
      const scores = relevantResults.map((r: any) => {
        contributing.push(r.normalized_name || r.raw_name);
        return scoreFromStatus(r.status);
      });
      biomarkerScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    }

    // Adjust for check-in data per goal
    let checkinBonus = 0;
    if (checkins && checkins.length > 0) {
      const avgCheckin = (arr: (number | null)[]) => {
        const valid = arr.filter((v): v is number => v !== null);
        if (!valid.length) return 5;
        return valid.reduce((a, b) => a + b, 0) / valid.length;
      };

      if (goal === 'energy') {
        const avg = avgCheckin((checkins as CheckIn[]).map(c => c.energy_level));
        checkinBonus = ((avg - 5) / 5) * 15; // ±15 points
      } else if (goal === 'sleep_recovery') {
        const avg = avgCheckin((checkins as CheckIn[]).map(c => c.sleep_quality));
        checkinBonus = ((avg - 5) / 5) * 15;
      } else if (goal === 'performance') {
        const avgEnergy = avgCheckin((checkins as CheckIn[]).map(c => c.energy_level));
        const avgStress = avgCheckin((checkins as CheckIn[]).map(c => c.stress_level));
        checkinBonus = ((avgEnergy - avgStress) / 10) * 10;
      }
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(biomarkerScore + checkinBonus)));

    return {
      goal,
      score: finalScore,
      label: GOAL_LABELS[goal],
      contributing_biomarkers: contributing.slice(0, 5),
      summary: `${GOAL_LABELS[goal]} score based on ${relevantResults.length} biomarker(s)`,
    };
  });
}

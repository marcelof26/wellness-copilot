import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getFollowUpQuestions } from '../services/followUpEngine';
import { HealthGoal } from '../types';

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { energy_level, sleep_quality, stress_level, mood, notes } = req.body;

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: req.userId!,
      energy_level,
      sleep_quality,
      stress_level,
      mood,
      notes,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Add timeline event
  await supabase.from('timeline_events').insert({
    user_id: req.userId!,
    event_type: 'check_in',
    title: 'Daily check-in recorded',
    summary: `Energy: ${energy_level}/10, Sleep: ${sleep_quality}/10`,
    metadata: { checkin_id: data.id },
    event_date: new Date().toISOString(),
  });

  return res.json({ data });
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { limit = '30' } = req.query;

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', req.userId!)
    .order('checked_in_at', { ascending: false })
    .limit(Number(limit));

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ data });
});

router.get('/follow-up/:goal', requireAuth, async (req: AuthRequest, res: Response) => {
  const goal = req.params.goal as HealthGoal;
  const validGoals: HealthGoal[] = [
    'energy', 'sleep_recovery', 'metabolism', 'longevity_prevention', 'performance',
  ];

  if (!validGoals.includes(goal)) {
    return res.status(400).json({ error: 'Invalid goal' });
  }

  const questions = getFollowUpQuestions(goal);
  return res.json({ data: questions });
});

export default router;

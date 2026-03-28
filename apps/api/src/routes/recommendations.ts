import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { HealthGoal } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { goal } = req.query;

  let query = supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', req.userId!)
    .eq('is_active', true)
    .order('priority_score', { ascending: false });

  if (goal) {
    query = query.eq('goal', goal as string);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ data });
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { goal, title, body, action_type, priority_score } = req.body;

  const { data, error } = await supabase
    .from('recommendations')
    .insert({
      user_id: req.userId!,
      goal,
      title,
      body,
      action_type,
      priority_score: priority_score || 50,
      is_active: true,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ data });
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('recommendations')
    .update({ is_active: false })
    .eq('id', req.params.id)
    .eq('user_id', req.userId!);

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ data: { dismissed: true } });
});

export default router;

import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.userId!)
    .single();

  if (error) return res.status(404).json({ error: 'Profile not found' });

  return res.json({ data });
});

router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { full_name, date_of_birth, sex, primary_goal } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, date_of_birth, sex, primary_goal, updated_at: new Date().toISOString() })
    .eq('id', req.userId!)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ data });
});

export default router;

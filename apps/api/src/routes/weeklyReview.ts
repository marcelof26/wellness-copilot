import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateWeeklyReview } from '../services/weeklyReview';

const router = Router();

router.get('/latest', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', req.userId!)
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  if (error) return res.status(404).json({ error: 'No weekly review found' });

  return res.json({ data });
});

router.post('/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const review = await generateWeeklyReview(req.userId!);
    return res.json({ data: review });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;

import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { limit = '30', offset = '0' } = req.query;

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('user_id', req.userId!)
    .order('event_date', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ data });
});

export default router;

import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { recalculatePriority } from '../services/priorityEngine';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('priority_states')
    .select('*')
    .eq('user_id', req.userId!)
    .single();

  if (error) {
    // Calculate if none exists
    try {
      const priority = await recalculatePriority(req.userId!);
      return res.json({ data: priority });
    } catch (calcErr) {
      const message = calcErr instanceof Error ? calcErr.message : 'Unknown error';
      return res.status(500).json({ error: message });
    }
  }

  return res.json({ data });
});

router.post('/recalculate', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const priority = await recalculatePriority(req.userId!);
    return res.json({ data: priority });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;

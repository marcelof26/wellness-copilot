import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get biomarker dictionary
router.get('/definitions', requireAuth, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('biomarker_definitions')
    .select('*, biomarker_education(*)')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ data });
});

// Get user's biomarker results
router.get('/results', requireAuth, async (req: AuthRequest, res: Response) => {
  const { limit = '50', offset = '0', biomarker_id } = req.query;

  let query = supabase
    .from('biomarker_results')
    .select('*, biomarker_definitions(name, category, unit, goals, biomarker_education(*))')
    .eq('user_id', req.userId!)
    .order('lab_date', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (biomarker_id) {
    query = query.eq('biomarker_id', biomarker_id as string);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ data });
});

// Get history for a specific biomarker
router.get('/results/:biomarkerId/history', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('biomarker_results')
    .select('*')
    .eq('user_id', req.userId!)
    .eq('biomarker_id', req.params.biomarkerId)
    .order('lab_date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ data });
});

export default router;

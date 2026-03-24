import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { calculateGoalScores } from '../services/goalEngine';

const router = Router();

router.get('/scores', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const scores = await calculateGoalScores(req.userId!);
    return res.json({ data: scores });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;

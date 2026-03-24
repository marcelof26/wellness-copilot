import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json({ data: { user: data.user } });
});

router.post('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  return res.json({ data });
});

export default router;

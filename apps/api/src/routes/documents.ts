import { Router, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { runParsePdfJob } from '../jobs/parsePdf.job';

const router = Router();

router.post('/upload', requireAuth, async (req: AuthRequest, res: Response) => {
  const { file_name, file_data } = req.body;

  if (!file_name || !file_data) {
    return res.status(400).json({ error: 'file_name and file_data (base64) are required' });
  }

  if (!file_name.toLowerCase().endsWith('.pdf')) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  const userId = req.userId!;

  // Decode base64 to buffer
  let fileBuffer: Buffer;
  try {
    fileBuffer = Buffer.from(file_data, 'base64');
  } catch {
    return res.status(400).json({ error: 'Invalid base64 file data' });
  }

  // Limit 20MB
  if (fileBuffer.byteLength > 20 * 1024 * 1024) {
    return res.status(400).json({ error: 'File too large. Maximum size is 20MB.' });
  }

  console.log(`[documents] Uploading ${file_name} (${fileBuffer.byteLength} bytes) for user ${userId}`);

  const storagePath = `${userId}/${Date.now()}_${file_name}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('lab-documents')
    .upload(storagePath, fileBuffer, { contentType: 'application/pdf' });

  if (uploadError) {
    console.error('[documents] Storage upload failed:', uploadError.message);
    return res.status(500).json({ error: `Storage upload failed: ${uploadError.message}` });
  }

  // Create document record
  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_name,
      storage_path: storagePath,
      parse_status: 'pending',
    })
    .select()
    .single();

  if (dbError) {
    console.error('[documents] DB insert failed:', dbError.message);
    return res.status(500).json({ error: dbError.message });
  }

  // Kick off parsing job asynchronously
  runParsePdfJob(doc.id, userId).catch((err) => {
    console.error('[documents] PDF parse job failed:', err);
  });

  return res.json({ data: doc });
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ data });
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .single();

  if (error) return res.status(404).json({ error: 'Document not found' });

  return res.json({ data });
});

export default router;

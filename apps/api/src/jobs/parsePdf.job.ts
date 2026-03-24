import { supabase } from '../lib/supabase';
import { parsePdfDocument } from '../services/pdfParser';
import { normalizeBiomarker } from '../services/biomarkerNormalizer';
import { recalculatePriority } from '../services/priorityEngine';

export async function runParsePdfJob(documentId: string, userId: string): Promise<void> {
  // Mark as processing
  await supabase
    .from('documents')
    .update({ parse_status: 'processing' })
    .eq('id', documentId);

  try {
    // Get document from storage
    const { data: doc } = await supabase
      .from('documents')
      .select('storage_path, file_name')
      .eq('id', documentId)
      .single();

    if (!doc) throw new Error('Document not found');

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('lab-documents')
      .download(doc.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Parse with Claude
    const parsed = await parsePdfDocument(base64);

    // Update document metadata
    await supabase
      .from('documents')
      .update({
        lab_date: parsed.lab_date,
        lab_name: parsed.lab_name,
      })
      .eq('id', documentId);

    // Normalize and store each biomarker
    const labDate = parsed.lab_date || new Date().toISOString().split('T')[0];

    for (const biomarker of parsed.biomarkers) {
      const normalized = await normalizeBiomarker(biomarker);

      await supabase.from('biomarker_results').insert({
        user_id: userId,
        document_id: documentId,
        biomarker_id: normalized.biomarker_id,
        raw_name: biomarker.name,
        normalized_name: normalized.normalized_name,
        value: biomarker.value,
        unit: biomarker.unit,
        normalized_value: normalized.normalized_value,
        normalized_unit: normalized.normalized_unit,
        reference_range_low:
          biomarker.reference_range_low,
        reference_range_high:
          biomarker.reference_range_high,
        status: normalized.status,
        confidence_score: normalized.confidence_score,
        lab_date: labDate,
      });
    }

    // Recalculate priority
    await recalculatePriority(userId);

    // Add timeline event
    await supabase.from('timeline_events').insert({
      user_id: userId,
      event_type: 'lab_upload',
      title: 'Lab results processed',
      summary: `${parsed.biomarkers.length} biomarkers extracted from ${doc.file_name}`,
      metadata: {
        document_id: documentId,
        biomarker_count: parsed.biomarkers.length,
        lab_name: parsed.lab_name,
        lab_date: parsed.lab_date,
      },
      event_date: new Date().toISOString(),
    });

    // Mark as completed
    await supabase
      .from('documents')
      .update({ parse_status: 'completed' })
      .eq('id', documentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    await supabase
      .from('documents')
      .update({ parse_status: 'failed', parse_error: message })
      .eq('id', documentId);

    throw err;
  }
}

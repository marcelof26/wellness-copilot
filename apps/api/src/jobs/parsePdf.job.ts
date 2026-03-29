import { supabase } from '../lib/supabase';
import { parsePdfDocument } from '../services/pdfParser';
import { normalizeBiomarker } from '../services/biomarkerNormalizer';
import { validateAndScore } from '../services/labResultValidator';
import { recalculatePriority } from '../services/priorityEngine';
import { ValidatedBiomarker } from '../types';

export async function runParsePdfJob(documentId: string, userId: string): Promise<void> {
  console.log(`[parsePdfJob] Starting for document=${documentId} user=${userId}`);

  await supabase
    .from('documents')
    .update({ parse_status: 'processing' })
    .eq('id', documentId);

  try {
    // 1. Fetch document record
    const { data: doc } = await supabase
      .from('documents')
      .select('storage_path, file_name')
      .eq('id', documentId)
      .single();

    if (!doc) throw new Error('Document not found');

    // 2. Download PDF
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('lab-documents')
      .download(doc.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // 3. Parse PDF with redesigned parser (pre-filtered candidates → Claude)
    const parsed = await parsePdfDocument(base64);

    console.log(`[parsePdfJob] Raw extraction: ${parsed.biomarkers.length} candidates from Claude`);
    parsed.biomarkers.forEach((b, i) => {
      console.log(`[parsePdfJob]   [${i + 1}] "${b.name}" = ${b.value} ${b.unit} | src: "${(b.source_row_text || '').slice(0, 60)}"`);
    });

    // 4. Update document metadata
    await supabase
      .from('documents')
      .update({ lab_date: parsed.lab_date, lab_name: parsed.lab_name })
      .eq('id', documentId);

    const labDate = parsed.lab_date || new Date().toISOString().split('T')[0];

    // 5. Validate and score all candidates
    const validated = validateAndScore(parsed.biomarkers, documentId, labDate);

    // 6. Separate by confidence tier
    const highConfidence = validated.filter(v => v.extraction_confidence === 'high');
    const mediumConfidence = validated.filter(v => v.extraction_confidence === 'medium');
    const lowConfidence = validated.filter(v => v.extraction_confidence === 'low');

    console.log(`[parsePdfJob] Persistence: ${highConfidence.length} high (will persist), ${mediumConfidence.length} medium (excluded), ${lowConfidence.length} low (rejected)`);
    lowConfidence.forEach(v => {
      console.log(`[parsePdfJob]   REJECTED: "${v.raw_name}" | reason: [${v.validation_notes.join(', ')}]`);
    });

    // 7. Persist ONLY high-confidence results to main biomarker_results table
    let persistedCount = 0;
    for (const v of highConfidence) {
      const normalized = await normalizeBiomarker({
        name: v.raw_name,
        value: v.value,
        unit: v.unit,
        reference_range_low: v.reference_range_low,
        reference_range_high: v.reference_range_high,
        source_row_text: v.source_row_text,
      });

      const { error: insertError } = await supabase.from('biomarker_results').insert({
        user_id: userId,
        document_id: documentId,
        biomarker_id: normalized.biomarker_id,
        raw_name: v.raw_name,
        normalized_name: normalized.normalized_name,
        value: v.value,
        unit: v.unit,
        normalized_value: normalized.normalized_value,
        normalized_unit: normalized.normalized_unit,
        reference_range_low: v.reference_range_low,
        reference_range_high: v.reference_range_high,
        status: normalized.status,
        confidence_score: normalized.confidence_score,
        extraction_confidence: v.extraction_confidence,
        source_row_text: v.source_row_text,
        validation_notes: v.validation_notes.join('; '),
        lab_date: labDate,
      });

      if (insertError) {
        // If new columns don't exist yet in DB, fall back to insert without them
        if (insertError.message.includes('extraction_confidence') || insertError.message.includes('source_row_text')) {
          await supabase.from('biomarker_results').insert({
            user_id: userId,
            document_id: documentId,
            biomarker_id: normalized.biomarker_id,
            raw_name: v.raw_name,
            normalized_name: normalized.normalized_name,
            value: v.value,
            unit: v.unit,
            normalized_value: normalized.normalized_value,
            normalized_unit: normalized.normalized_unit,
            reference_range_low: v.reference_range_low,
            reference_range_high: v.reference_range_high,
            status: normalized.status,
            confidence_score: normalized.confidence_score,
            lab_date: labDate,
          });
        } else {
          console.error(`[parsePdfJob] Insert error for "${v.raw_name}": ${insertError.message}`);
        }
      }

      console.log(`[parsePdfJob]   PERSISTED: "${v.raw_name}" (${v.extraction_confidence}) → biomarker_id=${normalized.biomarker_id}`);
      persistedCount++;
    }

    // 8. Recalculate priority only if we persisted something
    if (persistedCount > 0) {
      await recalculatePriority(userId);
    }

    // 9. Add timeline event
    await supabase.from('timeline_events').insert({
      user_id: userId,
      event_type: 'lab_upload',
      title: 'Lab results processed',
      summary: `${persistedCount} biomarkers extracted from ${doc.file_name} (${mediumConfidence.length} pending review, ${lowConfidence.length} rejected)`,
      metadata: {
        document_id: documentId,
        biomarker_count: persistedCount,
        medium_count: mediumConfidence.length,
        rejected_count: lowConfidence.length,
        lab_name: parsed.lab_name,
        lab_date: parsed.lab_date,
      },
      event_date: new Date().toISOString(),
    });

    await supabase
      .from('documents')
      .update({ parse_status: 'completed' })
      .eq('id', documentId);

    console.log(`[parsePdfJob] Completed: ${persistedCount} results persisted for document=${documentId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[parsePdfJob] FAILED for document=${documentId}: ${message}`);
    await supabase
      .from('documents')
      .update({ parse_status: 'failed', parse_error: message })
      .eq('id', documentId);
    throw err;
  }
}

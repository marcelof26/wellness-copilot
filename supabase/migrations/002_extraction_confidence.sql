-- Add extraction traceability columns to biomarker_results
ALTER TABLE biomarker_results
  ADD COLUMN IF NOT EXISTS extraction_confidence TEXT CHECK (extraction_confidence IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS source_row_text TEXT,
  ADD COLUMN IF NOT EXISTS validation_notes TEXT;

-- Index to filter main table by confidence
CREATE INDEX IF NOT EXISTS idx_biomarker_results_confidence
  ON biomarker_results(user_id, extraction_confidence, lab_date DESC);

-- Back-fill existing rows as 'high' (they were manually validated at time of insertion)
UPDATE biomarker_results SET extraction_confidence = 'high' WHERE extraction_confidence IS NULL;

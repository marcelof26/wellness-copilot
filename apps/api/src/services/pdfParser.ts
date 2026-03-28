// pdf-parse v1 exports a single function via CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require('pdf-parse');
import { anthropic } from '../lib/anthropic';
import { ParsedLabDocument } from '../types';

const PARSE_PROMPT = `You are a lab results parser. Extract all biomarker values from the lab text below.

Return a JSON object with this exact structure:
{"lab_date":"YYYY-MM-DD or null","lab_name":"string or null","patient_name":"string or null","biomarkers":[{"name":"biomarker name as printed","value":numeric_value,"unit":"unit string","reference_range_low":numeric or null,"reference_range_high":numeric or null}]}

Rules:
- Include ALL biomarkers found, even if reference ranges are missing
- Convert value to a number (remove commas, use dot as decimal separator)
- Preserve the unit exactly as printed
- If a range is written as "3.5 - 5.0", set low=3.5 and high=5.0
- Return ONLY valid compact JSON, no markdown, no explanation`;

export async function parsePdfDocument(pdfBase64: string): Promise<ParsedLabDocument> {
  // Extract text locally — avoids sending the full binary PDF to Claude
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  const { text: pdfText } = await pdfParse(pdfBuffer);

  console.log(`[pdfParser] Extracted ${pdfText.length} chars of text from PDF`);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `${PARSE_PROMPT}\n\n---LAB TEXT---\n${pdfText}`,
      },
    ],
  });

  const stopReason = response.stop_reason;
  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  console.log(`[pdfParser] stop_reason=${stopReason} text_length=${text.length} usage=${JSON.stringify(response.usage)}`);

  if (stopReason === 'max_tokens') {
    throw new Error(`Claude response truncated (max_tokens). Text length: ${text.length}.`);
  }

  try {
    return JSON.parse(text) as ParsedLabDocument;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ParsedLabDocument;
    }
    console.error(`[pdfParser] Raw response (first 500 chars): ${text.slice(0, 500)}`);
    throw new Error(`Failed to parse Claude response as JSON: ${text.slice(0, 200)}`);
  }
}

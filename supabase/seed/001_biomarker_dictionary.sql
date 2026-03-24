-- Biomarker Dictionary Seed

INSERT INTO biomarker_definitions (name, aliases, category, unit, alternative_units, reference_range_low, reference_range_high, optimal_low, optimal_high, goals, description) VALUES

-- Metabolic Panel
('Glucose', ARRAY['Blood Sugar', 'Fasting Glucose', 'FBG', 'Blood Glucose'], 'Metabolic', 'mg/dL', ARRAY['mmol/L'], 70, 99, 72, 85, ARRAY['metabolism','energy','longevity_prevention'], 'Primary energy source for cells. Elevated fasting levels indicate metabolic stress.'),
('HbA1c', ARRAY['Hemoglobin A1c', 'Glycated Hemoglobin', 'A1c', 'Glycohemoglobin'], 'Metabolic', '%', ARRAY[]::text[], 4.0, 5.6, 4.5, 5.3, ARRAY['metabolism','longevity_prevention','energy'], '3-month average of blood sugar levels.'),
('Insulin (Fasting)', ARRAY['Fasting Insulin', 'Insulin'], 'Metabolic', 'uIU/mL', ARRAY['pmol/L'], 2, 19, 2, 8, ARRAY['metabolism','energy','longevity_prevention'], 'Fasting insulin is a sensitive early marker of insulin resistance.'),
('HOMA-IR', ARRAY['Insulin Resistance Index'], 'Metabolic', 'index', ARRAY[]::text[], 0, 2.5, 0, 1.5, ARRAY['metabolism','longevity_prevention'], 'Calculated insulin resistance score.'),

-- Lipid Panel
('Total Cholesterol', ARRAY['Cholesterol', 'TC'], 'Lipids', 'mg/dL', ARRAY['mmol/L'], 100, 199, 150, 180, ARRAY['longevity_prevention','metabolism'], 'Total blood cholesterol level.'),
('LDL Cholesterol', ARRAY['LDL', 'LDL-C', 'Bad Cholesterol'], 'Lipids', 'mg/dL', ARRAY['mmol/L'], 0, 99, 0, 70, ARRAY['longevity_prevention','metabolism'], 'Primary driver of cardiovascular risk when elevated.'),
('HDL Cholesterol', ARRAY['HDL', 'HDL-C', 'Good Cholesterol'], 'Lipids', 'mg/dL', ARRAY['mmol/L'], 40, 200, 60, 90, ARRAY['longevity_prevention','performance'], 'Protective lipoprotein. Higher is generally better.'),
('Triglycerides', ARRAY['TG', 'TRIG', 'Trigs'], 'Lipids', 'mg/dL', ARRAY['mmol/L'], 0, 149, 0, 80, ARRAY['metabolism','longevity_prevention','energy'], 'Blood fat level. Elevated levels linked to insulin resistance.'),
('ApoB', ARRAY['Apolipoprotein B', 'Apo B'], 'Lipids', 'mg/dL', ARRAY[]::text[], 0, 90, 0, 60, ARRAY['longevity_prevention'], 'More accurate cardiovascular risk marker than LDL.'),

-- Thyroid
('TSH', ARRAY['Thyroid Stimulating Hormone', 'Thyrotropin'], 'Thyroid', 'mIU/L', ARRAY['uIU/mL'], 0.4, 4.0, 1.0, 2.5, ARRAY['energy','metabolism','sleep_recovery'], 'Regulates thyroid function. Out-of-range levels affect metabolism and energy.'),
('Free T4', ARRAY['FT4', 'Free Thyroxine', 'Thyroxine Free'], 'Thyroid', 'ng/dL', ARRAY['pmol/L'], 0.8, 1.8, 1.0, 1.6, ARRAY['energy','metabolism'], 'Active thyroid hormone affecting metabolism and energy.'),
('Free T3', ARRAY['FT3', 'Free Triiodothyronine', 'T3 Free'], 'Thyroid', 'pg/mL', ARRAY['pmol/L'], 2.3, 4.2, 3.0, 4.0, ARRAY['energy','metabolism','performance'], 'Most biologically active thyroid hormone.'),

-- Inflammation
('hsCRP', ARRAY['High-Sensitivity CRP', 'hs-CRP', 'CRP', 'C-Reactive Protein'], 'Inflammation', 'mg/L', ARRAY[]::text[], 0, 1.0, 0, 0.5, ARRAY['longevity_prevention','performance','sleep_recovery'], 'Sensitive marker of systemic inflammation.'),
('Homocysteine', ARRAY['HCY', 'Homocysteine Level'], 'Inflammation', 'umol/L', ARRAY[]::text[], 0, 10.0, 4, 8, ARRAY['longevity_prevention','energy'], 'Elevated levels linked to cardiovascular and cognitive risk.'),
('Fibrinogen', ARRAY['Fibrinogen Level'], 'Inflammation', 'mg/dL', ARRAY[]::text[], 200, 400, 200, 300, ARRAY['longevity_prevention'], 'Clotting protein that rises with inflammation.'),

-- Complete Blood Count
('Hemoglobin', ARRAY['Hgb', 'Hb'], 'Blood Count', 'g/dL', ARRAY[]::text[], 12.0, 17.5, 13.5, 16.5, ARRAY['energy','performance'], 'Oxygen-carrying protein in red blood cells.'),
('Hematocrit', ARRAY['HCT', 'PCV'], 'Blood Count', '%', ARRAY[]::text[], 36, 52, 40, 50, ARRAY['energy','performance'], 'Percentage of blood volume occupied by red blood cells.'),
('RBC', ARRAY['Red Blood Cells', 'Red Cell Count'], 'Blood Count', 'M/uL', ARRAY[]::text[], 3.8, 5.8, 4.2, 5.4, ARRAY['energy','performance'], 'Red blood cell count.'),
('MCV', ARRAY['Mean Corpuscular Volume'], 'Blood Count', 'fL', ARRAY[]::text[], 80, 100, 82, 96, ARRAY['energy'], 'Average size of red blood cells. Indicates nutritional deficiencies.'),
('WBC', ARRAY['White Blood Cells', 'Leukocytes', 'White Cell Count'], 'Blood Count', 'K/uL', ARRAY[]::text[], 3.5, 10.5, 4.5, 7.5, ARRAY['longevity_prevention'], 'Immune cell count.'),
('Platelets', ARRAY['PLT', 'Platelet Count', 'Thrombocytes'], 'Blood Count', 'K/uL', ARRAY[]::text[], 150, 400, 175, 350, ARRAY['longevity_prevention'], 'Blood clotting cells.'),

-- Vitamins & Minerals
('Vitamin D', ARRAY['25-OH Vitamin D', 'Vitamin D3', '25-Hydroxyvitamin D', 'Vit D'], 'Vitamins', 'ng/mL', ARRAY['nmol/L'], 30, 100, 50, 80, ARRAY['energy','sleep_recovery','longevity_prevention','performance','metabolism'], 'Critical for immune function, bone health, mood, and hormone balance.'),
('Vitamin B12', ARRAY['B12', 'Cobalamin', 'Cyanocobalamin'], 'Vitamins', 'pg/mL', ARRAY['pmol/L'], 200, 900, 500, 900, ARRAY['energy','longevity_prevention'], 'Essential for nerve function and red blood cell production.'),
('Folate', ARRAY['Folic Acid', 'Vitamin B9', 'Serum Folate'], 'Vitamins', 'ng/mL', ARRAY[]::text[], 3.4, 40, 10, 30, ARRAY['energy','longevity_prevention'], 'Essential for DNA synthesis and cell division.'),
('Ferritin', ARRAY['Serum Ferritin', 'Iron Stores'], 'Minerals', 'ng/mL', ARRAY[]::text[], 15, 300, 50, 150, ARRAY['energy','performance','sleep_recovery'], 'Iron storage protein. Low levels cause fatigue and poor recovery.'),
('Iron', ARRAY['Serum Iron', 'Fe'], 'Minerals', 'ug/dL', ARRAY['umol/L'], 60, 170, 80, 150, ARRAY['energy','performance'], 'Essential mineral for oxygen transport.'),
('Magnesium', ARRAY['Mg', 'Serum Magnesium', 'Magnesium RBC'], 'Minerals', 'mg/dL', ARRAY['mmol/L'], 1.7, 2.4, 2.0, 2.4, ARRAY['sleep_recovery','energy','performance','metabolism'], 'Involved in 300+ enzyme reactions. Critical for sleep and muscle function.'),
('Zinc', ARRAY['Serum Zinc', 'Zn'], 'Minerals', 'ug/dL', ARRAY['umol/L'], 60, 120, 80, 110, ARRAY['longevity_prevention','performance'], 'Supports immune function, testosterone production, and wound healing.'),

-- Hormones
('Testosterone (Total)', ARRAY['Total Testosterone', 'T', 'Testosterone'], 'Hormones', 'ng/dL', ARRAY['nmol/L'], 264, 916, 500, 900, ARRAY['energy','performance','metabolism'], 'Primary male sex hormone. Affects energy, muscle mass, and mood.'),
('Free Testosterone', ARRAY['Free T', 'FT'], 'Hormones', 'pg/mL', ARRAY['nmol/L'], 8.7, 25.1, 15, 25, ARRAY['energy','performance'], 'Biologically active fraction of testosterone.'),
('DHEA-S', ARRAY['DHEAS', 'Dehydroepiandrosterone Sulfate', 'DHEA Sulfate'], 'Hormones', 'ug/dL', ARRAY['umol/L'], 80, 560, 200, 450, ARRAY['energy','longevity_prevention'], 'Adrenal hormone precursor that declines with age.'),
('Cortisol', ARRAY['AM Cortisol', 'Morning Cortisol', 'Serum Cortisol'], 'Hormones', 'ug/dL', ARRAY['nmol/L'], 6, 23, 8, 18, ARRAY['sleep_recovery','energy','performance'], 'Stress hormone. Elevated levels affect sleep, weight, and recovery.'),
('Estradiol', ARRAY['E2', 'Estrogen', 'Oestradiol'], 'Hormones', 'pg/mL', ARRAY['pmol/L'], 10, 50, 20, 40, ARRAY['energy','metabolism','longevity_prevention'], 'Primary estrogen. Important for bone density, mood, and libido.'),

-- Liver & Kidney
('ALT', ARRAY['Alanine Aminotransferase', 'SGPT', 'Alanine Transaminase'], 'Liver', 'U/L', ARRAY[]::text[], 7, 40, 7, 30, ARRAY['metabolism','longevity_prevention'], 'Liver enzyme. Elevated levels may indicate liver stress.'),
('AST', ARRAY['Aspartate Aminotransferase', 'SGOT', 'Aspartate Transaminase'], 'Liver', 'U/L', ARRAY[]::text[], 10, 40, 10, 30, ARRAY['metabolism','longevity_prevention','performance'], 'Liver and muscle enzyme. Elevated after intense exercise or liver issues.'),
('GGT', ARRAY['Gamma-Glutamyl Transferase', 'Gamma GT'], 'Liver', 'U/L', ARRAY[]::text[], 9, 48, 9, 25, ARRAY['metabolism','longevity_prevention'], 'Sensitive liver enzyme. Rises with alcohol use and liver inflammation.'),
('Creatinine', ARRAY['Serum Creatinine', 'Crea'], 'Kidney', 'mg/dL', ARRAY['umol/L'], 0.6, 1.2, 0.7, 1.0, ARRAY['longevity_prevention','performance'], 'Kidney filtration marker and muscle metabolism byproduct.'),
('eGFR', ARRAY['Estimated GFR', 'Glomerular Filtration Rate', 'GFR'], 'Kidney', 'mL/min/1.73m2', ARRAY[]::text[], 60, 120, 90, 120, ARRAY['longevity_prevention'], 'Estimated kidney filtration rate.'),
('Uric Acid', ARRAY['Urate', 'Serum Uric Acid'], 'Kidney', 'mg/dL', ARRAY['umol/L'], 2.6, 7.2, 3.0, 5.5, ARRAY['metabolism','longevity_prevention','performance'], 'Purine metabolism byproduct. High levels associated with gout and metabolic issues.'),

-- Cardiovascular
('Lp(a)', ARRAY['Lipoprotein a', 'Lp a'], 'Cardiovascular', 'mg/dL', ARRAY['nmol/L'], 0, 30, 0, 14, ARRAY['longevity_prevention'], 'Genetic cardiovascular risk marker.'),
('Apolipoprotein A1', ARRAY['ApoA1', 'Apo A-1'], 'Cardiovascular', 'mg/dL', ARRAY[]::text[], 100, 205, 150, 205, ARRAY['longevity_prevention'], 'Major protein in HDL. Protective against cardiovascular issues.'),

-- Sleep & Stress markers
('IGF-1', ARRAY['Insulin-Like Growth Factor 1', 'Somatomedin C'], 'Growth', 'ng/mL', ARRAY[]::text[], 115, 355, 150, 300, ARRAY['performance','sleep_recovery','longevity_prevention'], 'Growth hormone proxy. Important for muscle repair and sleep quality.'),

-- Electrolytes
('Sodium', ARRAY['Na', 'Serum Sodium'], 'Electrolytes', 'mEq/L', ARRAY['mmol/L'], 136, 145, 138, 143, ARRAY['performance','energy'], 'Key electrolyte for fluid balance and nerve function.'),
('Potassium', ARRAY['K', 'Serum Potassium'], 'Electrolytes', 'mEq/L', ARRAY['mmol/L'], 3.5, 5.2, 4.0, 5.0, ARRAY['performance','energy'], 'Critical for heart rhythm, muscle contraction, and fluid balance.'),

-- Additional markers
('Albumin', ARRAY['Serum Albumin'], 'Protein', 'g/dL', ARRAY[]::text[], 3.5, 5.0, 4.0, 5.0, ARRAY['longevity_prevention','performance'], 'Main blood protein. Marker of nutritional status and liver function.'),
('Total Protein', ARRAY['Serum Total Protein', 'TP'], 'Protein', 'g/dL', ARRAY[]::text[], 6.0, 8.5, 6.5, 8.0, ARRAY['performance','longevity_prevention'], 'Total protein in blood.'),
('Calcium', ARRAY['Ca', 'Serum Calcium', 'Total Calcium'], 'Minerals', 'mg/dL', ARRAY['mmol/L'], 8.5, 10.5, 9.0, 10.0, ARRAY['longevity_prevention','performance'], 'Essential for bone health, muscle contraction, and nerve signaling.'),
('Phosphorus', ARRAY['Phos', 'Phosphate', 'Inorganic Phosphorus'], 'Minerals', 'mg/dL', ARRAY['mmol/L'], 2.5, 4.5, 3.0, 4.0, ARRAY['longevity_prevention','energy'], 'Mineral for bone health and energy production (ATP).'),
('CO2', ARRAY['Carbon Dioxide', 'Bicarbonate', 'HCO3'], 'Electrolytes', 'mEq/L', ARRAY[]::text[], 22, 29, 24, 28, ARRAY['performance'], 'Acid-base balance marker.'),
('BUN', ARRAY['Blood Urea Nitrogen', 'Urea Nitrogen'], 'Kidney', 'mg/dL', ARRAY['mmol/L'], 7, 20, 10, 18, ARRAY['longevity_prevention','performance'], 'Kidney function and protein metabolism marker.')
ON CONFLICT (name) DO NOTHING;

-- Biomarker Education (key biomarkers)
INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Blood Sugar',
  'The amount of glucose (sugar) circulating in your blood after fasting',
  'Sustained high blood sugar damages blood vessels and nerves over time. It is one of the earliest signs that your metabolism needs attention.',
  'Reduce refined carbohydrates and added sugars. Add protein and fiber to meals. Walk after meals. Consider time-restricted eating.'
FROM biomarker_definitions WHERE name = 'Glucose'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, '3-Month Blood Sugar Average',
  'The percentage of hemoglobin coated with sugar over the past 3 months',
  'A long-term view of blood sugar control. Even borderline levels are associated with energy crashes, inflammation, and metabolic aging.',
  'Same as glucose: reduce refined carbs, increase fiber, exercise consistently. Improvements take 3 months to show.'
FROM biomarker_definitions WHERE name = 'HbA1c'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Vitamin D Level',
  'The amount of vitamin D stored in your body (25-hydroxyvitamin D form)',
  'Vitamin D acts more like a hormone than a vitamin. Low levels are linked to fatigue, low mood, poor immune function, and hormonal imbalances.',
  'Sun exposure 15-30 min daily. Supplement with D3+K2 if levels are below 40 ng/mL. Retest in 3 months.'
FROM biomarker_definitions WHERE name = 'Vitamin D'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Iron Stores',
  'The amount of iron stored in your body, separate from iron in circulation',
  'Ferritin is the most sensitive marker of iron status. Low ferritin causes fatigue, hair loss, and poor workout recovery even before anemia appears.',
  'Eat red meat, liver, or shellfish. Pair plant iron sources with vitamin C. Avoid coffee or tea with meals. Rule out blood loss.'
FROM biomarker_definitions WHERE name = 'Ferritin'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Thyroid Stimulator',
  'How hard your brain is working to stimulate your thyroid gland',
  'TSH is the pituitary gland''s signal to the thyroid. High TSH means the thyroid is underactive (hypothyroid) — causing fatigue, weight gain, cold sensitivity. Low TSH suggests an overactive thyroid.',
  'Optimize iodine and selenium intake. Manage stress. Avoid crash diets. Retest if symptomatic.'
FROM biomarker_definitions WHERE name = 'TSH'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Inflammation Marker',
  'A protein released by your liver in response to inflammation anywhere in the body',
  'hsCRP is one of the most powerful predictors of heart disease, metabolic issues, and accelerated aging. Even low-grade chronic inflammation has significant long-term effects.',
  'Prioritize anti-inflammatory foods (omega-3s, leafy greens, berries). Improve sleep. Manage stress. Exercise regularly but avoid overtraining.'
FROM biomarker_definitions WHERE name = 'hsCRP'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Bad Cholesterol Particles',
  'The cholesterol carried by LDL particles — the main driver of arterial plaque',
  'LDL cholesterol is the primary target for cardiovascular risk reduction. Optimal levels for longevity are below 70 mg/dL, not just "normal".',
  'Reduce saturated fat from processed foods. Increase soluble fiber (oats, beans, flaxseed). Regular aerobic exercise. Optimize thyroid and insulin levels first.'
FROM biomarker_definitions WHERE name = 'LDL Cholesterol'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Blood Fats',
  'Fat particles circulating in your blood after fasting',
  'High triglycerides are a direct marker of excess carbohydrate and alcohol intake, and insulin resistance. They raise cardiovascular risk and are strongly linked to metabolic issues.',
  'Reduce refined carbohydrates and alcohol. Increase omega-3 fatty acids (fatty fish, fish oil). Exercise. Achieve a healthy weight.'
FROM biomarker_definitions WHERE name = 'Triglycerides'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Sleep & Recovery Hormone',
  'A proxy measure of growth hormone secretion during sleep',
  'IGF-1 is released during deep sleep and drives muscle repair, fat metabolism, and cellular regeneration. Low levels indicate poor sleep quality or growth hormone decline.',
  'Prioritize 7-9 hours of quality sleep. Strength train regularly. Optimize protein intake. Consider cold exposure and fasting protocols.'
FROM biomarker_definitions WHERE name = 'IGF-1'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Stress Hormone',
  'Your primary stress hormone, made by the adrenal glands',
  'Cortisol follows a daily rhythm — high in the morning, low at night. Chronically elevated cortisol disrupts sleep, promotes fat storage around the abdomen, and suppresses immunity.',
  'Improve sleep consistency. Practice stress management (meditation, breathwork). Reduce caffeine after noon. Avoid over-exercising.'
FROM biomarker_definitions WHERE name = 'Cortisol'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Muscle Mineral',
  'The level of magnesium in your blood (though serum is a poor proxy — RBC magnesium is more accurate)',
  'Magnesium is involved in over 300 enzyme reactions including energy production, muscle relaxation, and sleep. Deficiency is common and causes muscle cramps, poor sleep, and low energy.',
  'Eat leafy greens, nuts, seeds, dark chocolate, and avocado. Consider magnesium glycinate or threonate supplement before bed.'
FROM biomarker_definitions WHERE name = 'Magnesium'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Testosterone Level',
  'The total amount of the primary male sex hormone circulating in your blood',
  'Testosterone supports energy, libido, muscle mass, bone density, and mood. Declining testosterone is common with age, poor sleep, and excess body fat.',
  'Optimize sleep (7-9 hours), reduce body fat, strength train, manage stress, ensure adequate zinc and vitamin D.'
FROM biomarker_definitions WHERE name = 'Testosterone (Total)'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Liver Health Enzyme',
  'An enzyme released when liver cells are stressed or damaged',
  'ALT is the most specific liver enzyme. Elevated levels can indicate fatty liver, metabolic liver disease, or medication effects. Optimal is well below "normal" range limits.',
  'Reduce alcohol. Lose excess body fat. Reduce fructose and processed foods. Increase fiber. Supplement with NAC if elevated.'
FROM biomarker_definitions WHERE name = 'ALT'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Oxygen Carrier',
  'The protein inside red blood cells that carries oxygen to every cell in your body',
  'Low hemoglobin (anemia) causes fatigue, reduced exercise capacity, shortness of breath, and poor recovery. It is one of the most direct causes of low energy.',
  'Optimize iron, B12, folate. Address root cause (blood loss, absorption issues). Eat red meat, shellfish, leafy greens.'
FROM biomarker_definitions WHERE name = 'Hemoglobin'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Nerve Vitamin',
  'The level of vitamin B12 in your blood',
  'B12 is essential for nerve function, red blood cell production, and DNA synthesis. Deficiency develops slowly and causes fatigue, cognitive decline, tingling, and anemia.',
  'Eat animal products (meat, fish, eggs, dairy). Supplement if vegetarian/vegan or over 50. Methylcobalamin form is preferred.'
FROM biomarker_definitions WHERE name = 'Vitamin B12'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Kidney Filter Rate',
  'How efficiently your kidneys are filtering waste from your blood',
  'eGFR is the primary kidney health metric. Declining eGFR over time indicates progressive kidney damage, often from blood sugar issues, high blood pressure, or chronic dehydration.',
  'Stay well hydrated. Control blood pressure and blood sugar. Limit NSAIDs. Avoid excessive protein if already below 60.'
FROM biomarker_definitions WHERE name = 'eGFR'
ON CONFLICT DO NOTHING;

INSERT INTO biomarker_education (biomarker_id, plain_language_name, what_it_measures, why_it_matters, how_to_improve)
SELECT id, 'Insulin Sensitivity Index',
  'A calculated score combining fasting glucose and insulin to estimate insulin resistance',
  'HOMA-IR below 1.5 indicates excellent insulin sensitivity. Scores above 2 suggest meaningful insulin resistance, even if glucose appears normal. Catching this early is key.',
  'Same interventions as glucose and fasting insulin: low-carb or time-restricted eating, strength training, weight loss, and optimizing sleep.'
FROM biomarker_definitions WHERE name = 'HOMA-IR'
ON CONFLICT DO NOTHING;

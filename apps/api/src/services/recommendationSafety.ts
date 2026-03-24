import { HealthGoal } from '@wellness-copilot/types';

const BLOCKED_PATTERNS = [
  /diagnos/i,
  /disease/i,
  /disorder/i,
  /condition/i,
  /medication/i,
  /prescri/i,
  /treat(ment)?/i,
  /symptom/i,
  /patholog/i,
  /syndrome/i,
  /deficiency/i,
  /insufficien/i,
  /abnormal/i,
  /elevated.*risk/i,
  /you (have|may have|could have|might have)/i,
  /consult (a|your) doctor/i,
  /medical attention/i,
  /seek (medical|professional)/i,
];

const FALLBACK_RECOMMENDATIONS: Record<HealthGoal, string[]> = {
  energy: [
    'Focus on consistent sleep and wake times to support your natural energy rhythms.',
    'Consider adding more whole foods rich in B vitamins, such as leafy greens and legumes.',
    'Short walks after meals may support sustained energy levels throughout the day.',
  ],
  sleep_recovery: [
    'Aim for a consistent bedtime routine, even on weekends.',
    'Limit blue light exposure in the hour before sleep.',
    'Magnesium-rich foods like nuts and seeds may support relaxation.',
  ],
  metabolism: [
    'Including protein with each meal can support metabolic balance.',
    'Staying hydrated supports cellular energy production.',
    'Strength training a few times per week supports lean muscle and metabolic health.',
  ],
  longevity_prevention: [
    'A Mediterranean-style diet is consistently associated with long-term health outcomes.',
    'Regular movement throughout the day, even brief walks, supports cardiovascular health.',
    'Managing stress through mindfulness or breathwork supports long-term wellbeing.',
  ],
  performance: [
    'Adequate protein intake supports muscle repair and performance.',
    'Consistent hydration before and after activity supports output and recovery.',
    'Prioritizing sleep improves reaction time, coordination, and focus.',
  ],
};

export function filterRecommendation(text: string): {
  safe: boolean;
  filtered: string;
} {
  let filtered = text;
  let safe = true;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(filtered)) {
      safe = false;
      filtered = filtered.replace(pattern, '[removed]');
    }
  }

  return { safe, filtered };
}

export function getFallbackRecommendations(goal: HealthGoal): string[] {
  return FALLBACK_RECOMMENDATIONS[goal] || FALLBACK_RECOMMENDATIONS.energy;
}

export function safeRecommendation(text: string, goal: HealthGoal): string {
  const { safe, filtered } = filterRecommendation(text);
  if (!safe) {
    const fallbacks = getFallbackRecommendations(goal);
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  return filtered;
}

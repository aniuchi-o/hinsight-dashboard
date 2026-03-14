export const FACTOR_CONDITION_MAP: Record<string, string[]> = {
  Sleep:      ['Hypertension'],
  Nutrition:  ['Type 1 Diabetes'],
  Smoke:      ['Type 1 Diabetes'],
  Stress:     ['Type 1 Diabetes', 'Cancer'],
  Depression: ['Chronic Kidney Disease', 'Type 2 Diabetes'],
  Obesity:    ['Cancer'],
  Wellness:   [],
  Movement:   [],
};

export const PAGE_FACTORS: Record<string, string[]> = {
  overview:         ['Sleep', 'Nutrition', 'Stress', 'Depression', 'Smoke', 'Obesity', 'Wellness', 'Movement'],
  lifestyle:        ['Smoke', 'Sleep', 'Movement', 'Nutrition'],
  nutritionObesity: ['Nutrition', 'Obesity'],
  feelings:         ['Wellness', 'Stress', 'Depression'],
};

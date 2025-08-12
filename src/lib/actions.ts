'use server';

import { categorizeViolation } from '@/ai/flows/categorize-violation';

export async function getViolationCategorySuggestions(description: string) {
  if (!description) {
    return { suggestedCategories: [] };
  }
  try {
    const result = await categorizeViolation({ violationDescription: description });
    return result;
  } catch (error) {
    console.error(error);
    return { suggestedCategories: [], error: 'Gagal mendapatkan saran dari AI.' };
  }
}

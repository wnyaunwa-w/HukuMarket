// This file is safe to edit. It will not be overwritten.
'use server';

import {
  getListingImprovementSuggestions,
  type ListingImprovementInput,
  type ListingImprovementOutput,
} from '@/ai/flows/listing-improvement-suggestions';
import { z } from 'zod';

const ActionInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  quantity: z.number(),
  breed: z.string(),
  price: z.number(),
  location: z.string(),
});

export async function getSuggestionsAction(
  input: ListingImprovementInput
): Promise<{ success: boolean; data: ListingImprovementOutput | null; error: string | null }> {
  const parsedInput = ActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { success: false, data: null, error: 'Invalid input.' };
  }

  try {
    const suggestions = await getListingImprovementSuggestions(parsedInput.data);
    return { success: true, data: suggestions, error: null };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return { success: false, data: null, error: 'Failed to get AI suggestions. Please try again.' };
  }
}

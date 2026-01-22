// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Provides AI-powered suggestions to improve broiler chicken listings.
 *
 * - getListingImprovementSuggestions - A function that takes a listing as input and returns improvement suggestions.
 * - ListingImprovementInput - The input type for the getListingImprovementSuggestions function.
 * - ListingImprovementOutput - The return type for the getListingImprovementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ListingImprovementInputSchema = z.object({
  title: z.string().describe('The title of the listing.'),
  description: z.string().describe('The current description of the listing.'),
  quantity: z.number().describe('The quantity of broiler chickens being offered.'),
  breed: z.string().describe('The breed of the broiler chickens.'),
  price: z.number().describe('The current price per broiler chicken.'),
  location: z.string().describe('The location where the broiler chickens are being sold.'),
  historicalSalesData: z
    .array(z.object({
      quantity: z.number(),
      price: z.number(),
      date: z.string(),
    }))
    .optional()
    .describe('Historical sales data for similar listings.'),
});
export type ListingImprovementInput = z.infer<typeof ListingImprovementInputSchema>;

const ListingImprovementOutputSchema = z.object({
  improvedDescription: z.string().describe('An improved description for the listing.'),
  suggestedPrice: z.number().describe('A suggested price per broiler chicken based on market trends and historical data.'),
  reasoning: z.string().describe('The reasoning behind the suggested improvements.'),
});
export type ListingImprovementOutput = z.infer<typeof ListingImprovementOutputSchema>;

export async function getListingImprovementSuggestions(
  input: ListingImprovementInput
): Promise<ListingImprovementOutput> {
  return listingImprovementFlow(input);
}

const listingImprovementPrompt = ai.definePrompt({
  name: 'listingImprovementPrompt',
  input: {schema: ListingImprovementInputSchema},
  output: {schema: ListingImprovementOutputSchema},
  prompt: `You are an AI assistant designed to help sellers improve their broiler chicken listings to attract more buyers and increase sales.

  Based on the following listing details, provide an improved description, a suggested price, and the reasoning behind your suggestions.

  Listing Details:
  Title: {{{title}}}
  Description: {{{description}}}
  Quantity: {{{quantity}}}
  Breed: {{{breed}}}
  Price: {{{price}}}
  Location: {{{location}}}

  {{#if historicalSalesData}}
  Historical Sales Data for Similar Listings:
  {{#each historicalSalesData}}
  - Quantity: {{{quantity}}}, Price: {{{price}}}, Date: {{{date}}}
  {{/each}}
  {{else}}
  No historical sales data available.
  {{/if}}

  Improved Description: (Provide a compelling and detailed description that highlights the key features and benefits of the chickens)
  Suggested Price: (Suggest a price that is competitive and attractive to buyers, considering market trends and historical data)
  Reasoning: (Explain the reasons behind your suggested improvements, including why the improved description and suggested price are likely to be more effective)
  Remember to always set the Improved Description, Suggested Price, and Reasoning values in the output.`,
});

const listingImprovementFlow = ai.defineFlow(
  {
    name: 'listingImprovementFlow',
    inputSchema: ListingImprovementInputSchema,
    outputSchema: ListingImprovementOutputSchema,
  },
  async input => {
    const {output} = await listingImprovementPrompt(input);
    return output!;
  }
);

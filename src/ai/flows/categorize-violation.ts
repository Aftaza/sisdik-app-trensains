'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing student violations based on a description of the incident.
 *
 * - categorizeViolation - A function that takes a violation description as input and returns suggested categories.
 * - CategorizeViolationInput - The input type for the categorizeViolation function.
 * - CategorizeViolationOutput - The return type for the categorizeViolation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeViolationInputSchema = z.object({
  violationDescription: z
    .string()
    .describe('A detailed description of the student violation incident.'),
});
export type CategorizeViolationInput = z.infer<typeof CategorizeViolationInputSchema>;

const CategorizeViolationOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('An array of suggested violation categories based on the description.'),
});
export type CategorizeViolationOutput = z.infer<typeof CategorizeViolationOutputSchema>;

export async function categorizeViolation(input: CategorizeViolationInput): Promise<CategorizeViolationOutput> {
  return categorizeViolationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeViolationPrompt',
  input: {schema: CategorizeViolationInputSchema},
  output: {schema: CategorizeViolationOutputSchema},
  prompt: `You are an AI assistant that suggests categories for student violations based on the provided description of the incident.

  Analyze the following description and provide a list of suggested categories that best fit the violation.
  The categories should be short and concise, and should NOT include explanation.
  Categories should include common misbehaviors like "Bullying", "Cheating", "Tardiness", "Disrespect", "Theft", or other relevant categories.

  Description: {{{violationDescription}}}
  
  Suggest violation categories:
  `,
});

const categorizeViolationFlow = ai.defineFlow(
  {
    name: 'categorizeViolationFlow',
    inputSchema: CategorizeViolationInputSchema,
    outputSchema: CategorizeViolationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

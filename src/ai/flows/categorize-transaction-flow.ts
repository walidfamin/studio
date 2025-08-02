'use server';
/**
 * @fileOverview A transaction categorization AI agent.
 *
 * - categorizeTransaction - A function that handles the transaction categorization process.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Transaction } from '@/lib/types';


const CategorizeTransactionInputSchema = z.object({
  description: z.string().describe('The description of the transaction.'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

export type CategorizeTransactionOutput = Transaction['category'];

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {format: 'json'},
  prompt: `You are an expert at categorizing financial transactions. Based on the transaction description, categorize it into one of the following categories: 'Food', 'Transport', 'Spends', 'Investment', 'Lifestyle', 'Salary', 'Rent/Mortgage', 'Groceries', 'Uncategorized'.

  Transaction Description: {{{description}}}
  
  Return only the category name as a JSON string. For example: "Food"`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: z.enum(['Food', 'Transport', 'Spends', 'Investment', 'Lifestyle', 'Salary', 'Rent/Mortgage', 'Groceries', 'Uncategorized', 'Credit Card Payment']),
  },
  async (input) => {
    const {output} = await prompt(input);
    try {
      const category = JSON.parse(output as string);
      return category;
    } catch (e) {
      return 'Uncategorized';
    }
  }
);

'use server';

/**
 * @fileOverview Generates a personalized workout plan based on user input.
 *
 * - generateWorkoutPlan - A function that generates a workout plan.
 * - GenerateWorkoutPlanInput - The input type for the generateWorkoutPlan function.
 * - GenerateWorkoutPlanOutput - The return type for the generateWorkoutPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorkoutPlanInputSchema = z.object({
  fitnessLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user fitness level: beginner, intermediate, or advanced.'),
  goals: z.string().describe('The user fitness goals, e.g., lose weight, build muscle, improve endurance.'),
  equipment: z.string().describe('The equipment available to the user, e.g., dumbbells, resistance bands, bodyweight only.'),
});
export type GenerateWorkoutPlanInput = z.infer<typeof GenerateWorkoutPlanInputSchema>;

const GenerateWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.string().describe('The generated workout plan.'),
});
export type GenerateWorkoutPlanOutput = z.infer<typeof GenerateWorkoutPlanOutputSchema>;

export async function generateWorkoutPlan(input: GenerateWorkoutPlanInput): Promise<GenerateWorkoutPlanOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPlanPrompt',
  input: {schema: GenerateWorkoutPlanInputSchema},
  output: {schema: GenerateWorkoutPlanOutputSchema},
  prompt: `You are a personal trainer who will generate a workout plan based on the user's fitness level, goals, and available equipment.

  Fitness Level: {{{fitnessLevel}}}
  Goals: {{{goals}}}
  Equipment: {{{equipment}}}

  Generate a workout plan that is tailored to the user's fitness level, goals, and available equipment. Be specific with sets and reps.
  `,
});

const generateWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generateWorkoutPlanFlow',
    inputSchema: GenerateWorkoutPlanInputSchema,
    outputSchema: GenerateWorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

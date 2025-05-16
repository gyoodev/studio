'use server';

/**
 * @fileOverview Generates a personalized workout plan based on user input,
 * providing basic plans for free users and enhanced plans for paid users.
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
  isPaidUser: z.boolean().optional().describe('Flag indicating if the user has a paid subscription.'),
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
  prompt: `You are a personal trainer.
Fitness Level: {{{fitnessLevel}}}
Goals: {{{goals}}}
Equipment: {{{equipment}}}

{{#if isPaidUser}}
Generate a comprehensive, 7-day personalized workout plan. Include warm-ups, cool-downs, specific exercises with sets/reps, rest times, and tips for progression and variations. Make it highly detailed and actionable. Structure the plan clearly day by day.
{{else}}
Generate a basic, 3-day sample workout plan outline based on the user's information. Keep it general and brief, suitable as a teaser for the premium version.
{{/if}}
Workout Plan:
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

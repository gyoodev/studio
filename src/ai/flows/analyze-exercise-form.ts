'use server';

/**
 * @fileOverview Analyzes user exercise form using phone camera and MediaPipe Pose Tracking, 
 * providing basic feedback for free users and detailed feedback for paid users.
 *
 * - analyzeExerciseForm - A function that handles the exercise form analysis process.
 * - AnalyzeExerciseFormInput - The input type for the analyzeExerciseForm function.
 * - AnalyzeExerciseFormOutput - The return type for the analyzeExerciseForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeExerciseFormInputSchema = z.object({
  exerciseName: z.string().describe('The name of the exercise being performed.'),
  videoDataUri: z
    .string()
    .describe(
      "A video of the user performing the exercise, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' "
    ),
  isPaidUser: z.boolean().optional().describe('Flag indicating if the user has a paid subscription.'),
});
export type AnalyzeExerciseFormInput = z.infer<typeof AnalyzeExerciseFormInputSchema>;

const AnalyzeExerciseFormOutputSchema = z.object({
  feedback: z.string().describe('Real-time feedback on the user exercise form.'),
  isCorrectForm: z.boolean().describe('Whether the exercise form is correct or not.'),
});
export type AnalyzeExerciseFormOutput = z.infer<typeof AnalyzeExerciseFormOutputSchema>;

export async function analyzeExerciseForm(input: AnalyzeExerciseFormInput): Promise<AnalyzeExerciseFormOutput> {
  return analyzeExerciseFormFlow(input);
}

const analyzeExerciseFormPrompt = ai.definePrompt({
  name: 'analyzeExerciseFormPrompt',
  input: {schema: AnalyzeExerciseFormInputSchema},
  output: {schema: AnalyzeExerciseFormOutputSchema},
  prompt: `You are a certified personal trainer providing feedback on exercise form.
Analyze the user's exercise form based on the video provided.

Exercise Name: {{{exerciseName}}}
Video: {{media url=videoDataUri}}

{{#if isPaidUser}}
Provide detailed, actionable feedback. Cover multiple aspects of the form (e.g., posture, joint alignment, range of motion, tempo, muscle engagement). Highlight correct elements and pinpoint specific areas for improvement with clear, step-by-step instructions on how to correct them. Mention common mistakes related to this exercise and how to avoid them.
{{else}}
Provide general feedback on the user's exercise form, focusing on one or two main points for improvement or correctness. Indicate if the overall form is generally acceptable or needs significant work. Keep the feedback concise.
{{/if}}
`,
});

const analyzeExerciseFormFlow = ai.defineFlow(
  {
    name: 'analyzeExerciseFormFlow',
    inputSchema: AnalyzeExerciseFormInputSchema,
    outputSchema: AnalyzeExerciseFormOutputSchema,
  },
  async input => {
    const {output} = await analyzeExerciseFormPrompt(input);
    return output!;
  }
);

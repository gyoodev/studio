"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adaptWorkoutPlan, type AdaptWorkoutPlanInput, type AdaptWorkoutPlanOutput } from '@/ai/flows/adapt-workout-plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input'; // Keep for consistency, userId might be needed
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required.").default("user-default-id"), // Default or get from auth
  currentWorkoutPlan: z.string().min(20, "Please provide your current workout plan (min 20 characters).").max(2000),
  weeklyProgress: z.string().min(10, "Describe your weekly progress (min 10 characters).").max(1000),
  fitnessGoals: z.string().min(10, "Re-state or update your fitness goals (min 10 characters).").max(500),
  availableEquipment: z.string().min(3, "Confirm or update available equipment.").max(500),
});

type FormData = z.infer<typeof formSchema>;

export default function AdaptPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [adjustedPlan, setAdjustedPlan] = useState<AdaptWorkoutPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "user-default-id", // In a real app, this would come from auth state
      currentWorkoutPlan: "",
      weeklyProgress: "",
      fitnessGoals: "",
      availableEquipment: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setAdjustedPlan(null);
    try {
      const result = await adaptWorkoutPlan(data as AdaptWorkoutPlanInput);
      setAdjustedPlan(result);
      toast({
        title: "Workout Plan Adapted!",
        description: "Your workout plan has been updated based on your progress.",
      });
    } catch (error) {
      console.error("Error adapting workout plan:", error);
      toast({
        title: "Error",
        description: "Failed to adapt workout plan. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
           <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Adapt Your Workout Plan</CardTitle>
          </div>
          <CardDescription>Provide your current plan and progress, and AI will adjust it for optimal results.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Hidden UserID field for now, or could be sourced from auth context */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentWorkoutPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Workout Plan</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Paste or describe your current weekly workout schedule." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeklyProgress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Progress & Feedback</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Exercises felt too easy/hard, specific achievements, pain points." {...field} />
                    </FormControl>
                    <FormDescription>How did your workouts go this week? Any challenges or successes?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="fitnessGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Fitness Goals</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., focus on strength for upper body, improve cardio for 5k." {...field} />
                    </FormControl>
                     <FormDescription>Are your goals still the same, or have they shifted?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableEquipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Equipment</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., dumbbells, resistance bands, bodyweight only" {...field} />
                    </FormControl>
                    <FormDescription>Has your access to equipment changed?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full shadow-md">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Adapt My Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Adapting your plan...</p>
        </div>
      )}

      {adjustedPlan && (
        <Card className="mt-8 max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Your Adjusted Workout Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm font-mono">{adjustedPlan.adjustedWorkoutPlan}</pre>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">
              This plan is AI-adjusted. Always listen to your body and consult a professional if needed.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

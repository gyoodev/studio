
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateWorkoutPlan, type GenerateWorkoutPlanInput, type GenerateWorkoutPlanOutput } from '@/ai/flows/generate-workout-plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Input } from '@/components/ui/input'; // No longer using Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Link from 'next/link';

const formSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: "Fitness level is required.",
  }),
  goals: z.string().min(10, "Please describe your goals in at least 10 characters.").max(500),
  equipment: z.string().min(3, "Please list available equipment (e.g., bodyweight, dumbbells).").max(500),
});

type FormData = z.infer<typeof formSchema>;

export default function GeneratePlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<GenerateWorkoutPlanOutput | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: "",
      equipment: "",
    },
  });

  // Reset form if user logs out/changes or on initial load if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      form.reset();
      setWorkoutPlan(null);
    }
  }, [user, authLoading, form]);


  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) { // Should not happen due to AuthGuard, but good as a fallback
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a workout plan.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setWorkoutPlan(null);

    const isPaidUser = user.subscriptionPlan !== 'free' && user.subscriptionStatus === 'active';

    try {
      const input: GenerateWorkoutPlanInput = {
        ...data,
        isPaidUser,
      };
      const result = await generateWorkoutPlan(input);
      setWorkoutPlan(result);
      toast({
        title: "Workout Plan Generated!",
        description: "Your personalized workout plan is ready.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error generating workout plan:", error);
      toast({
        title: "Error Generating Plan",
        description: (error as Error).message || "Failed to generate workout plan. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };
  
  // AuthGuard will handle displaying a loader or redirecting to login if user/authLoading state is not ready
  // This explicit loading check is mostly for initial render before AuthGuard kicks in fully or if AuthGuard logic changes.
  if (authLoading && !user) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // AuthGuard handles the redirection, but we can show a specific message if preferred.
  // However, AuthGuard usually redirects before this point.
  // This is more of a conceptual placeholder if AuthGuard wasn't used.
  if (!user && !authLoading) {
     return (
        <div className="container py-12 text-center">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You need to be logged in to generate a workout plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login?redirect=/generate-plan">Log In to Continue</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Generate Your Workout Plan</CardTitle>
            </div>
            <CardDescription>Fill in your details below, and our AI will create a personalized workout plan for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your fitness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Goals</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., lose weight, build muscle, improve endurance" {...field} />
                      </FormControl>
                      <FormDescription>Describe your primary fitness objectives.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Equipment</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., dumbbells, resistance bands, bodyweight only" {...field} />
                      </FormControl>
                      <FormDescription>List the equipment you have access to.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || authLoading} className="w-full shadow-md">
                  {(isLoading || authLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  Generate Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Generating your plan...</p>
          </div>
        )}

        {workoutPlan && (
          <Card className="mt-8 max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Your Personalized Workout Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm font-mono">{workoutPlan.workoutPlan}</pre>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                This plan is AI-generated. Consult with a professional before starting any new workout routine.
                {(user && user.subscriptionPlan === 'free') && " Upgrade to a paid plan for more detailed and comprehensive workout plans!"}
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

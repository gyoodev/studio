
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, AlertCircle, Chrome } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50).optional().or(z.literal('')),
  email: z.string().email("Invalid email address. Please enter a valid email.").min(1, "Email is required."),
  password: z.string().min(6, "Password must be at least 6 characters.").min(1, "Password is required."),
});

type FormData = z.infer<typeof formSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signUpWithEmail, signInWithGoogle, error: authError } = useAuth(); 
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    const user = await signUpWithEmail(data.email, data.password, data.displayName || undefined); 
    setIsLoading(false);
    if (user) {
      toast({
        title: "Signup Successful!",
        description: `Welcome to FlexFit AI, ${user.displayName || user.email}!`,
      });
      router.push('/'); 
    } else {
      // authError from context will be displayed
      toast({
        title: "Signup Failed",
        description: authError || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const user = await signInWithGoogle(); // Same function for sign-in/sign-up
    setIsGoogleLoading(false);
    if (user) {
      toast({
        title: "Google Sign-Up Successful!",
        description: `Welcome to FlexFit AI, ${user.displayName || user.email}!`,
      });
      router.push('/');
    } else {
       toast({
        title: "Google Sign-Up Failed",
        description: authError || "Could not sign up with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full shadow-xl border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-foreground">Create Your FlexFit AI Account</CardTitle>
        <CardDescription className="text-center text-muted-foreground">Join us to get personalized fitness plans and track your progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your Name" 
                      {...field} 
                      className="bg-input text-foreground placeholder:text-muted-foreground/70"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      {...field} 
                      className="bg-input text-foreground placeholder:text-muted-foreground/70"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="bg-input text-foreground placeholder:text-muted-foreground/70"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {authError && (
              <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>{authError}</span>
              </div>
            )}
            <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full shadow-md">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Sign Up
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignUp} 
          disabled={isLoading || isGoogleLoading} 
          className="w-full shadow-md"
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
          Sign up with Google
        </Button>

      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 pt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto text-primary hover:text-accent">
            <Link href="/login">Log in</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}


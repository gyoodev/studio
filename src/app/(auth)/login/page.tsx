
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, AlertCircle, Chrome } from 'lucide-react'; 

const formSchema = z.object({
  email: z.string().email("Invalid email address. Please enter a valid email.").min(1, "Email is required."),
  password: z.string().min(6, "Password must be at least 6 characters.").min(1, "Password is required."),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle, error: authError } = useAuth(); 
  const router = useRouter();
  const searchParams = useSearchParams(); // Added
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    const user = await signInWithEmail(data.email, data.password);
    setIsLoading(false);
    if (user) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.displayName || user.email}!`,
        variant: "success", // Changed to success
      });
      const redirectUrl = searchParams.get('redirect'); // Added
      router.push(redirectUrl || '/'); // Added redirect logic
    } else {
      toast({
        title: "Login Failed",
        description: authError || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const user = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (user) {
      toast({
        title: "Google Sign-In Successful",
        description: `Welcome, ${user.displayName || user.email}!`,
        variant: "success", // Changed to success
      });
      const redirectUrl = searchParams.get('redirect'); // Added
      router.push(redirectUrl || '/'); // Added redirect logic
    } else {
      toast({
        title: "Google Sign-In Failed",
        description: authError || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full shadow-xl border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-foreground">Log In to FlexFit AI</CardTitle>
        <CardDescription className="text-center text-muted-foreground">Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            {authError && !form.formState.isSubmitSuccessful && ( // Show authError only if submission wasn't successful yet
              <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>{authError}</span>
              </div>
            )}
            <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full shadow-md">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Log In
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignIn} 
          disabled={isLoading || isGoogleLoading} 
          className="w-full shadow-md"
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
          Sign in with Google
        </Button>

      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 pt-6">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto text-primary hover:text-accent">
            <Link href="/signup">Sign up</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}

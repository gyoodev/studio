
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, LogIn, UserPlus, AlertCircle, CheckCircle, ShoppingCart, Send, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Added Firestore imports
import { db } from '@/lib/firebase'; // Added db import

// Placeholder for plan details - in a real app, this might come from a config or DB
const PLAN_DETAILS: Record<string, { name: string; price: string }> = {
  premium: { name: "Premium Plan", price: "$14.99/month" },
  platinum: { name: "Platinum Plan", price: "$24.99/month" },
  diamond: { name: "Diamond Plan", price: "$39.99/month" },
};

function SubscribePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, fetchUserProfile } = useAuth(); // Added fetchUserProfile
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<{ name: string; price: string } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan && PLAN_DETAILS[plan]) {
      setSelectedPlan(plan);
      setPlanDetails(PLAN_DETAILS[plan]);
    } else if (plan) {
      toast({
        title: "Invalid Plan",
        description: "The selected subscription plan is not recognized.",
        variant: "destructive",
      });
      router.push('/pricing');
    } else {
        // If no plan is in query params, redirect to pricing.
        router.push('/pricing');
    }
  }, [searchParams, router, toast]);

  const handleMockPayment = async (method: string) => {
    if (!user || !selectedPlan || !planDetails) {
      toast({
        title: "Error",
        description: "User or plan details are missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    toast({
      title: "Processing Payment...",
      description: `Attempting to pay for ${planDetails.name} with ${method}. This is a mock action.`,
    });

    // Simulate payment processing
    setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const buyDate = serverTimestamp();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // Mock 30-day subscription

        const subscriptionData = {
          subscriptionPlan: selectedPlan,
          subscriptionStatus: "active",
          subscriptionBuyDate: buyDate,
          subscriptionExpiryDate: expiryDate,
        };

        await updateDoc(userDocRef, subscriptionData);
        
        // Refresh user profile data in AuthContext to get new subscription info
        if (auth.currentUser) { // Ensure currentUser is available
          await fetchUserProfile(auth.currentUser);
        }


        toast({
          title: "Subscription Activated (Mock)",
          description: `Your ${planDetails.name} has been activated using ${method}! Your profile is updated.`,
          variant: "success",
        });
        router.push('/profile'); 
      } catch (error) {
        console.error("Error updating subscription status in DB:", error);
        toast({
          title: "Database Update Failed",
          description: "Could not update your subscription status. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2000);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedPlan || !planDetails) {
    return (
      <div className="container py-12 text-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle>No Plan Selected</CardTitle>
            <CardDescription>Please select a subscription plan to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-12">
        <Card className="max-w-lg mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Access Your Subscription</CardTitle>
            <CardDescription className="text-center">
              You're about to subscribe to the <strong>{planDetails.name}</strong> ({planDetails.price}).
              Please log in or create an account to complete your purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full shadow-md" size="lg">
              <Link href={`/login?redirect=/subscribe?plan=${selectedPlan}`}>
                <LogIn className="mr-2 h-5 w-5" /> Log In to Subscribe
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full shadow-md" size="lg">
              <Link href={`/signup?redirect=/subscribe?plan=${selectedPlan}`}>
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up for {planDetails.name}
              </Link>
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Secure checkout. Your progress will be saved.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card className="max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Confirm Your Subscription</CardTitle>
          </div>
          <CardDescription>
            You are subscribing to the <strong>{planDetails.name}</strong> for <strong>{planDetails.price}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Subscriber Information</h3>
            <p className="text-sm text-muted-foreground">Email: {user.email}</p>
            {user.displayName && <p className="text-sm text-muted-foreground">Name: {user.displayName}</p>}
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Select Payment Method</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => handleMockPayment('Google Pay')} 
                className="w-full justify-start shadow-md hover:shadow-lg transition-shadow" 
                variant="outline"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-5 w-5 text-green-500" />} 
                Pay with Google Pay
              </Button>
              <Button 
                onClick={() => handleMockPayment('PayPal')} 
                className="w-full justify-start shadow-md hover:shadow-lg transition-shadow" 
                variant="outline"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-5 w-5 text-blue-600" />}
                 Pay with PayPal
              </Button>
              <Button 
                onClick={() => handleMockPayment('Revolut')} 
                className="w-full justify-start shadow-md hover:shadow-lg transition-shadow" 
                variant="outline"
                disabled={isProcessingPayment}
              >
                 {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5 text-purple-500" />}
                 Pay with Revolut / Card
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Note: This is a demonstration. No real payment will be processed. Clicking a button will simulate a successful subscription and update your profile.
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex-col items-start space-y-2 text-xs text-muted-foreground pt-6 border-t">
          <p>By clicking "Pay", you agree to our Terms of Service and Privacy Policy.</p>
          <p>Your subscription will auto-renew monthly. You can cancel anytime from your profile.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <SubscribePageContent />
    </Suspense>
  );
}

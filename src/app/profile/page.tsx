
"use client";

import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserCircle2, Mail, Edit3, CreditCard, ShieldCheck, Dumbbell, Salad, ChevronRight, Sparkles, CalendarDays, XCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';

// Helper function to format Firestore Timestamp or JS Date to a readable string
const formatDate = (dateInput: Timestamp | Date | null | undefined): string => {
  if (!dateInput) return 'N/A';
  const jsDate = dateInput instanceof Timestamp ? dateInput.toDate() : dateInput;
  return jsDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <Card className="max-w-xl mx-auto shadow-xl border-border">
          <CardHeader className="items-center text-center p-6">
            <Skeleton className="h-28 w-28 rounded-full mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
             <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <Separator className="my-6" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-48 mt-1" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
             <Separator className="my-6" />
             <div className="space-y-3">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="container py-12 text-center">
             <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You need to be logged in to view your profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login?redirect=/profile">Log In to Continue</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?');

  const currentSubscriptionPlan = user.subscriptionPlan || "free";
  const currentSubscriptionStatus = user.subscriptionStatus || "inactive";
  const isSubscriptionActive = currentSubscriptionStatus === "active" && currentSubscriptionPlan !== "free";

  return (
    <AuthGuard>
      <div className="container py-8 md:py-12">
        <Card className="max-w-xl mx-auto shadow-xl border-border">
          <CardHeader className="items-center text-center p-6">
             <Avatar className="h-28 w-28 mb-4 text-4xl border-2 border-primary/50 shadow-md">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} data-ai-hint="profile avatar" />
              <AvatarFallback className="bg-muted">{userInitial}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold flex items-center">
                {user.displayName || 'User Profile'}
                {isSubscriptionActive && <Sparkles className="ml-2 h-6 w-6 text-accent" />}
            </CardTitle>
            <CardDescription>Manage your personal information, subscription, and resources.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* User Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <UserCircle2 className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                  <p className="text-lg break-all">{user.displayName || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg break-all">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full shadow-sm" disabled>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Coming Soon)
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Subscription Management */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground/90">Subscription</h3>
              <div className="p-4 bg-card border rounded-lg shadow-sm space-y-3">
                <div className="flex items-center space-x-3">
                    {isSubscriptionActive ? 
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" /> :
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    }
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                        <p className={`text-lg font-semibold capitalize ${isSubscriptionActive ? 'text-accent' : 'text-destructive'}`}>{currentSubscriptionPlan}</p>
                    </div>
                </div>
                 {user.subscriptionStatus === "active" && user.subscriptionExpiryDate && (
                    <div className="flex items-center space-x-3 text-sm">
                        <CalendarDays className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div>
                            <p className="font-medium text-muted-foreground">Renews/Expires On:</p>
                            <p>{formatDate(user.subscriptionExpiryDate)}</p>
                        </div>
                    </div>
                )}
                 {user.subscriptionStatus !== "active" && currentSubscriptionPlan === "free" && (
                    <p className="text-sm text-muted-foreground">Upgrade to unlock premium features!</p>
                 )}
                <Button asChild className="w-full shadow-md" variant={isSubscriptionActive ? "outline" : "default"}>
                  <Link href="/pricing">
                    <CreditCard className="mr-2 h-4 w-4" /> 
                    {isSubscriptionActive ? 'Manage Subscription' : 'View Plans & Upgrade'}
                  </Link>
                </Button>
              </div>
            </div>
            
            <Separator className="my-6" />

            {/* My Resources */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground/90">My Resources</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between items-center shadow-sm" disabled>
                    <div className="flex items-center">
                        <Dumbbell className="mr-2 h-5 w-5 text-primary/80" /> My Training Plans
                    </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="outline" className="w-full justify-between items-center shadow-sm" disabled>
                     <div className="flex items-center">
                        <Salad className="mr-2 h-5 w-5 text-primary/80" /> My Diet Guides
                    </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 border-t">
            <p className="text-xs text-muted-foreground text-center w-full">
                For support, contact help@flexfit.ai
            </p>
          </CardFooter>
        </Card>
      </div>
    </AuthGuard>
  );
}


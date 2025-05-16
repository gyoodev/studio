
"use client";

import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserCircle2, Mail, Edit3, CreditCard, ShieldCheck, Dumbbell, Salad, ChevronRight, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-12">
        <Card className="max-w-lg mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <Separator className="my-6" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
            <Separator className="my-6" />
             <div className="space-y-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    // AuthGuard should handle redirection, but this is a fallback.
    return (
        <div className="container py-12 text-center">
            <p>Please log in to view your profile.</p>
            <Button asChild className="mt-4">
                <Link href="/login">Log In</Link>
            </Button>
        </div>
    );
  }
  
  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?');

  // Placeholder for subscription status - in a real app, this would come from your backend/DB
  const currentSubscription = "Free Tier"; 
  const hasActiveSubscription = currentSubscription !== "Free Tier";

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
                {hasActiveSubscription && <Sparkles className="ml-2 h-6 w-6 text-accent" />}
            </CardTitle>
            <CardDescription>Manage your personal information, subscription, and resources.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* User Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <UserCircle2 className="h-6 w-6 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                  <p className="text-lg">{user.displayName || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-6 w-6 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{user.email}</p>
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
                    <ShieldCheck className={`h-6 w-6 ${hasActiveSubscription ? 'text-accent' : 'text-muted-foreground'}`} />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                        <p className={`text-lg font-semibold ${hasActiveSubscription ? 'text-accent' : ''}`}>{currentSubscription}</p>
                    </div>
                </div>
                <Button asChild className="w-full shadow-md" variant={hasActiveSubscription ? "outline" : "default"}>
                  <Link href="/pricing">
                    <CreditCard className="mr-2 h-4 w-4" /> 
                    {hasActiveSubscription ? 'Manage Subscription' : 'View Plans & Upgrade'}
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

  
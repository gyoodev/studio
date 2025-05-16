
"use client";

import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserCircle2, Mail, Edit3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link'; // Added Link for edit profile button (future use)

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
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
             <Skeleton className="h-10 w-32 mt-4" />
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

  return (
    <AuthGuard>
      <div className="container py-12">
        <Card className="max-w-lg mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
             <Avatar className="h-24 w-24 mb-4 text-3xl">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} data-ai-hint="profile avatar" />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold">{user.displayName || 'User Profile'}</CardTitle>
            <CardDescription>Manage your personal information and settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-3">
              <UserCircle2 className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                <p className="text-lg">{user.displayName || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
            {/* UID can be sensitive, decide if it should be shown
            <div className="flex items-center space-x-3">
              <Fingerprint className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm text-muted-foreground">{user.uid}</p>
              </div>
            </div>
            */}
            <Button variant="outline" className="w-full mt-4 shadow-md" disabled>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}


"use client"; // Required for useAuth hook and Sheet interactions

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlexAIFitLogo } from '@/components/icons/FlexAIFitLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Menu, LogOut, UserCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added Avatar

const baseNavItems = [
  { href: '/generate-plan', label: 'Generate Plan' },
  { href: '/adapt-plan', label: 'Adapt Plan' },
  { href: '/form-check', label: 'Form Check' },
  { href: '/challenges', label: 'Challenges' },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/'); // Redirect to home after logout
  };
  
  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '');

  const navItems = user 
    ? [...baseNavItems, { href: '/profile', label: 'Profile' }]
    : baseNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <FlexAIFitLogo className="h-8 w-auto" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons / User Info */}
        <div className="hidden md:flex items-center space-x-3 ml-auto">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-md" /> // Skeleton for loading state
          ) : user ? (
            <>
              <Button variant="ghost" asChild className="p-0 h-auto">
                 <Link href="/profile" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 text-xs">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ""} data-ai-hint="profile avatar" />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <span>{user.displayName || user.email?.split('@')[0]}</span>
                  </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="shadow-sm">
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" /> Log In
                </Link>
              </Button>
              <Button size="sm" asChild className="shadow-sm">
                <Link href="/signup">
                  <UserPlus className="mr-1.5 h-4 w-4" /> Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex flex-1 items-center justify-end space-x-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              
              <nav className="flex flex-col space-y-3 mt-8 flex-grow">
                <Link href="/" className="mb-4">
                   <SheetClose asChild>
                    <FlexAIFitLogo className="h-8 w-auto" />
                   </SheetClose>
                </Link>
                {navItems.map((item) => (
                   <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="rounded-md p-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* Mobile Auth Buttons / User Info */}
              <div className="mt-auto border-t pt-4">
                {loading ? (
                  <div className="h-10 w-full animate-pulse bg-muted rounded-md mb-2" />
                ) : user ? (
                  <div className="space-y-3">
                     <SheetClose asChild>
                      <Button variant="ghost" asChild className="w-full justify-start p-2 text-base">
                        <Link href="/profile" className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 text-xs">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ""} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                          </Avatar>
                          <span>{user.displayName || user.email?.split('@')[0]}</span>
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="outline" onClick={handleLogout} className="w-full shadow-sm">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">
                          <LogIn className="mr-2 h-4 w-4" />Log In
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full shadow-sm">
                        <Link href="/signup">
                         <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

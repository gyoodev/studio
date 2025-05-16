
"use client"; 

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FlexFitAILogo } from '@/components/icons/FlexFitAILogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose, SheetHeader } from '@/components/ui/sheet';
import { Menu, LogOut, UserCircle, LogIn, UserPlus, DollarSign, Home, Bot, RefreshCw, VideoIcon, UsersIcon } from 'lucide-react'; 
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

const allNavItems = [
  { href: '/', label: 'Home', icon: Home, authRequired: false },
  { href: '/generate-plan', label: 'Generate Plan', icon: Bot, authRequired: false },
  { href: '/adapt-plan', label: 'Adapt Plan', icon: RefreshCw, authRequired: true },
  { href: '/form-check', label: 'Form Check', icon: VideoIcon, authRequired: false },
  { href: '/challenges', label: 'Challenges', icon: UsersIcon, authRequired: false },
  { href: '/pricing', label: 'Pricing', icon: DollarSign, authRequired: false },
  // Profile link is handled separately below if user is authenticated
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '');

  // Filter nav items based on auth status
  let navItems = allNavItems.filter(item => !item.authRequired || (item.authRequired && user));
  // Add Profile link if user is authenticated
  if (user) {
    navItems.push({ href: '/profile', label: 'Profile', icon: UserCircle, authRequired: true });
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-bl-xl rounded-br-xl">
      <div className="container flex h-16 items-center justify-between relative">
        {/* Left Side: Plans Icon Button */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild aria-label="View Pricing Plans">
            <Link href="/pricing">
              <DollarSign className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" aria-label="FlexFit AI Homepage">
            <FlexFitAILogo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Right Side: Navigation Sheet Trigger */}
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open Navigation Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[320px] flex flex-col p-0 rounded-bl-xl rounded-br-xl">
              <SheetHeader className="p-4 border-b">
                <div className="flex justify-between items-center">
                   <SheetClose asChild> 
                    <Link href="/" className="flex items-center space-x-2">
                      <FlexFitAILogo className="h-7 w-auto" />
                    </Link>
                  </SheetClose>
                </div>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col space-y-1 p-4 flex-grow overflow-y-auto">
                {navItems.map((item) => (
                   <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md p-3 text-base font-medium transition-colors flex items-center gap-3 hover:bg-muted",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-foreground hover:text-accent-foreground"
                      )}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* Auth Controls / User Info */}
              <div className="mt-auto border-t p-4 space-y-3">
                {loading ? (
                  <div className="h-10 w-full animate-pulse bg-muted rounded-md mb-2" />
                ) : user ? (
                  <>
                     <SheetClose asChild>
                      <Button variant="ghost" asChild className="w-full justify-start p-2 text-base rounded-md hover:bg-muted">
                        <Link href="/profile" className="flex items-center space-x-2">
                          <Avatar className="h-9 w-9 text-sm">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ""} data-ai-hint="profile avatar" />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{user.displayName || user.email?.split('@')[0]}</span>
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="outline" onClick={handleLogout} className="w-full shadow-sm">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

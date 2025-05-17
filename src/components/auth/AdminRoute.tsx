"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Assuming your AuthContext is here
import { useRouter } from 'next/navigation'; // Using next/navigation for App Router

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, role } = useAuth(); // Assuming useAuth provides user, loading, and role
  const router = useRouter();

  useEffect(() => {
    // Redirect if not loading, no user, or user is not admin
    if (!loading && (!user || role !== 'admin')) {
      router.push('/'); // Redirect to homepage or login page
    }
  }, [user, loading, role, router]); // Depend on user, loading, role, and router

  // Render children only if user is authenticated and is admin
  // You might want to show a loading spinner while loading
  if (loading || !user || role !== 'admin') {
    return null; // Or a loading spinner component
  }

  return <>{children}</>;
};

export default AdminRoute;

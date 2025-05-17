"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    // You might want to show a loading spinner or null while checking authentication
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
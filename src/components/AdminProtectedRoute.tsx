'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { useFirebase } from '@/contexts/FirebaseContext';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useFirebase();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();

  const isLoading = authLoading || adminLoading;

  useEffect(() => {
    if (isLoading) {
      return; // Still loading, don't redirect yet
    }

    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
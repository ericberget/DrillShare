'use client';

import { useEffect, ReactNode } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { Loader, Shield } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useFirebase();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        router.push('/auth/signin');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, router]);

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 
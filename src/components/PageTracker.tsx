'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
import { trackPageView, setUserAnalytics } from '@/lib/analytics';

export default function PageTracker() {
  const pathname = usePathname();
  const { user } = useFirebase();

  useEffect(() => {
    // Set user analytics properties when user changes
    if (user) {
      setUserAnalytics(user.uid, user.email || '');
    }
  }, [user]);

  useEffect(() => {
    // Track page view when pathname changes
    const trackCurrentPage = async () => {
      const title = document.title || 'DrillShare';
      await trackPageView(
        pathname,
        title,
        user?.uid,
        user?.email || undefined
      );
    };

    // Only track if we're not in an admin route to avoid tracking admin activity
    if (!pathname.startsWith('/admin')) {
      trackCurrentPage();
    }
  }, [pathname, user]);

  return null; // This component doesn't render anything
} 
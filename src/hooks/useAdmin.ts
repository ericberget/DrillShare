'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';

export function useAdmin() {
  const { user, db, loading: authLoading } = useFirebase();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    // We should only check the admin status once the auth state is fully resolved.
    if (authLoading) {
      return;
    }

    // If there's no user after auth has loaded, they are not an admin.
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      hasChecked.current = true;
      return;
    }
    
    // If we've already checked, don't re-check unless the user changes.
    // This prevents the flicker when the user object is momentarily null.
    if (hasChecked.current) {
        setLoading(false);
        return;
    }

    const checkAdminStatus = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        console.log(`[useAdmin] Checking admin status for user UID: ${user.uid}`);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('[useAdmin] User document found:', userData);
          setIsAdmin(userData.isAdmin === true);
        } else {
          console.log('[useAdmin] User document not found.');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        hasChecked.current = true;
      }
    };

    checkAdminStatus();
  }, [user, db, authLoading]);

  return { isAdmin, loading };
} 
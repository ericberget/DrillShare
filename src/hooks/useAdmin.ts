'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';

export function useAdmin() {
  const { user, db } = useFirebase();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !db) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user document exists and has admin flag
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, db]);

  return { isAdmin, loading };
} 
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChange, storage, db } from '@/lib/firebase';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

export type FirebaseContextType = {
  user: User | null;
  loading: boolean;
  db: Firestore;
  storage: FirebaseStorage | null;
};

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  db: db,
  storage: null
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      loading,
      db: db,
      storage
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}; 
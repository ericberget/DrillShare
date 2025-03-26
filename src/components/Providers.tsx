'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { CollectionProvider } from '@/contexts/CollectionContext';
import { ToastProvider } from '@/contexts/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
  // Seed the database with sample content on initial load
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        const response = await fetch('/api/seed');
        const data = await response.json();
        console.log('Database seed result:', data);
      } catch (error) {
        console.error('Error seeding database:', error);
      }
    };

    seedDatabase();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <FirebaseProvider>
          <ContentProvider>
            <CollectionProvider>
              <AuthProvider>
                <Navbar />
                {children}
              </AuthProvider>
            </CollectionProvider>
          </ContentProvider>
        </FirebaseProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 
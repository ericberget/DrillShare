'use client';

import { ThemeProvider } from 'next-themes';
import { Navbar } from '@/components/Navbar';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { CollectionProvider } from '@/contexts/CollectionContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { PlayerAnalysisProvider } from '@/contexts/PlayerAnalysisContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <FirebaseProvider>
          <ContentProvider>
            <CollectionProvider>
              <PlayerAnalysisProvider>
                <Navbar />
                {children}
              </PlayerAnalysisProvider>
            </CollectionProvider>
          </ContentProvider>
        </FirebaseProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 
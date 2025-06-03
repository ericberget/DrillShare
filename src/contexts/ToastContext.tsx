'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toast } from '@/components/ui/toast';

type ToastVariant = 'default' | 'success' | 'error' | 'loading';

interface ToastState {
  message: string;
  variant: ToastVariant;
  open: boolean;
  loading?: boolean;
  duration?: number;
}

export type ToastContextType = {
  showToast: (message: string, variant?: ToastVariant, duration?: number, loading?: boolean) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    variant: 'default',
    open: false,
    loading: false,
    duration: 3000,
  });

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const showToast = useCallback((
    message: string, 
    variant: ToastVariant = 'default', 
    duration = 3000,
    loading = false
  ) => {
    // Hide any existing toast first
    setToast((prev) => ({ ...prev, open: false }));
    
    // Show new toast after a small delay to ensure animation
    setTimeout(() => {
      setToast({
        message,
        variant,
        open: true,
        loading,
        duration,
      });
    }, 100);
  }, []);

  // Auto-hide toast after duration
  useEffect(() => {
    if (toast.open && toast.duration && !toast.loading) {
      const timer = setTimeout(() => {
        hideToast();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast 
        variant={toast.variant} 
        open={toast.open} 
        onClose={hideToast}
        loading={toast.loading}
      >
        {toast.message}
      </Toast>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 
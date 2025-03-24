import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ContentLoaderProps {
  message?: string;
}

export function ContentLoader({ message = 'Loading content...' }: ContentLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
} 
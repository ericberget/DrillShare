'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MainMenu } from '@/components/MainMenu';
import { useFirebase } from '@/contexts/FirebaseContext';

export default function DashboardPage() {
  const { user } = useFirebase();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <div className="w-full max-w-[300px] md:max-w-[500px] mx-auto mb-8">
              <img 
                src="/logo.png" 
                alt="DrillShare Logo" 
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-100">
                Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
              </h1>
              <p className="text-slate-400 text-xl">
                Your baseball training content hub
              </p>
            </div>
          </div>

          {/* Main Menu */}
          <MainMenu />
        </div>
      </div>
    </ProtectedRoute>
  );
} 
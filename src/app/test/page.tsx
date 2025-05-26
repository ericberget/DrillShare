'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="p-8 min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-emerald-400 mb-8">Style Test Page</h1>
      
      <Card className="max-w-md w-full mb-4 bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-emerald-400">Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">This is a test card to verify styling is working correctly.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Test Button</Button>
        </CardContent>
      </Card>
    </div>
  );
} 
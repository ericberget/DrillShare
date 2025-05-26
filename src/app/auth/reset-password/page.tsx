'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading, error } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      // Error is handled by useAuth hook
      console.error('Password reset error:', error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950/90">
        <Card className="w-[400px] bg-slate-900/95 border-slate-800/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-400">Check Your Email</CardTitle>
            <CardDescription className="text-slate-400">
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 text-center">
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </p>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              asChild
            >
              <Link href="/auth/signin">
                Return to Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/90">
      <Card className="w-[400px] bg-slate-900/95 border-slate-800/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-400">Reset Password</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded">
                {error.message}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-400">
            Remember your password?{' '}
            <Link href="/auth/signin" className="text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 
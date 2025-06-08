'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const BackgroundVideo = () => {
  return (
    <div className="fixed inset-0 w-full h-full">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
        style={{ filter: 'grayscale(100%) brightness(0.5)' }}
      >
        <source src="/bg-catch.MOV" type="video/mp4" />
        <source src="/bg-catch.MOV" type="video/quicktime" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/70" />
    </div>
  );
};

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, loading, error } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <BackgroundVideo />
      <Card className="w-[400px] bg-slate-900/95 border-white/30 relative z-10 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-drillhub-400">Welcome to DrillShare</CardTitle>
          <CardDescription className="text-slate-400">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100"
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
              className="w-full bg-drillhub-600 hover:bg-drillhub-700 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in with Email'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full bg-white hover:bg-gray-100 text-gray-900"
            onClick={() => signInWithGoogle()}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Continue with Google
          </Button>

          <div className="text-center">
            <Link 
              href="/auth/reset-password" 
              className="text-sm text-drillhub-400 hover:text-drillhub-300"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-drillhub-400 hover:text-drillhub-300">
              Sign up
            </Link>
          </div>
          <div className="text-sm">
            <Link href="/auth/reset-password" className="text-drillhub-400 hover:text-drillhub-300">
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
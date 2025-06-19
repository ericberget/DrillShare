'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Shield } from 'lucide-react';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const makeAdmin = async () => {
    if (!email || !adminSecret) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, adminSecret }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to make user admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-500/20 rounded-full p-3">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-white">Admin Setup</CardTitle>
          <CardDescription className="text-slate-400">
            Grant admin access to a user account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-300">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div>
            <Label htmlFor="secret" className="text-slate-300">Admin Secret</Label>
            <Input
              id="secret"
              type="password"
              placeholder="Enter admin secret"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <Button 
            onClick={makeAdmin} 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Making Admin...
              </>
            ) : (
              'Make Admin'
            )}
          </Button>

          {error && (
            <Alert className="border-red-500 bg-red-950/50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="border-green-500 bg-green-950/50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-300">
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          {result?.user && (
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">User Details:</h3>
              <div className="text-slate-300 text-sm space-y-1">
                <div><strong>Email:</strong> {result.user.email}</div>
                <div><strong>Name:</strong> {result.user.displayName}</div>
                <div><strong>UID:</strong> {result.user.uid}</div>
                <div><strong>Admin:</strong> {result.user.isAdmin ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          <div className="text-center">
            <a 
              href="/admin" 
              className="text-emerald-400 hover:text-emerald-300 text-sm"
            >
              Go to Admin Dashboard →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
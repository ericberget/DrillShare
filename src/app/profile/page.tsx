'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from '@/lib/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && auth.currentUser) {
      setFormData(prev => ({
        ...prev,
        displayName: auth.currentUser?.displayName || '',
        email: auth.currentUser?.email || ''
      }));
    }
  }, [status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      // Update display name if changed
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }

      // Update email if changed
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await updatePassword(user, formData.newPassword);
      }

      setSuccess('Profile updated successfully');
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950/90">
        <div className="text-emerald-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/90">
      <Card className="w-[600px] bg-slate-900/95 border-slate-800/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-400">Profile Settings</CardTitle>
          <CardDescription className="text-slate-400">
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-200">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-emerald-400">Change Password</h3>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-200">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="text-emerald-500 text-sm p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                {success}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
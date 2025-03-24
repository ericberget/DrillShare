'use client';

import { useState } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStorage } from '@/hooks/useStorage';
import { ImageUpload } from '@/components/ImageUpload';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfileSettings() {
  const { user } = useFirebase();
  const { updateProfile } = useAuth();
  const { uploadFile, progress, error } = useStorage();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateProfile({ displayName });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageSelected = async (file: File) => {
    if (!user) return;
    setIsUploading(true);
    
    try {
      // Create a unique path for the user's profile picture
      const path = `profile-pictures/${user.uid}/${file.name}`;
      
      // Upload the file and get the download URL
      const downloadURL = await uploadFile(file, path);
      
      // Update the user's profile with the new photo URL
      if (downloadURL) {
        await updateProfile({ photoURL: downloadURL });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <ImageUpload
                  currentImageUrl={user?.photoURL}
                  onImageSelected={handleImageSelected}
                  uploading={isUploading}
                  progress={progress}
                />
                {error && (
                  <p className="text-sm text-red-500 mt-2">
                    Error uploading image: {error.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-950"
                />
                <p className="text-xs text-slate-400">Email cannot be changed directly. Use your authentication provider to update.</p>
              </div>

              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdating || displayName === user?.displayName}
                className="mt-4"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Security Section */}
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start text-left">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
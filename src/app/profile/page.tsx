'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStorage } from '@/hooks/useStorage';
import { ImageUpload } from '@/components/ImageUpload';
import ProtectedRoute from '@/components/ProtectedRoute';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function ProfileSettings() {
  const { user, db, storage } = useFirebase();
  const { updateProfile } = useAuth();
  const { uploadFile, progress, error } = useStorage();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Team info state
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  const [teamLogoFile, setTeamLogoFile] = useState<File | null>(null);
  const [teamLogoPreview, setTeamLogoPreview] = useState<string | null>(null);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [isUploadingTeamLogo, setIsUploadingTeamLogo] = useState(false);

  // Load team information on component mount
  useEffect(() => {
    const loadTeamInfo = async () => {
      if (!user || !db) return;
      
      try {
        const programDoc = await getDoc(doc(db, 'programs', user.uid));
        if (programDoc.exists()) {
          const data = programDoc.data();
          setTeamName(data.name || '');
          setTeamLogo(data.logo || '');
          setTeamLogoPreview(data.logo || null);
        }
      } catch (error) {
        console.error('Error loading team info:', error);
      }
    };

    loadTeamInfo();
  }, [user, db]);

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

  const handleTeamLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTeamLogoFile(file);
      const url = URL.createObjectURL(file);
      setTeamLogoPreview(url);
    }
  };

  const handleRemoveTeamLogo = () => {
    setTeamLogoFile(null);
    setTeamLogoPreview(null);
    setTeamLogo('');
  };

  const handleUpdateTeamInfo = async () => {
    if (!user || !db) return;
    setIsUpdatingTeam(true);
    
    try {
      let logoUrl = teamLogo;
      
      // Upload new logo if one was selected
      if (teamLogoFile && storage) {
        setIsUploadingTeamLogo(true);
        const fileRef = ref(storage, `team-logos/${user.uid}/${teamLogoFile.name}`);
        await uploadBytes(fileRef, teamLogoFile);
        logoUrl = await getDownloadURL(fileRef);
        setIsUploadingTeamLogo(false);
      }

      // Save team info to programs collection
      await setDoc(doc(db, 'programs', user.uid), {
        name: teamName.trim(),
        logo: logoUrl,
        defaultShowTeamContent: false, // Default value
        updatedAt: new Date().toISOString(),
        userId: user.uid
      }, { merge: true }); // Use merge to not overwrite existing fields

      // Update local state
      setTeamLogo(logoUrl);
      setTeamLogoFile(null);
      
    } catch (error) {
      console.error('Error updating team info:', error);
    } finally {
      setIsUpdatingTeam(false);
      setIsUploadingTeamLogo(false);
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

          {/* Team Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Team Information (Optional)</CardTitle>
              <CardDescription>Add your team name and logo for practice plans and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Minneapolis Millers"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Team Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                    {teamLogoPreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={teamLogoPreview}
                          alt="Team Logo"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                        <button
                          onClick={handleRemoveTeamLogo}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs text-center">No logo</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleTeamLogoChange}
                      className="bg-slate-900 border-slate-700 text-slate-200"
                    />
                    <p className="text-xs text-slate-400 mt-1">Upload a team logo (JPG, PNG, etc.)</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleUpdateTeamInfo} 
                disabled={isUpdatingTeam || isUploadingTeamLogo || (!teamName.trim() && !teamLogoFile && !teamLogo)}
                className="mt-4"
              >
                {isUpdatingTeam ? 'Saving...' : isUploadingTeamLogo ? 'Uploading Logo...' : 'Save Team Info'}
              </Button>
              
              <p className="text-xs text-slate-400">
                Team information will be used in practice plans and can help organize your content. This is completely optional.
              </p>
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
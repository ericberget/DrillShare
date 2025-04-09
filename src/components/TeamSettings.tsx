import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Image from 'next/image';
import { useFirebase } from '@/contexts/FirebaseContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface TeamSettingsProps {
  teamLogo?: string;
  teamName?: string;
  defaultShowTeamContent?: boolean;
  onSave: (data: { teamLogo: string; teamName: string; defaultShowTeamContent: boolean }) => Promise<void>;
}

export function TeamSettings({ 
  teamLogo, 
  teamName: initialTeamName, 
  defaultShowTeamContent: initialDefaultShowTeamContent = false,
  onSave 
}: TeamSettingsProps) {
  const { user, storage } = useFirebase();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(teamLogo || null);
  const [teamName, setTeamName] = useState(initialTeamName || '');
  const [defaultShowTeamContent, setDefaultShowTeamContent] = useState(initialDefaultShowTeamContent);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      return;
    }

    setIsUploading(true);
    try {
      let logoUrl = teamLogo;
      
      if (selectedFile && user && storage) {
        // Upload the new logo
        const fileRef = ref(storage, `program-logos/${user.uid}/${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        logoUrl = await getDownloadURL(fileRef);
      }

      await onSave({
        teamLogo: logoUrl || '',
        teamName: teamName.trim(),
        defaultShowTeamContent
      });
    } catch (error) {
      console.error('Error saving program settings:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Program Information</CardTitle>
        <CardDescription>
          Configure your program information and upload a logo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Program Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your program name"
                className="bg-slate-900 border-slate-700 text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label>Program Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Team Logo"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="text-slate-500">No logo</div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-slate-900 border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Content View</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="defaultShowTeamContent" 
                  checked={defaultShowTeamContent}
                  onCheckedChange={(checked: boolean) => setDefaultShowTeamContent(checked)}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="defaultShowTeamContent" className="text-slate-300">
                  Show program content by default
                </Label>
              </div>
              <p className="text-sm text-slate-400">
                When enabled, the content grid will automatically filter to show program content when coaches visit the page
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isUploading}
          >
            {isUploading ? 'Saving...' : 'Save Program Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
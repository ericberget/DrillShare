'use client';

import { TeamSettings } from '@/components/TeamSettings';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/contexts/ToastContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';

export default function ProgramSettingsPage() {
  const { user, db, storage } = useFirebase();
  const { toast } = useToast();
  const [programSettings, setProgramSettings] = useState<{
    teamLogo: string;
    teamName: string;
    defaultShowTeamContent: boolean;
  }>({
    teamLogo: '/placeholder-team-logo.png',
    teamName: '',
    defaultShowTeamContent: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgramSettings = async () => {
      if (!user || !db) return;
      
      try {
        const programDoc = await getDoc(doc(db, 'programs', user.uid));
        if (programDoc.exists()) {
          const data = programDoc.data();
          setProgramSettings({
            teamLogo: data.logo || '/placeholder-team-logo.png',
            teamName: data.name || '',
            defaultShowTeamContent: data.defaultShowTeamContent || false
          });
        }
      } catch (error) {
        console.error('Error loading program settings:', error);
        toast({
          title: "Error",
          description: "Failed to load program settings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProgramSettings();
  }, [user, db, toast]);

  const handleSaveTeamSettings = async (data: { teamLogo: string; teamName: string; defaultShowTeamContent: boolean }) => {
    if (!user) return;

    if (!data.teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a program name",
        variant: "destructive"
      });
      return;
    }

    try {
      await setDoc(doc(db, 'programs', user.uid), {
        name: data.teamName,
        logo: data.teamLogo,
        defaultShowTeamContent: data.defaultShowTeamContent,
        updatedAt: new Date().toISOString(),
        userId: user.uid
      });

      toast({
        title: "Success",
        description: "Program settings saved successfully",
        variant: "success"
      });

      // Update local state
      setProgramSettings({
        teamLogo: data.teamLogo,
        teamName: data.teamName,
        defaultShowTeamContent: data.defaultShowTeamContent
      });
    } catch (error) {
      console.error('Error saving program settings:', error);
      toast({
        title: "Error",
        description: "Failed to save program settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[linear-gradient(to_right,rgb(15_23_42_/_0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42_/_0.2)_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Program Settings</h1>
          <p className="text-slate-400">Configure your program information and standardize your training content</p>
        </div>

        <TeamSettings
          teamLogo={programSettings.teamLogo}
          teamName={programSettings.teamName}
          defaultShowTeamContent={programSettings.defaultShowTeamContent}
          onSave={handleSaveTeamSettings}
        />

        <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">About Program Content</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Program content is a simple but powerful way to build your program's drill library. It works just like a tag or filter, 
              making it easy to mark and organize content that's essential to your program. The real value comes when you:
            </p>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li className="pl-2">
                <span className="text-emerald-400 font-semibold">Set Up New Coaches:</span>
                <br />
                When new coaches join your program, they'll have immediate access to your core drills and progressions
              </li>
              <li className="pl-2">
                <span className="text-emerald-400 font-semibold">Build Your Library:</span>
                <br />
                Start with your essential drills - warm-ups, fundamental skills, team traditions - and grow from there
              </li>
              <li className="pl-2">
                <span className="text-emerald-400 font-semibold">Maintain Consistency:</span>
                <br />
                Ensure everyone in your program is teaching the same fundamentals, using the same terminology
              </li>
              <li className="pl-2">
                <span className="text-emerald-400 font-semibold">Save Time:</span>
                <br />
                No more recreating drill libraries for each coach - just tag content as program material and it's ready to share
              </li>
            </ul>
            <p className="mt-4 text-sm text-slate-400">
              Think of it as your program's playbook in video form. While it's just a simple filter behind the scenes, 
              it's a powerful way to maintain consistency and get new coaches up to speed quickly with your program's core content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
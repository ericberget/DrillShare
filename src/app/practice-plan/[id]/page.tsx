'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, User } from 'lucide-react';
import { practicePlanService, PracticePlan } from '@/services/practicePlanService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

interface PracticeDrill {
  id: string;
  title: string;
  duration: number;
  notes: string;
  focus: string;
  players?: number;
  isCustom: boolean;
  isFavorite: boolean;
}

interface PracticePhase {
  id: string;
  name: string;
  drills: PracticeDrill[];
  color: string;
  isCustom: boolean;
  layout: 'sequential' | 'two-column' | 'three-column';
  duration: number;
}

interface TeamInfo {
  name: string;
  logo: string;
}

export default function SharedPracticePlanPage() {
  const params = useParams();
  const [practicePlan, setPracticePlan] = useState<PracticePlan | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPracticePlan = async () => {
      console.log('Fetching practice plan with ID:', params.id);
      try {
        if (params.id && typeof params.id === 'string') {
          console.log('Calling practicePlanService.getPracticePlan...');
          const plan = await practicePlanService.getPracticePlan(params.id);
          console.log('Received plan:', plan);
          if (plan) {
            setPracticePlan(plan);
            console.log('Practice plan set successfully');
            
            // Fetch team information if available
            if (plan.userId) {
              try {
                const programDoc = await getDoc(doc(db, 'programs', plan.userId));
                if (programDoc.exists()) {
                  const programData = programDoc.data();
                  if (programData.name || programData.logo) {
                    setTeamInfo({
                      name: programData.name || '',
                      logo: programData.logo || ''
                    });
                  }
                }
              } catch (teamError) {
                console.error('Error fetching team info:', teamError);
                // Don't set error state for team info failure, just continue without it
              }
            }
          } else {
            console.log('No plan found');
            setError('Practice plan not found');
          }
        } else {
          console.log('Invalid params.id:', params.id);
          setError('Invalid practice plan ID');
        }
      } catch (err) {
        console.error('Error fetching practice plan:', err);
        setError('Failed to load practice plan');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchPracticePlan();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !practicePlan) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900 border-slate-700 max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Practice Plan Not Found</h2>
            <p className="text-slate-400">{error || 'The practice plan you\'re looking for doesn\'t exist.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const phases = practicePlan.phases as PracticePhase[];
  const practiceDate = new Date(practicePlan.practiceDate);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage: "linear-gradient(rgba(13,21,41,0.5), rgba(13,21,41,0.5)), url('/bg-baseballfield.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Team Info Section */}
          {teamInfo && (teamInfo.name || teamInfo.logo) && (
            <div className="flex items-center justify-center gap-4 mb-6">
              {teamInfo.logo && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Image
                    src={teamInfo.logo}
                    alt="Team Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              {teamInfo.name && (
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-white">{teamInfo.name}</h2>
                  <p className="text-slate-400 text-sm">Practice Plan</p>
                </div>
              )}
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-emerald-400 mb-2">{practicePlan.title}</h1>
          <div className="flex items-center justify-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{practiceDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{practicePlan.totalTime} minutes</span>
            </div>
          </div>
        </div>

        {/* Practice Phases */}
        <div className="space-y-6">
          {phases.map((phase) => {
            if (phase.drills.length === 0) return null;
            
            const phaseTime = phase.drills.reduce((total, drill) => total + drill.duration, 0);
            
            return (
              <Card key={phase.id} className="bg-slate-900/50 border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-oswald text-emerald-400">
                      {phase.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{phaseTime} min</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className={`grid gap-4 ${
                    phase.layout === 'two-column' ? 'grid-cols-1 md:grid-cols-2' : 
                    phase.layout === 'three-column' ? 'grid-cols-1 md:grid-cols-3' : 
                    'grid-cols-1'
                  }`}>
                    {phase.drills.map((drill, index) => (
                      <div key={drill.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">
                            {phase.layout === 'sequential' ? `${index + 1}. ` : ''}{drill.title}
                          </h4>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{drill.duration}min</span>
                          </div>
                        </div>
                        
                        {drill.notes && drill.notes !== drill.title && (
                          <p className="text-slate-300 text-sm mb-2">{drill.notes}</p>
                        )}
                        
                        {drill.focus && (
                          <div className="bg-slate-700/50 rounded p-2 mt-2">
                            <p className="text-emerald-300 text-sm font-medium">Today's Focus:</p>
                            <p className="text-slate-200 text-sm">{drill.focus}</p>
                          </div>
                        )}
                        
                        {drill.players && (
                          <div className="flex items-center gap-1 mt-2 text-slate-400">
                            <User className="h-3 w-3" />
                            <span className="text-xs">{drill.players} players</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {phase.layout !== 'sequential' && (
                    <div className="mt-4 text-center">
                      <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                        {phase.layout === 'two-column' ? 'Two simultaneous stations' : 'Three simultaneous stations'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            Created with DrillShare Practice Planner
          </p>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useFirebase } from '@/contexts/FirebaseContext';
import { practicePlanService, PracticeTemplate } from '@/services/practicePlanService';
import { 
  Clock, 
  Users, 
  Plus, 
  Share2, 
  Copy, 
  Edit3, 
  Save, 
  X,
  GripVertical,
  Play,
  Search,
  Minus,
  Columns,
  List,
  Star,
  ExternalLink,
  BookOpen,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom three-column icon component
const ThreeColumns = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="4" height="18" x="3" y="3" rx="1" />
    <rect width="4" height="18" x="10" y="3" rx="1" />
    <rect width="4" height="18" x="17" y="3" rx="1" />
  </svg>
);

interface PracticeDrill {
  id: string;
  title: string;
  duration: number;
  notes: string;
  focus: string; // Today's specific focus
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
  layout: 'sequential' | 'two-column' | 'three-column'; // Updated layout options
  duration: number; // Add duration field to phase
}

// Specific drill list as requested
const availableDrills = [
  // Hitting
  { id: 'front-toss', title: 'Front Toss Hitting (on field)', category: 'hitting', duration: 20, description: 'Live front toss hitting on the field', isFavorite: false },
  { id: 'batting-cage', title: 'Batting Cage', category: 'hitting', duration: 20, description: 'Hitting practice in batting cages', isFavorite: true },
  
  // Defensive Fundamentals
  { id: 'pfp', title: 'PFP', category: 'defense', duration: 15, description: 'Pitchers Fielding Practice', isFavorite: false },
  { id: 'rundowns', title: 'Rundowns', category: 'defense', duration: 10, description: 'Rundown situations and communication', isFavorite: false },
  { id: 'full-infield', title: 'Full Standard Infield', category: 'defense', duration: 20, description: 'Complete infield practice with all positions', isFavorite: true },
  { id: 'double-plays', title: 'Double Plays', category: 'defense', duration: 15, description: 'Turn two situations and timing', isFavorite: false },
  { id: 'bermuda-triangle', title: 'Bermuda Triangle', category: 'defense', duration: 10, description: 'Short pop fly communication drill', isFavorite: false },
  { id: 'cutoffs', title: 'Cutoffs', category: 'defense', duration: 15, description: 'Outfield cutoff and relay practice', isFavorite: false },
  
  // Situational Defense
  { id: 'first-third-catcher', title: 'First and Third Catcher Plays', category: 'situational', duration: 15, description: 'Catcher situations with runners on 1st and 3rd', isFavorite: false },
  { id: 'infield-in', title: 'Infield In', category: 'situational', duration: 10, description: 'Infield drawn in defensive situations', isFavorite: false },
  
  // Bunting and Baserunning
  { id: 'bunting-sacrifice', title: 'Bunting (Sacrifice and Suicide)', category: 'offense', duration: 15, description: 'Sacrifice bunt and suicide squeeze situations', isFavorite: false },
  { id: 'baserunning-leads', title: 'Baserunning - Leading Off', category: 'offense', duration: 10, description: 'Proper leads and reading pitchers', isFavorite: false },
  
  // Warm-up activities
  { id: 'dynamic-warmup', title: 'Dynamic Warm-up', category: 'warmup', duration: 10, description: 'Jogging, stretching, arm circles', isFavorite: false },
  { id: 'throwing-progression', title: 'Throwing Progression', category: 'warmup', duration: 15, description: 'Progressive throwing from short to long toss', isFavorite: true },
  { id: 'catch-play', title: 'Catch Play', category: 'warmup', duration: 10, description: 'Basic catch and throw', isFavorite: false },
  
  // Additional common drills
  { id: 'conditioning', title: 'Conditioning', category: 'conditioning', duration: 10, description: 'Sprints and fitness work', isFavorite: false },
  { id: 'scrimmage', title: 'Scrimmage', category: 'game', duration: 30, description: 'Live game situations', isFavorite: false }
];

// Default practice phases
const createDefaultPhases = (): PracticePhase[] => [
  { 
    id: 'warmup', 
    name: 'Warm Up', 
    drills: [], 
    color: 'bg-slate-700/50 border-slate-500/50 text-white',
    isCustom: false,
    layout: 'sequential',
    duration: 15
  },
  { 
    id: 'phase1', 
    name: 'Practice Phase 1', 
    drills: [], 
    color: 'bg-slate-700/50 border-slate-500/50 text-white',
    isCustom: false,
    layout: 'sequential',
    duration: 20
  },
  { 
    id: 'phase2', 
    name: 'Practice Phase 2', 
    drills: [], 
    color: 'bg-slate-700/50 border-slate-500/50 text-white',
    isCustom: false,
    layout: 'sequential',
    duration: 20
  },
  { 
    id: 'phase3', 
    name: 'Practice Phase 3', 
    drills: [], 
    color: 'bg-slate-700/50 border-slate-500/50 text-white',
    isCustom: false,
    layout: 'sequential',
    duration: 20
  },
  { 
    id: 'cleanup', 
    name: 'Clean Up / Wrap Up', 
    drills: [], 
    color: 'bg-slate-700/50 border-slate-500/50 text-white',
    isCustom: false,
    layout: 'sequential',
    duration: 5
  }
];

export default function PracticePlannerPage() {
  const { user } = useFirebase();
  const [phases, setPhases] = useState<PracticePhase[]>(createDefaultPhases());
  const [drills, setDrills] = useState(availableDrills); // Make drills editable
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDrill, setEditingDrill] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [editingLibraryDrill, setEditingLibraryDrill] = useState<string | null>(null); // For editing drills in sidebar
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [practiceTitle, setPracticeTitle] = useState('Practice Plan');
  const [isSaved, setIsSaved] = useState(true); // Track if current plan is saved
  const [isSharing, setIsSharing] = useState(false); // Track sharing state
  const [shareUrl, setShareUrl] = useState<string | null>(null); // Store the shareable URL
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]); // Add templates state
  const [showTemplates, setShowTemplates] = useState(false); // Show template modal
  const [showSaveTemplate, setShowSaveTemplate] = useState(false); // Show save template modal
  const [templateName, setTemplateName] = useState(''); // Template name input
  const [templateDescription, setTemplateDescription] = useState(''); // Template description input

  // Load saved data on mount
  useEffect(() => {
    const savedPhases = localStorage.getItem('practice-planner-phases');
    const savedDrills = localStorage.getItem('practice-planner-drills');
    const savedTitle = localStorage.getItem('practice-planner-title');
    const savedDate = localStorage.getItem('practice-planner-date');

    if (savedPhases) {
      try {
        setPhases(JSON.parse(savedPhases));
      } catch (e) {
        console.error('Error loading saved phases:', e);
      }
    }

    if (savedDrills) {
      try {
        setDrills(JSON.parse(savedDrills));
      } catch (e) {
        console.error('Error loading saved drills:', e);
      }
    }

    if (savedTitle) setPracticeTitle(savedTitle);
    if (savedDate) setPracticeDate(savedDate);
  }, []);

  // Mark as unsaved when data changes
  useEffect(() => {
    setIsSaved(false);
  }, [phases, drills, practiceTitle, practiceDate]);

  // Save plan to local storage
  const savePlan = () => {
    try {
      localStorage.setItem('practice-planner-phases', JSON.stringify(phases));
      localStorage.setItem('practice-planner-drills', JSON.stringify(drills));
      localStorage.setItem('practice-planner-title', practiceTitle);
      localStorage.setItem('practice-planner-date', practiceDate);
      setIsSaved(true);
    } catch (e) {
      console.error('Error saving plan:', e);
      alert('Error saving plan. Please try again.');
    }
  };

  // Filter drills based on search
  const filteredDrills = drills
    .filter(drill =>
      drill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drill.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort favorites first, then alphabetically
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.title.localeCompare(b.title);
    });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    // Dragging from gallery to phase
    if (source.droppableId === 'gallery') {
      const drill = filteredDrills[source.index];
      const newDrill: PracticeDrill = {
        id: `drill-${Date.now()}`,
        title: drill.title,
        duration: drill.duration,
        notes: drill.description,
        focus: '', // Empty focus for coach to fill
        isCustom: false,
        isFavorite: false
      };

      setPhases(prev => prev.map(phase => 
        phase.id === destination.droppableId
          ? { ...phase, drills: [...phase.drills, newDrill] }
          : phase
      ));
      return;
    }

    // Moving between phases or within phase
    const sourcePhase = phases.find(p => p.id === source.droppableId);
    const destPhase = phases.find(p => p.id === destination.droppableId);
    
    if (!sourcePhase) return;

    const newPhases = [...phases];
    const sourceDrills = [...sourcePhase.drills];
    const [movedDrill] = sourceDrills.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Moving within same phase
      sourceDrills.splice(destination.index, 0, movedDrill);
      const phaseIndex = newPhases.findIndex(p => p.id === source.droppableId);
      newPhases[phaseIndex].drills = sourceDrills;
    } else {
      // Moving between phases
      if (!destPhase) return;
      const destDrills = [...destPhase.drills];
      destDrills.splice(destination.index, 0, movedDrill);
      
      const sourceIndex = newPhases.findIndex(p => p.id === source.droppableId);
      const destIndex = newPhases.findIndex(p => p.id === destination.droppableId);
      
      newPhases[sourceIndex].drills = sourceDrills;
      newPhases[destIndex].drills = destDrills;
    }

    setPhases(newPhases);
  };

  const updateDrill = (phaseId: string, drillId: string, updates: Partial<PracticeDrill>) => {
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId
        ? {
            ...phase,
            drills: phase.drills.map(drill =>
              drill.id === drillId ? { ...drill, ...updates } : drill
            )
          }
        : phase
    ));
  };

  const removeDrill = (phaseId: string, drillId: string) => {
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId
        ? { ...phase, drills: phase.drills.filter(drill => drill.id !== drillId) }
        : phase
    ));
  };

  const addCustomDrill = (phaseId: string) => {
    const newDrill: PracticeDrill = {
      id: `custom-${Date.now()}`,
      title: 'Custom Drill',
      duration: 10,
      notes: '',
      focus: '',
      isCustom: true,
      isFavorite: false
    };

    setPhases(prev => prev.map(phase =>
      phase.id === phaseId
        ? { ...phase, drills: [...phase.drills, newDrill] }
        : phase
    ));
    setEditingDrill(newDrill.id);
  };

  const addPhase = () => {
    const phaseNumber = phases.length;
    
    const newPhase: PracticePhase = {
      id: `phase-${Date.now()}`,
      name: `Practice Phase ${phaseNumber}`,
      drills: [],
      color: 'bg-slate-700/50 border-slate-500/50 text-white',
      isCustom: true,
      layout: 'sequential',
      duration: 0
    };

    setPhases(prev => [...prev, newPhase]);
    setEditingPhase(newPhase.id);
  };

  const removePhase = (phaseId: string) => {
    setPhases(prev => prev.filter(phase => phase.id !== phaseId));
  };

  const updatePhaseName = (phaseId: string, name: string) => {
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId ? { ...phase, name } : phase
    ));
  };

  const setPhaseLayout = (phaseId: string, layout: 'sequential' | 'two-column' | 'three-column') => {
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId ? { ...phase, layout } : phase
    ));
  };

  const updatePhaseDuration = (phaseId: string, duration: number) => {
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId ? { ...phase, duration } : phase
    ));
  };

  const getTotalTime = () => {
    return phases.reduce((total, phase) => total + phase.duration, 0);
  };

  const saveAndShare = async () => {
    if (!user) {
      alert('Please sign in to save and share practice plans');
      return;
    }

    setIsSharing(true);
    try {
      // Filter out phases with no drills for cleaner sharing
      const filteredPhases = phases.filter(phase => phase.drills.length > 0);
      
      const practicePlanId = await practicePlanService.savePracticePlan({
        title: practiceTitle,
        practiceDate,
        phases: filteredPhases,
        totalTime: getTotalTime(),
        userId: user.uid,
      });

      const shareableUrl = `${window.location.origin}/practice-plan/${practicePlanId}`;
      setShareUrl(shareableUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl);
      alert('Practice plan saved and URL copied to clipboard!');
      
    } catch (error) {
      console.error('Error saving practice plan:', error);
      alert('Failed to save practice plan. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Template functions
  const loadTemplates = async () => {
    if (!user) return;
    try {
      const userTemplates = await practicePlanService.getUserTemplates(user.uid);
      setTemplates(userTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveAsTemplate = async () => {
    if (!user) {
      alert('Please sign in to save templates');
      return;
    }

    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      // Filter out phases with no drills for cleaner templates
      const filteredPhases = phases.filter(phase => phase.drills.length > 0);
      
      await practicePlanService.saveTemplate({
        name: templateName,
        description: templateDescription,
        phases: filteredPhases,
        totalTime: getTotalTime(),
        userId: user.uid,
      });

      setTemplateName('');
      setTemplateDescription('');
      setShowSaveTemplate(false);
      loadTemplates(); // Refresh templates list
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      const template = await practicePlanService.getTemplate(templateId);
      if (template) {
        setPhases(template.phases);
        setPracticeTitle(template.name);
        setShowTemplates(false);
        setIsSaved(false); // Mark as unsaved since it's a new practice based on template
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

  // Load templates when user is available
  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  // Drill management functions
  const addNewDrill = () => {
    const newDrill = {
      id: `custom-drill-${Date.now()}`,
      title: 'New Drill',
      category: 'custom',
      duration: 15,
      description: 'Custom drill description',
      isFavorite: false
    };
    setDrills(prev => [...prev, newDrill]);
    setEditingLibraryDrill(newDrill.id);
  };

  const updateLibraryDrill = (drillId: string, updates: Partial<typeof availableDrills[0]>) => {
    setDrills(prev => prev.map(drill =>
      drill.id === drillId ? { ...drill, ...updates } : drill
    ));
  };

  const deleteLibraryDrill = (drillId: string) => {
    setDrills(prev => prev.filter(drill => drill.id !== drillId));
  };

  const toggleDrillFavorite = (drillId: string) => {
    setDrills(prev => prev.map(drill =>
      drill.id === drillId ? { ...drill, isFavorite: !drill.isFavorite } : drill
    ));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0D1529] text-white">
        <header
          className="w-full border-b border-slate-800/30 flex items-center justify-center"
          style={{
            backgroundImage: "url('/bgtexture.jpg')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "center",
            minHeight: '180px',
          }}
        >
          <img 
            src="/practiceTitle.png" 
            alt="Practice Planner" 
            className="h-12 md:h-16 lg:h-20 xl:h-24 mb-0"
            style={{ marginTop: 0 }}
          />
        </header>
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Input
                value={practiceTitle}
                onChange={(e) => setPracticeTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none text-white p-0 h-auto"
              />
              <Input
                type="date"
                value={practiceDate}
                onChange={(e) => setPracticeDate(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTemplates(true)} 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800 h-9"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Template
              </Button>
              <Button 
                onClick={() => setShowSaveTemplate(true)} 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800 h-9"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
              <Button 
                onClick={savePlan} 
                size="sm" 
                className={cn(
                  "h-9",
                  isSaved ? "bg-green-700 hover:bg-green-800 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button 
                onClick={saveAndShare} 
                disabled={isSharing}
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white h-9"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Save & Share
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share URL Display */}
          {shareUrl && (
            <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-emerald-400 font-medium mb-1">Practice Plan Saved!</p>
                  <p className="text-slate-300 text-sm mb-2">Share this URL with your team:</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-slate-800 border-slate-600 text-slate-200 text-sm"
                    />
                    <Button
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => window.open(shareUrl, '_blank')}
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => setShareUrl(null)}
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-slate-400 mb-6">
            Total Time: {getTotalTime()} minutes
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Drill Gallery */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700 h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-oswald text-emerald-400">Drills and Skills Library</CardTitle>
                      <Button
                        onClick={addNewDrill}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                        title="Add new drill"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search drills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <Droppable droppableId="gallery" isDropDisabled>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                          {filteredDrills.map((drill, index) => (
                            <Draggable key={drill.id} draggableId={drill.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "group p-3 bg-slate-700/50 rounded-lg border border-slate-600 cursor-grab active:cursor-grabbing transition-all",
                                    snapshot.isDragging && "bg-slate-600 shadow-lg"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1">
                                      <GripVertical className="h-4 w-4 text-slate-400" />
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingLibraryDrill(drill.id);
                                          }}
                                          size="sm"
                                          variant="ghost"
                                          className="h-4 w-4 p-0 text-teal-500/70 hover:text-teal-400"
                                          title="Edit drill"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteLibraryDrill(drill.id);
                                          }}
                                          size="sm"
                                          variant="ghost"
                                          className="h-4 w-4 p-0 text-teal-500/50 hover:text-teal-400/70"
                                          title="Delete drill"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDrillFavorite(drill.id);
                                      }}
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 w-5 p-0"
                                    >
                                      <Star 
                                        className={cn(
                                          "h-3 w-3 transition-colors",
                                          drill.isFavorite 
                                            ? "fill-teal-500/70 text-teal-500/70" 
                                            : "text-slate-500 hover:text-teal-400/60"
                                        )} 
                                      />
                                    </Button>
                                  </div>
                                  {editingLibraryDrill === drill.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={drill.title}
                                        onChange={(e) => updateLibraryDrill(drill.id, { title: e.target.value })}
                                        className="h-6 text-sm bg-slate-600 border-slate-500"
                                        placeholder="Drill name"
                                        autoFocus
                                      />
                                      <Textarea
                                        value={drill.description}
                                        onChange={(e) => updateLibraryDrill(drill.id, { description: e.target.value })}
                                        className="h-16 text-xs bg-slate-600 border-slate-500 resize-none"
                                        placeholder="Drill description"
                                      />
                                      <div className="flex gap-1">
                                        <Button
                                          onClick={() => setEditingLibraryDrill(null)}
                                          size="sm"
                                          className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            setEditingLibraryDrill(null);
                                            if (drill.id.startsWith('custom-drill-')) {
                                              deleteLibraryDrill(drill.id);
                                            }
                                          }}
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <h4 className="font-medium text-sm text-white mb-1">{drill.title}</h4>
                                      <p className="text-xs text-slate-400 line-clamp-2">{drill.description}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>

              {/* Practice Phases */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  {phases.map((phase) => (
                    <Card key={phase.id} className={cn("border-2", phase.color)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {editingPhase === phase.id ? (
                              <Input
                                value={phase.name}
                                onChange={(e) => updatePhaseName(phase.id, e.target.value)}
                                className="text-lg font-semibold bg-slate-700 border-slate-500"
                                autoFocus
                                onBlur={() => setEditingPhase(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingPhase(null)}
                              />
                            ) : (
                              <div className="flex flex-col">
                                <CardTitle 
                                  className="text-xl font-oswald text-emerald-400 cursor-pointer hover:text-emerald-300 transition-colors flex items-center gap-2 group"
                                  onClick={() => setEditingPhase(phase.id)}
                                >
                                  {phase.name}
                                  <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePhase(phase.id);
                                    }}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove this phase"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </CardTitle>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <Input
                                    type="number"
                                    value={phase.duration}
                                    onChange={(e) => updatePhaseDuration(phase.id, parseInt(e.target.value) || 0)}
                                    className="h-6 w-8 text-xs text-center bg-slate-700/50 border-none text-slate-400 px-1 focus:bg-slate-700 focus:border-slate-500 focus:px-2 transition-all rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <span className="text-xs text-slate-400">min</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {/* Sequential Layout Button */}
                            <Button
                              onClick={() => setPhaseLayout(phase.id, 'sequential')}
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-8 w-8 p-0 transition-colors",
                                phase.layout === 'sequential' 
                                  ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30" 
                                  : "text-slate-400 hover:text-white"
                              )}
                              title="Sequential layout - drills happen one after another"
                            >
                              <List className="h-4 w-4" />
                            </Button>
                            
                            {/* Two Column Layout Button */}
                            <Button
                              onClick={() => setPhaseLayout(phase.id, 'two-column')}
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-8 w-8 p-0 transition-colors",
                                phase.layout === 'two-column' 
                                  ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30" 
                                  : "text-slate-400 hover:text-white"
                              )}
                              title="Two simultaneous stations"
                            >
                              <Columns className="h-4 w-4" />
                            </Button>
                            
                            {/* Three Column Layout Button */}
                            <Button
                              onClick={() => setPhaseLayout(phase.id, 'three-column')}
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-8 w-8 p-0 transition-colors",
                                phase.layout === 'three-column' 
                                  ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30" 
                                  : "text-slate-400 hover:text-white"
                              )}
                              title="Three simultaneous stations"
                            >
                              <ThreeColumns className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3">
                        <Droppable droppableId={phase.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn(
                                "min-h-[120px] p-2 rounded-lg transition-colors",
                                snapshot.isDraggingOver && "bg-slate-700/30",
                                phase.layout === 'two-column' ? "grid grid-cols-2 gap-4" : 
                                phase.layout === 'three-column' ? "grid grid-cols-3 gap-4" : "space-y-2"
                              )}
                            >
                              {phase.drills.map((drill, index) => (
                                <div key={drill.id} className={phase.layout === 'sequential' ? "" : phase.layout === 'two-column' ? "" : ""}>
                                  <Draggable draggableId={drill.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={cn(
                                          "bg-slate-800/80 rounded-lg border border-slate-600 transition-all mb-2",
                                          snapshot.isDragging && "shadow-lg bg-slate-700"
                                        )}
                                      >
                                        <div className="p-3">
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2 flex-1">
                                              <div {...provided.dragHandleProps}>
                                                <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                                              </div>
                                              {editingDrill === drill.id ? (
                                                <Input
                                                  value={drill.title}
                                                  onChange={(e) => updateDrill(phase.id, drill.id, { title: e.target.value })}
                                                  className="h-6 text-sm bg-slate-700 border-slate-500 flex-1"
                                                  autoFocus
                                                  onBlur={() => setEditingDrill(null)}
                                                  onKeyDown={(e) => e.key === 'Enter' && setEditingDrill(null)}
                                                />
                                              ) : (
                                                <h4 
                                                  className="font-medium text-sm cursor-pointer hover:text-blue-400 flex-1"
                                                  onClick={() => setEditingDrill(drill.id)}
                                                >
                                                  {drill.title}
                                                </h4>
                                              )}
                                            </div>
                                            <Button
                                              onClick={() => removeDrill(phase.id, drill.id)}
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 ml-2"
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>

                                          <Textarea
                                            placeholder="Today's focus..."
                                            value={drill.focus}
                                            onChange={(e) => updateDrill(phase.id, drill.id, { focus: e.target.value })}
                                            className="h-16 text-xs bg-slate-700 border-slate-500 resize-none"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                  
                                  {/* Inline Add Button - only show in sequential mode */}
                                  {phase.layout === 'sequential' && (
                                    <div className="flex justify-center py-1 group">
                                      <Button
                                        onClick={() => addCustomDrill(phase.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-600/50 hover:bg-slate-500/50 rounded-full"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {provided.placeholder}
                              
                              {/* Empty state - clickable to add drill */}
                              {phase.drills.length === 0 && (
                                <div 
                                  className={cn(
                                    "text-center text-slate-500 text-sm py-8 cursor-pointer hover:bg-slate-700/20 rounded-lg transition-colors border-2 border-dashed border-slate-600 hover:border-slate-500",
                                    phase.layout === 'two-column' && "col-span-2",
                                    phase.layout === 'three-column' && "col-span-3"
                                  )}
                                  onClick={() => addCustomDrill(phase.id)}
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    <Plus className="h-6 w-6 text-slate-400" />
                                    <span>Click to add drill or drag from list</span>
                                    {phase.layout === 'two-column' && (
                                      <span className="text-xs text-slate-600">Two simultaneous stations</span>
                                    )}
                                    {phase.layout === 'three-column' && (
                                      <span className="text-xs text-slate-600">Three simultaneous stations</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Add button at the end when there are drills */}
                              {phase.drills.length > 0 && (
                                <div className={cn(
                                  "flex justify-center py-2",
                                  phase.layout === 'two-column' && "col-span-2",
                                  phase.layout === 'three-column' && "col-span-3"
                                )}>
                                  <Button
                                    onClick={() => addCustomDrill(phase.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-slate-400 hover:text-white hover:bg-slate-600/50 border border-dashed border-slate-600 hover:border-slate-500"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Drill
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Phase Button */}
                  <div className="flex justify-center">
                    <Button 
                      onClick={addPhase} 
                      variant="outline" 
                      size="lg" 
                      className="text-blue-400 border-slate-600 hover:bg-slate-700 hover:text-blue-300 border-dashed"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Practice Phase
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DragDropContext>
        </div>

        {/* Load Template Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Load Template</h2>
                <Button
                  onClick={() => setShowTemplates(false)}
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No templates saved yet.</p>
                  <p className="text-slate-500 text-sm">Create a practice plan and save it as a template to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer"
                      onClick={() => loadTemplate(template.id!)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{template.name}</h3>
                          {template.description && (
                            <p className="text-slate-400 text-sm mt-1">{template.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>{template.phases.length} phases</span>
                            <span>{template.totalTime} minutes</span>
                            <span>
                              {template.createdAt && new Date(template.createdAt.toDate()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Template Modal */}
        {showSaveTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Save as Template</h2>
                <Button
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName('');
                    setTemplateDescription('');
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Template Name *
                  </label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Standard Practice, Game Day Prep"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description (optional)
                  </label>
                  <Textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description of when to use this template..."
                    className="bg-slate-700 border-slate-600 h-20"
                  />
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-300 text-sm mb-2">Template will include:</p>
                  <ul className="text-slate-400 text-xs space-y-1">
                    <li>• {phases.filter(p => p.drills.length > 0).length} phases with drills</li>
                    <li>• {getTotalTime()} minutes total time</li>
                    <li>• All drill configurations and layouts</li>
                  </ul>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setShowSaveTemplate(false);
                      setTemplateName('');
                      setTemplateDescription('');
                    }}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveAsTemplate}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!templateName.trim()}
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 
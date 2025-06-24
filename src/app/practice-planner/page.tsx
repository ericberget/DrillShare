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

// New component for mobile view
const MobilePracticePlanner = () => {
  const { user } = useFirebase();
  const [phases, setPhases] = useState<PracticePhase[]>(createDefaultPhases());
  const [drills, setDrills] = useState(availableDrills);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDrill, setEditingDrill] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [editingLibraryDrill, setEditingLibraryDrill] = useState<string | null>(null);
  const [practiceDate, setPracticeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [practiceTitle, setPracticeTitle] = useState('Practice Plan');
  const [isSaved, setIsSaved] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showDrillLibrary, setShowDrillLibrary] = useState(false);
  const [phaseToAddTo, setPhaseToAddTo] = useState<string | null>(null);
  const [editingDrillId, setEditingDrillId] = useState<string | null>(null);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [expandedDrillId, setExpandedDrillId] = useState<string | null>(null);

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
    if (savedDate && !isNaN(Date.parse(savedDate))) {
      setPracticeDate(savedDate);
    } else {
      setPracticeDate(new Date().toISOString().split('T')[0]);
    }
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
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.title.localeCompare(b.title);
    });

  const addDrillToPhase = (phaseId: string, drill: any) => {
    const newDrill: PracticeDrill = {
      id: `drill-${Date.now()}`,
      title: drill.title,
      duration: drill.duration,
      notes: '',
      focus: '',
      isCustom: false,
      isFavorite: drill.isFavorite,
    };
    setPhases(currentPhases =>
      currentPhases.map(p =>
        p.id === phaseId ? { ...p, drills: [...p.drills, newDrill] } : p
      )
    );
    setShowDrillLibrary(false);
    setPhaseToAddTo(null);
  };

  const removeDrill = (phaseId: string, drillId: string) => {
    setPhases(currentPhases =>
      currentPhases.map(p =>
        p.id === phaseId
          ? { ...p, drills: p.drills.filter(d => d.id !== drillId) }
          : p
      )
    );
  };
  
  const getTotalTime = () => {
    return phases.reduce((total, phase) => {
      const phaseTotal = phase.drills.reduce((sum, drill) => sum + (drill.duration || 0), 0);
      return total + phaseTotal;
    }, 0);
  };

  const updateDrillInPhase = (phaseId: string, drillId: string, updates: Partial<PracticeDrill>) => {
    setPhases(currentPhases =>
      currentPhases.map(phase =>
        phase.id === phaseId
          ? {
              ...phase,
              drills: phase.drills.map(drill =>
                drill.id === drillId ? { ...drill, ...updates } : drill
              ),
            }
          : phase
      )
    );
  };

  const loadTemplates = async () => {
    if (!user) return;
    const userTemplates = await practicePlanService.getUserTemplates(user.uid);
    setTemplates(userTemplates);
    setShowTemplates(true);
  };

  const loadTemplate = async (templateId: string) => {
    if (!user) return;
    const template = await practicePlanService.getTemplate(templateId);
    if (template) {
      setPhases(template.phases);
      setPracticeTitle(template.name);
      setShowTemplates(false);
    } else {
      alert('Template not found or error loading.');
    }
  };

  const saveAsTemplate = async () => {
    if (!user) {
      alert('You must be signed in to save templates.');
      return;
    }
    if (!templateName) {
      alert('Please enter a name for your template.');
      return;
    }

    const templateData = {
      name: templateName,
      description: templateDescription,
      phases,
      totalTime: getTotalTime(),
      userId: user.uid,
    };

    try {
      await practicePlanService.saveTemplate(templateData);
      alert('Template saved successfully!');
      setShowSaveTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      alert('Error saving template. Please try again.');
    }
  };

  // Drag and drop handler for drills within a phase
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;
    const phaseId = source.droppableId;
    setPhases(currentPhases =>
      currentPhases.map(phase => {
        if (phase.id !== phaseId) return phase;
        const newDrills = Array.from(phase.drills);
        const [removed] = newDrills.splice(source.index, 1);
        newDrills.splice(destination.index, 0, removed);
        return { ...phase, drills: newDrills };
      })
    );
  };

  const setPhaseLayout = (phaseId: string, layout: 'sequential' | 'two-column' | 'three-column') => {
    setPhases(phases => phases.map(p => (p.id === phaseId ? { ...p, layout } : p)));
  };

  const saveAndShare = async () => {
    if (!user) {
      alert('Please sign in to share your practice plan.');
      return;
    }

    setIsSharing(true);
    try {
      const planToSave = {
        title: practiceTitle,
        practiceDate: practiceDate,
        phases,
        totalTime: getTotalTime(),
        userId: user.uid,
      };
      
      const id = await practicePlanService.savePracticePlan(planToSave);
      
      const url = `${window.location.origin}/practice-plan/${id}`;
      setShareUrl(url);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Shareable link copied to clipboard!');

    } catch (error) {
      console.error('Error sharing plan:', error);
      alert('Failed to create shareable link.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="p-4 bg-slate-900 text-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <div className="relative flex items-center">
          <Input
            type="text"
            value={practiceTitle}
            onChange={e => setPracticeTitle(e.target.value)}
            className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-white placeholder:text-slate-400 pr-8"
            placeholder="Practice Plan Title"
          />
          <Edit3 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={practiceDate}
            onChange={e => setPracticeDate(e.target.value)}
            className="w-auto bg-slate-800 border-slate-700 text-white px-2 py-1 rounded-md"
          />
          <button
            onClick={() => setPracticeDate(new Date().toISOString().split('T')[0])}
            className="bg-white text-blue-900 font-bold px-3 py-1 rounded shadow border border-blue-900/20 hover:bg-blue-50 transition text-xs"
          >
            Today
          </button>
        </div>
        <div className="text-sm text-slate-400 sm:text-right">Total Time: {getTotalTime()} min</div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button onClick={saveAndShare} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full" disabled={isSharing}>
          <Share2 className="mr-2 h-4 w-4" />
          {isSharing ? 'Sharing...' : 'Save & Share'}
        </Button>
      </div>
      
      <div className="space-y-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          {phases.map(phase => (
            <Card key={phase.id} className="bg-slate-800 border border-slate-700">
              <CardHeader>
                {editingPhaseId === phase.id ? (
                  <Input
                    value={phase.name}
                    onChange={e => {
                      const newName = e.target.value;
                      setPhases(currentPhases =>
                        currentPhases.map(p =>
                          p.id === phase.id ? { ...p, name: newName } : p
                        )
                      );
                    }}
                    onBlur={() => setEditingPhaseId(null)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') setEditingPhaseId(null);
                    }}
                    className="bg-slate-600 border-slate-500 text-blue-300 font-oswald text-lg font-bold"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <CardTitle
                      className="text-lg text-emerald-400 font-oswald font-bold cursor-pointer"
                      onClick={() => setEditingPhaseId(phase.id)}
                    >
                      {phase.name}
                    </CardTitle>
                    <Button size="icon" variant="ghost" onClick={() => setPhaseLayout(phase.id, 'sequential')} className={phase.layout === 'sequential' ? 'text-emerald-400' : 'text-slate-400'}>
                      <List className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setPhaseLayout(phase.id, 'two-column')} className={phase.layout === 'two-column' ? 'text-emerald-400' : 'text-slate-400'}>
                      <Columns className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setPhaseLayout(phase.id, 'three-column')} className={phase.layout === 'three-column' ? 'text-emerald-400' : 'text-slate-400'}>
                      <ThreeColumns className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Droppable droppableId={phase.id} direction="vertical">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={
                        phase.layout === 'sequential'
                          ? 'space-y-2'
                          : phase.layout === 'two-column'
                          ? 'grid grid-cols-2 gap-2'
                          : 'grid grid-cols-3 gap-2'
                      }
                    >
                      {phase.drills.map((drill, index) => (
                        <Draggable key={drill.id} draggableId={drill.id} index={index}>
                          {(provided) => {
                            const isExpanded = expandedDrillId === drill.id;
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={
                                  (phase.layout === 'sequential'
                                    ? 'bg-slate-700 rounded-md mb-2 transition-all duration-200 overflow-hidden'
                                    : 'bg-slate-700 rounded-md mb-2 transition-all duration-200 overflow-hidden') +
                                  (isExpanded ? ' shadow-lg ring-2 ring-emerald-400/30' : '')
                                }
                              >
                                <div
                                  className={
                                    (phase.layout === 'sequential'
                                      ? 'flex items-center gap-2 p-2 cursor-pointer'
                                      : 'flex items-center gap-1 p-2 cursor-pointer')
                                  }
                                  onClick={() => setExpandedDrillId(isExpanded ? null : drill.id)}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab p-1">
                                    <GripVertical className="h-4 w-4 text-slate-400" />
                                  </div>
                                  {editingDrillId === drill.id ? (
                                    <Input
                                      value={drill.title}
                                      onChange={(e) => updateDrillInPhase(phase.id, drill.id, { title: e.target.value })}
                                      onBlur={() => setEditingDrillId(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          setEditingDrillId(null);
                                        }
                                      }}
                                      className={
                                        phase.layout === 'sequential'
                                          ? 'bg-slate-600 border-slate-500 text-white/50 font-bold text-base'
                                          : 'bg-slate-600 border-slate-500 text-white/50 font-bold text-sm'
                                      }
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className={
                                        'font-bold text-white/50 ' +
                                        (phase.layout === 'sequential' ? 'text-base' : 'text-sm')
                                      }
                                      onClick={e => {
                                        e.stopPropagation();
                                        setEditingDrillId(drill.id);
                                      }}
                                    >
                                      {drill.title}
                                    </span>
                                  )}
                                </div>
                                {/* Expanded content */}
                                <div
                                  className={
                                    'transition-all duration-200' +
                                    (isExpanded ? ' max-h-96 opacity-100 p-3' : ' max-h-0 opacity-0 p-0 pointer-events-none')
                                  }
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div className="mb-2">
                                    <label className="block text-xs text-slate-400 mb-1">Today's Focus</label>
                                    <Textarea
                                      value={drill.focus || ''}
                                      onChange={e => updateDrillInPhase(phase.id, drill.id, { focus: e.target.value })}
                                      placeholder="Add today's focus..."
                                      className="bg-slate-800 border-slate-700 text-sm text-white min-h-[40px]"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <label className="text-xs text-slate-400">Minutes</label>
                                    <Input
                                      type="number"
                                      value={drill.duration}
                                      onChange={e => updateDrillInPhase(phase.id, drill.id, { duration: parseInt(e.target.value, 10) || 0 })}
                                      className="w-16 bg-slate-800 border-slate-700 text-white text-xs"
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="mt-2 w-full"
                                    onClick={() => removeDrill(phase.id, drill.id)}
                                  >
                                    Delete Drill
                                  </Button>
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <Button 
                  className="w-1/3 mx-auto mt-4 bg-emerald-500/70 hover:bg-emerald-600/80 text-white font-normal"
                  onClick={() => {
                    setPhaseToAddTo(phase.id);
                    setShowDrillLibrary(true);
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Drill
                </Button>
              </CardContent>
            </Card>
          ))}
        </DragDropContext>
      </div>

      {showDrillLibrary && (
        <div className="fixed inset-0 bg-slate-950 z-50 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Drill Library</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowDrillLibrary(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Search drills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder:text-slate-500 mb-4"
          />
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredDrills.map(drill => (
              <div key={drill.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-md">
                <div>
                  <div className="font-semibold">{drill.title}</div>
                  <div className="text-sm text-slate-400">{drill.description}</div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => addDrillToPhase(phaseToAddTo!, drill)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load Template Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Load Template</h2>
              <Button onClick={() => setShowTemplates(false)} size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No templates found.</div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer" onClick={() => loadTemplate(template.id!)}>
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{template.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Save as Template</h2>
              <Button onClick={() => setShowSaveTemplate(false)} size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name (e.g., Game Day Prep)"
                className="bg-slate-700 border-slate-600"
              />
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Description (optional)"
                className="bg-slate-700 border-slate-600"
              />
              <Button onClick={saveAsTemplate} className="w-full bg-blue-600 hover:bg-blue-700">
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

const DesktopPracticePlanner = () => {
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
  const [expandedDrillId, setExpandedDrillId] = useState<string | null>(null);

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
    if (savedDate && !isNaN(Date.parse(savedDate))) {
      setPracticeDate(savedDate);
    } else {
      setPracticeDate(new Date().toISOString().split('T')[0]);
    }
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
        notes: '',
        focus: '', // Initialize focus field
        isCustom: false,
        isFavorite: drill.isFavorite, // Carry over favorite status
      };
    const newPhases = [...phases];
      const phaseIndex = newPhases.findIndex(p => p.id === destination.droppableId);
      newPhases[phaseIndex].drills.splice(destination.index, 0, newDrill);
      setPhases(newPhases);
    } else {
      // Reordering within a phase
      const phaseId = source.droppableId;
      const phaseIndex = phases.findIndex(p => p.id === phaseId);
      const newPhases = [...phases];
      const [movedDrill] = newPhases[phaseIndex].drills.splice(source.index, 1);
      newPhases[phaseIndex].drills.splice(destination.index, 0, movedDrill);
    setPhases(newPhases);
    }
  };

  const updateDrill = (phaseId: string, drillId: string, updates: Partial<PracticeDrill>) => {
    setPhases(currentPhases =>
      currentPhases.map(phase =>
      phase.id === phaseId
        ? {
            ...phase,
            drills: phase.drills.map(drill =>
              drill.id === drillId ? { ...drill, ...updates } : drill
              ),
          }
        : phase
      )
    );
  };

  const removeDrill = (phaseId: string, drillId: string) => {
    setPhases(currentPhases =>
      currentPhases.map(phase =>
      phase.id === phaseId
        ? { ...phase, drills: phase.drills.filter(drill => drill.id !== drillId) }
        : phase
      )
    );
  };

  const addCustomDrill = (phaseId: string) => {
    const newDrill: PracticeDrill = {
      id: `custom-drill-${Date.now()}`,
      title: 'New Custom Drill',
      duration: 10,
      notes: 'Add notes here',
      focus: 'Add today\'s focus',
      isCustom: true,
      isFavorite: false,
    };
    setPhases(currentPhases =>
      currentPhases.map(phase =>
        phase.id === phaseId ? { ...phase, drills: [...phase.drills, newDrill] } : phase
      )
    );
  };

  const addPhase = () => {
    const newPhase: PracticePhase = {
      id: `phase-${Date.now()}`,
      name: 'New Practice Phase',
      drills: [],
      color: 'bg-slate-700/50 border-slate-500/50 text-white',
      isCustom: true,
      layout: 'sequential',
      duration: 20
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (phaseId: string) => {
    setPhases(phases.filter(phase => phase.id !== phaseId));
  };

  const updatePhaseName = (phaseId: string, name: string) => {
    setPhases(phases.map(p => (p.id === phaseId ? { ...p, name } : p)));
  };

  const setPhaseLayout = (phaseId: string, layout: 'sequential' | 'two-column' | 'three-column') => {
    setPhases(phases => phases.map(p => (p.id === phaseId ? { ...p, layout } : p)));
  };

  const updatePhaseDuration = (phaseId: string, duration: number) => {
    setPhases(phases.map(p => (p.id === phaseId ? { ...p, duration } : p)));
  };

  const getTotalTime = () => {
    return phases.reduce((total, phase) => total + phase.drills.reduce((sum, drill) => sum + drill.duration, 0), 0);
  };

  const saveAndShare = async () => {
    if (!user) {
      alert('Please sign in to share your practice plan.');
      return;
    }

    setIsSharing(true);
    try {
      const planToSave = {
        title: practiceTitle,
        practiceDate: practiceDate,
        phases,
        totalTime: getTotalTime(),
        userId: user.uid,
      };
      
      const id = await practicePlanService.savePracticePlan(planToSave);
      
      const url = `${window.location.origin}/practice-plan/${id}`;
      setShareUrl(url);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Shareable link copied to clipboard!');
      
    } catch (error) {
      console.error('Error sharing plan:', error);
      alert('Failed to create shareable link.');
    } finally {
      setIsSharing(false);
    }
  };

  const loadTemplates = async () => {
    if (!user) return;
      const userTemplates = await practicePlanService.getUserTemplates(user.uid);
      setTemplates(userTemplates);
    setShowTemplates(true);
  };

  const loadTemplate = async (templateId: string) => {
    if (!user) return;
    const template = await practicePlanService.getTemplate(templateId);
    if (template) {
      setPhases(template.phases);
      // setDrills(template.drills);
      setPracticeTitle(template.name); // Optionally set title from template
      setShowTemplates(false);
    } else {
      alert('Template not found or error loading.');
    }
  };

  const saveAsTemplate = async () => {
    if (!user) {
      alert('You must be signed in to save templates.');
      return;
    }
    if (!templateName) {
      alert('Please enter a name for your template.');
      return;
    }

      const templateData = {
        name: templateName,
        description: templateDescription,
      phases,
        totalTime: getTotalTime(),
        userId: user.uid,
      };

    try {
      await practicePlanService.saveTemplate(templateData);
      alert('Template saved successfully!');
      setShowSaveTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      alert('Error saving template. Please try again.');
    }
  };

  const addNewDrill = () => {
    const newDrill = {
      id: `new-drill-${Date.now()}`,
      title: 'New Drill',
      category: 'custom',
      duration: 10,
      description: 'A new custom drill',
      isFavorite: false
    };
    setDrills([...drills, newDrill]);
  };

  const updateLibraryDrill = (drillId: string, updates: Partial<typeof availableDrills[0]>) => {
    setDrills(drills.map(d => d.id === drillId ? { ...d, ...updates } : d));
  };

  const deleteLibraryDrill = (drillId: string) => {
    setDrills(drills.filter(d => d.id !== drillId));
  };

  const toggleDrillFavorite = (drillId: string) => {
    setDrills(drills.map(d => d.id === drillId ? { ...d, isFavorite: !d.isFavorite } : d));
  };

  return (
          <DragDropContext onDragEnd={handleDragEnd}>
    <div className="flex h-[calc(100vh-60px)] bg-slate-900 text-white">
      {/* Left Sidebar: Drill Gallery */}
      <div className="w-1/4 bg-slate-800/50 p-4 overflow-y-auto border-r border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-400">Drill Library</h2>
          <Button onClick={addNewDrill} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-1 h-4 w-4" /> New
                      </Button>
                    </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
            type="text"
                        placeholder="Search drills..."
                        value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border-slate-700 rounded-md pl-10 pr-4 py-2 text-slate-200 placeholder:text-slate-500"
                      />
                    </div>
        <Droppable droppableId="gallery">
                      {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {filteredDrills.map((drill, index) => (
                            <Draggable key={drill.id} draggableId={drill.id} index={index}>
                  {(provided) => (
                    <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                      className="bg-slate-700/80 p-3 rounded-lg shadow-sm hover:bg-slate-600/80 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-100">{drill.title}</h3>
                          <p className="text-sm text-slate-400">{drill.description}</p>
                                      </div>
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-xs text-slate-400">{drill.duration} min</span>
                           <button onClick={() => toggleDrillFavorite(drill.id)} className="focus:outline-none">
                            <Star className={`h-4 w-4 ${drill.isFavorite ? 'text-yellow-400 fill-current' : 'text-slate-500'}`} />
                           </button>
                                    </div>
                                  </div>
                    </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
              </div>

      {/* Main Content: Practice Plan */}
      <main className="w-3/4 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
                              <Input
              type="text"
              value={practiceTitle}
              onChange={e => setPracticeTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0"
            />
                                  <Input
              type="date"
              value={practiceDate}
              onChange={e => setPracticeDate(e.target.value)}
              className="bg-slate-800 border-slate-700 rounded-md"
            />
                                </div>
          <div className="flex items-center gap-2">
             <Button onClick={savePlan} variant="outline" className="bg-white text-slate-800 border-slate-300 hover:bg-slate-100">
              {isSaved ? 'Saved' : 'Save'}
                            </Button>
            <Button onClick={saveAndShare} className="bg-blue-600 hover:bg-blue-700">
              <Share2 className="mr-2 h-4 w-4" /> Share
                            </Button>
            <Button onClick={loadTemplates} variant="outline" className="bg-white text-slate-800 border-slate-300 hover:bg-slate-100">
              <BookOpen className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button onClick={() => setShowSaveTemplate(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="mr-2 h-4 w-4" /> Save as Template
                            </Button>
                          </div>
                        </div>

        <div className="mb-4 text-right text-lg font-semibold">
          Total Time: {getTotalTime()} minutes
        </div>

        {phases.map(phase => (
          <Droppable key={phase.id} droppableId={phase.id}>
                          {(provided, snapshot) => (
              <Card
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                className={`mb-6 rounded-xl shadow-lg transition-all duration-300 ${phase.color} ${snapshot.isDraggingOver ? 'border-emerald-400/80 ring-2 ring-emerald-400/50' : ''}`}
              >
                <CardHeader className="flex flex-row justify-between items-center p-4">
                  <div className="flex items-center gap-2">
                    {editingPhase === phase.id ? (
                      <Input
                        value={phase.name}
                        onChange={e => updatePhaseName(phase.id, e.target.value)}
                        onBlur={() => setEditingPhase(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditingPhase(null)}
                        className="text-xl font-bold bg-slate-700/50 border-none p-1"
                        autoFocus
                      />
                    ) : (
                      <CardTitle className="text-xl font-bold cursor-pointer" onClick={() => setEditingPhase(phase.id)}>
                        {phase.name}
                      </CardTitle>
                    )}
                    <span className="text-sm text-slate-300">({phase.drills.reduce((sum, drill) => sum + drill.duration, 0)} min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={() => setPhaseLayout(phase.id, 'sequential')} className={phase.layout === 'sequential' ? 'text-emerald-400' : ''}><List className="h-5 w-5"/></Button>
                     <Button variant="ghost" size="icon" onClick={() => setPhaseLayout(phase.id, 'two-column')} className={phase.layout === 'two-column' ? 'text-emerald-400' : ''}><Columns className="h-5 w-5"/></Button>
                     <Button variant="ghost" size="icon" onClick={() => setPhaseLayout(phase.id, 'three-column')} className={phase.layout === 'three-column' ? 'text-emerald-400' : ''}><ThreeColumns className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => addCustomDrill(phase.id)}><Plus className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => removePhase(phase.id)}><Trash2 className="h-5 w-5 text-red-500"/></Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className={cn(
                    "grid gap-4",
                    {
                      "grid-cols-1": phase.layout === 'sequential',
                      "grid-cols-2": phase.layout === 'two-column',
                      "grid-cols-3": phase.layout === 'three-column'
                    }
                  )}>
                              {phase.drills.map((drill, index) => (
                      <Draggable key={drill.id} draggableId={drill.id} index={index}>
                        {(provided) => {
                          const isExpanded = expandedDrillId === drill.id;
                          return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                              className={
                                (phase.layout === 'sequential'
                                  ? 'bg-slate-700 rounded-md mb-2 transition-all duration-200 overflow-hidden'
                                  : 'bg-slate-700 rounded-md mb-2 transition-all duration-200 overflow-hidden') +
                                (isExpanded ? ' shadow-lg ring-2 ring-emerald-400/30' : '')
                              }
                            >
                              <div
                                className={
                                  (phase.layout === 'sequential'
                                    ? 'flex items-center gap-2 p-2 cursor-pointer'
                                    : 'flex items-center gap-1 p-2 cursor-pointer')
                                }
                                onClick={() => setExpandedDrillId(isExpanded ? null : drill.id)}
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab p-1">
                                  <GripVertical className="h-4 w-4 text-slate-400" />
                                              </div>
                                              {editingDrill === drill.id ? (
                                                <Input
                                                  value={drill.title}
                                                  onChange={(e) => updateDrill(phase.id, drill.id, { title: e.target.value })}
                                                  onBlur={() => setEditingDrill(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingDrill(null);
                                      }
                                    }}
                                    className={
                                      phase.layout === 'sequential'
                                        ? 'bg-slate-600 border-slate-500 text-white/50 font-bold text-base'
                                        : 'bg-slate-600 border-slate-500 text-white/50 font-bold text-sm'
                                    }
                                    autoFocus
                                                />
                                              ) : (
                                  <span
                                    className={
                                      'font-bold text-white/50 ' +
                                      (phase.layout === 'sequential' ? 'text-base' : 'text-sm')
                                    }
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditingDrill(drill.id);
                                    }}
                                                >
                                                  {drill.title}
                                  </span>
                                              )}
                                            </div>
                              {/* Expanded content */}
                              <div
                                className={
                                  'transition-all duration-200' +
                                  (isExpanded ? ' max-h-96 opacity-100 p-3' : ' max-h-0 opacity-0 p-0 pointer-events-none')
                                }
                                style={{ overflow: 'hidden' }}
                              >
                                <div className="mb-2">
                                  <label className="block text-xs text-slate-400 mb-1">Today's Focus</label>
                                          <Textarea
                                    value={drill.focus || ''}
                                    onChange={e => updateDrill(phase.id, drill.id, { focus: e.target.value })}
                                    placeholder="Add today's focus..."
                                    className="bg-slate-800 border-slate-700 text-sm text-white min-h-[40px]"
                                          />
                                        </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <label className="text-xs text-slate-400">Minutes</label>
                                  <Input
                                    type="number"
                                    value={drill.duration}
                                    onChange={e => updateDrill(phase.id, drill.id, { duration: parseInt(e.target.value, 10) || 0 })}
                                    className="w-16 bg-slate-800 border-slate-700 text-white text-xs"
                                  />
                                      </div>
                                      <Button
                                        size="sm"
                                  variant="destructive"
                                  className="mt-2 w-full"
                                  onClick={() => removeDrill(phase.id, drill.id)}
                                      >
                                  Delete Drill
                                      </Button>
                                    </div>
                                </div>
                          );
                        }}
                      </Draggable>
                    ))}
                                  </div>
                  {provided.placeholder}
                      </CardContent>
                    </Card>
            )}
          </Droppable>
        ))}
        <Button onClick={addPhase} className="w-full mt-4 bg-emerald-800/50 hover:bg-emerald-700/50 border-dashed border-2 border-emerald-600/50">
          <Plus className="mr-2 h-4 w-4"/> Add New Phase
                    </Button>
      </main>
            </div>
          </DragDropContext>
  );
}

export default function PracticePlannerPage() {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobileView) {
    return <MobilePracticePlanner />;
  }
  return <DesktopPracticePlanner />;
} 
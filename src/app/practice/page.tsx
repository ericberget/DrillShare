'use client';

import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PracticeSection } from '@/components/practice/PracticeSection';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

type PracticeItemType = 'warmup' | 'station' | 'drill' | 'game' | 'conditioning';

interface PracticeItem {
  id: string;
  title: string;
  type: PracticeItemType;
  duration: number;
  description?: string;
  equipment?: string[];
  instructions?: string[];
  players?: number;
}

interface PracticeSection {
  id: string;
  title: string;
  items: PracticeItem[];
}

// Mock data for initial practice sections
const initialSections: PracticeSection[] = [
  {
    id: 'warmup',
    title: 'Warm Up',
    items: [
      {
        id: 'warmup-1',
        title: 'Dynamic Stretching',
        type: 'warmup',
        duration: 10,
        description: 'Full body dynamic stretching routine',
        instructions: [
          'Start with light jogging',
          'Perform arm circles',
          'Do walking lunges',
          'Finish with high knees'
        ]
      }
    ]
  },
  {
    id: 'stations',
    title: 'Station Work (30 min)',
    items: [
      {
        id: 'station-1',
        title: 'Catching Stations',
        type: 'station',
        duration: 10,
        players: 8,
        description: 'Focus on catcher fundamentals with tennis ball drills',
        instructions: [
          'Tennis Ball Soft Hands (5 min):',
          '- Catcher in full gear, no glove',
          '- Coach tosses tennis balls from 10 feet away',
          '- Catch with one hand, other hand behind back',
          '- Place balls aside after catching',
          '',
          'Tennis Ball Block (5 min):',
          '- Catcher in blocking position on knees',
          '- Coach throws tennis balls into dirt',
          '- Keep chest over ball, chin down',
          '- Glove covering gap between knees',
          '- Place balls aside after blocking'
        ]
      },
      {
        id: 'station-2',
        title: 'Infield Stations',
        type: 'station',
        duration: 10,
        players: 8,
        description: 'Infield fundamentals with ground ball drills',
        instructions: [
          'Infield Hands Prep (5 min):',
          '- Partners 15 feet apart in defense ready position',
          '- Keep feet planted, throw grounders to each other',
          '- Keep glove out front, eyes on ball',
          '- Practice backhands, forehands, and short hops',
          '- 10 repetitions each type',
          '',
          'Ball in Hand Fungo (5 min):',
          '- Line at shortstop position, ball in throwing hand',
          '- Coach hits fungo ground balls',
          '- Field with glove, keep other ball in throwing hand',
          '- Throw to first base, rotate to back of line',
          '- 5 ground balls per player'
        ]
      },
      {
        id: 'station-3',
        title: 'Baserunning Stations',
        type: 'station',
        duration: 10,
        players: 8,
        description: 'Baserunning fundamentals and leads',
        instructions: [
          'Running Through/Rounding 1st Base (5 min):',
          '- Start in batter\'s box with bat',
          '- Coach simulates wind-up',
          '- Run through 1st base, strike front of bag',
          '- Break down at cone 10 feet past base',
          '- Look towards 1st base fence for overthrows',
          '- 3 repetitions per player',
          '',
          'Leads from 1st Base (5 min):',
          '- Basic lead: 3.5 shuffle steps, return to bag',
          '- Aggressive lead: 4.5 shuffle steps, steal 2nd',
          '- Basic + secondary: 3.5 + 3 aggressive shuffles',
          '- Defensive + secondary: 3 + 3 aggressive shuffles',
          '- 3 repetitions per lead type'
        ]
      }
    ]
  },
  {
    id: 'defensive',
    title: 'Defensive Drills',
    items: [
      {
        id: 'defensive-1',
        title: 'Cutoffs for Infield',
        type: 'drill',
        duration: 15,
        players: 12,
        description: 'Practice proper cutoff positioning and communication between outfielders and infielders',
        instructions: [
          'Setup:',
          '- Outfielders line up in center field',
          '- Middle infielders line up behind 3rd base',
          '- Coach at home plate with fungo bat',
          '',
          'Drill Flow:',
          '1. Coach hits fly ball or ground ball to first outfielder',
          '2. Outfielder fields ball and throws to shortstop',
          '3. Shortstop positions halfway between outfielder and 3rd base',
          '4. Shortstop catches throw and relays to 3rd baseman',
          '5. 3rd baseman places ball in bucket behind them',
          '',
          'Key Points:',
          '- Shortstop should cut distance between outfielder and 3rd base in half',
          '- Line up between outfielder and 3rd base',
          '- Square to outfielder with hands up calling for ball',
          '',
          'Rotation:',
          '- Outfielder moves to back of line',
          '- Infielders rotate between cutoff and 3rd base positions',
          '- After 3 reps in left field, move to center field',
          '- Each outfielder gets 3 repetitions'
        ]
      }
    ]
  }
];

export default function PracticePage() {
  const router = useRouter();
  const [sections, setSections] = useState<PracticeSection[]>(initialSections);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceSection = sections.find(s => s.id === source.droppableId);
    const destSection = sections.find(s => s.id === destination.droppableId);

    if (!sourceSection) return;

    const newSections = [...sections];
    const sourceItems = [...sourceSection.items];
    const [removed] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Moving within the same section
      sourceItems.splice(destination.index, 0, removed);
      newSections[newSections.findIndex(s => s.id === source.droppableId)].items = sourceItems;
    } else {
      // Moving between sections
      if (!destSection) return;
      const destItems = [...destSection.items];
      destItems.splice(destination.index, 0, removed);
      newSections[newSections.findIndex(s => s.id === source.droppableId)].items = sourceItems;
      newSections[newSections.findIndex(s => s.id === destination.droppableId)].items = destItems;
    }

    setSections(newSections);
  };

  const handleAddItem = (sectionId: string) => {
    router.push(`/practice/items/new?section=${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Practice Plan</h1>
          <Button
            className="bg-drillhub-600 hover:bg-drillhub-700"
            onClick={() => router.push('/practice/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Practice Plan
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          {sections.map((section) => (
            <PracticeSection
              key={section.id}
              id={section.id}
              title={section.title}
              items={section.items}
              onAddItem={() => handleAddItem(section.id)}
            />
          ))}
        </DragDropContext>
      </div>
    </div>
  );
} 
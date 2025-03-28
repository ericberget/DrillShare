import { Droppable } from '@hello-pangea/dnd';
import { DraggablePracticeItem } from './DraggablePracticeItem';
import { Button } from '@/components/ui/button';
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

interface PracticeSectionProps {
  id: string;
  title: string;
  items: PracticeItem[];
  onAddItem: () => void;
}

export function PracticeSection({ id, title, items, onAddItem }: PracticeSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          className="border-drillhub-500 text-drillhub-400 hover:bg-drillhub-950"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {items.map((item, index) => (
              <DraggablePracticeItem
                key={item.id}
                id={item.id}
                index={index}
                title={item.title}
                type={item.type}
                duration={item.duration}
                description={item.description}
                equipment={item.equipment}
                instructions={item.instructions}
                players={item.players}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
} 
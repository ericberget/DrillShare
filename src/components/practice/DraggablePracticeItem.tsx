import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Info, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type PracticeItemType = 'warmup' | 'station' | 'drill' | 'game' | 'conditioning';

interface PracticeItem {
  id: string;
  title: string;
  type: PracticeItemType;
  duration: number;
  description?: string;
  instructions?: string[];
  players?: number;
}

interface DraggablePracticeItemProps extends PracticeItem {
  index: number;
}

export function DraggablePracticeItem({
  id,
  index,
  title,
  type,
  duration,
  description,
  instructions,
  players
}: DraggablePracticeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="bg-slate-900/30 border-slate-700/50 hover:border-drillhub-500/30 hover:bg-slate-800/40 transition-all mb-2">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-drillhub-400 font-medium">{type}</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{duration} min</span>
                    </div>
                    {players && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Users className="h-4 w-4" />
                        <span>{players} players</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-medium">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-drillhub-400"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-drillhub-400"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-slate-700/50">
                {description && (
                  <p className="text-slate-300 mb-4">{description}</p>
                )}
                {instructions && instructions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside text-slate-300">
                      {instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  );
} 
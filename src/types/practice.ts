export type PracticeItemType = 'warmup' | 'station' | 'drill' | 'game' | 'conditioning';

export interface PracticeItem {
  id: string;
  title: string;
  type: PracticeItemType;
  duration: number;
  description?: string;
  instructions?: string[];
  players?: number;
}

export interface PracticePlan {
  id: string;
  title: string;
  description: string;
  duration: number;
  items: PracticePlanItem[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isTemplate: boolean;
}

export interface PracticePlanItem {
  itemId: string;
  duration: number;
  notes?: string;
  order: number;
} 
export type VideoCategory = 'hitting' | 'pitching' | 'infield' | 'catching';
export type SkillLevel = 'beginner' | 'littleLeague' | 'highLevel';
export type VideoOrientation = 'vertical' | 'landscape';

export interface Video {
  id: string;
  title: string;
  url: string;
  category: VideoCategory;
  skillLevel: SkillLevel;
  teachingCue: string;
  tags: string[];
  favorite: boolean;
  lastViewed: number;
  thumbnail?: string;
  orientation: VideoOrientation;
  isEditing?: boolean;
}

export interface VideosByCategory {
  [key: string]: Video[];
} 
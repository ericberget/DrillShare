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
  userId?: string;         // User ID who created the video
  userDisplay?: string;    // User display name
  createdAt?: number;      // Timestamp when created
  isSample?: boolean;      // Whether this is a sample video
}

export interface VideosByCategory {
  [key: string]: Video[];
} 
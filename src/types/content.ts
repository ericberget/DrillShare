import { Timestamp } from 'firebase/firestore';

export type ContentCategory = 'hitting' | 'infield' | 'pitching' | 'catching';
export type SkillLevel = 'beginner' | 'littleLeague' | 'highLevel';
export type ContentOrientation = 'vertical' | 'landscape';

export interface ContentItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  url: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  category: ContentCategory;
  skillLevel: SkillLevel;
  tags: string[];
  orientation: ContentOrientation;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isSample: boolean;
  isStarter?: boolean;  // Flag to indicate if this is starter content for new users
  favorite?: boolean;
  lastViewed?: number;
  isTeamContent?: boolean;  // Flag to indicate if this is team content
  sortOrder?: number;  // Manual sort order for custom arrangement
}

export interface Collection {
  id: string;
  createdBy: string; // userId
  name: string;
  description: string; // Coach's notes
  videos: string[]; // Array of videoIds (content item ids)
  shareLink: string;
  hasPassword: boolean;
  password?: string; // Optional password (will be hashed)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expirationDate?: Timestamp;
}

export interface ContentsByCategory {
  hitting: ContentItem[];
  infield: ContentItem[];
  pitching: ContentItem[];
  catching: ContentItem[];
}

// Define a type for content creation that makes userId optional
export type ContentCreationData = Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & {
  userId?: string;
};

// Define a type for collection creation
export type CollectionCreationData = Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'shareLink'>;

export interface ContentContextType {
  contentItems: ContentItem[];
  userContentItems: ContentItem[];
  sampleContentItems: ContentItem[];
  isLoading: boolean;
  isReordering: boolean;
  addContent: (content: ContentCreationData) => Promise<string>;
  updateContent: (content: ContentItem) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  toggleFavorite: (contentId: string) => Promise<void>;
  updateLastViewed: (contentId: string) => Promise<void>;
  updateSortOrders: (sortOrderUpdates: { id: string; sortOrder: number }[]) => Promise<void>;
  resetSortOrders: () => Promise<void>;
}

export interface PlayerAnalysisVideo {
  id: string;
  userId: string;
  playerName: string;
  category: string; // Now represents the player name/tag instead of hitting/pitching
  videoType: 'upload' | 'youtube';
  videoUrl: string;  // For uploads: Firebase Storage URL, For YouTube: YouTube URL
  thumbnailUrl?: string;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fileSize?: number;  // Only for uploaded videos
  fileName?: string;  // Only for uploaded videos
  youtubeVideoId?: string;  // Only for YouTube videos
  orientation: 'landscape' | 'vertical';
  annotations?: VideoAnnotation[];  // Array of annotations for this video
}

// Video annotation types
export type AnnotationTool = 'line' | 'circle' | 'arrow' | 'freehand';

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface VideoAnnotation {
  id: string;
  timestamp: number;  // Video timestamp in seconds
  tool: AnnotationTool;
  points: AnnotationPoint[];  // Array of points for the annotation
  color: string;  // Hex color code
  strokeWidth: number;
  createdAt: Timestamp;
  notes?: string;  // Optional text note for this annotation
} 
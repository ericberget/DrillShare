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
  thumbnailUrl?: string;
  category: ContentCategory;
  skillLevel: SkillLevel;
  tags: string[];
  orientation: ContentOrientation;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isSample: boolean;
  favorite?: boolean;
  lastViewed?: number;
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

export interface ContentContextType {
  contentItems: ContentItem[];
  userContentItems: ContentItem[];
  sampleContentItems: ContentItem[];
  isLoading: boolean;
  addContent: (content: ContentCreationData) => Promise<string>;
  updateContent: (content: ContentItem) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  toggleFavorite: (contentId: string) => Promise<void>;
  updateLastViewed: (contentId: string) => Promise<void>;
} 
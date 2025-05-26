import { ContentItem, ContentCategory, SkillLevel } from '@/types/content';
import { Timestamp } from 'firebase/firestore';

// Helper function to create a sample content item
const createSampleContent = (
  id: string,
  title: string,
  url: string,
  category: ContentCategory,
  skillLevel: SkillLevel,
  tags: string[],
  description: string
): Omit<ContentItem, 'id'> => {
  return {
    userId: 'sample',
    title,
    url,
    category,
    skillLevel,
    tags,
    description,
    orientation: 'vertical',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isSample: true,
    favorite: false
  };
};

export const sampleContentItems: Omit<ContentItem, 'id'>[] = [
  // Hitting samples
  createSampleContent(
    'hitting1',
    'Basic Batting Stance',
    'https://www.youtube.com/watch?v=NyB6o-q8xEw',
    'hitting',
    'beginner',
    ['stance', 'basics', 'fundamentals'],
    'Learn the proper batting stance for beginners, focusing on balance and posture.'
  ),
  createSampleContent(
    'hitting2',
    'Perfect Swing Mechanics',
    'https://www.youtube.com/watch?v=sSdAAX0jAXs',
    'hitting',
    'littleLeague',
    ['swing', 'mechanics', 'power'],
    'Detailed breakdown of swing mechanics for improved contact and power.'
  ),
  createSampleContent(
    'hitting3',
    'Advanced Hitting Drills',
    'https://www.youtube.com/watch?v=iB2pGT5IC5c',
    'hitting',
    'highLevel',
    ['drills', 'advanced', 'timing'],
    'Professional-level hitting drills to improve timing and bat speed.'
  ),
  
  // Infield samples
  createSampleContent(
    'infield1',
    'Fielding Grounders Basics',
    'https://www.youtube.com/watch?v=JbcjEh0LU5I',
    'infield',
    'beginner',
    ['grounders', 'fundamentals', 'glove position'],
    'Learn the proper technique for fielding ground balls, including glove position and body posture.'
  ),
  createSampleContent(
    'infield2',
    'Double Play Turns',
    'https://www.youtube.com/watch?v=G3B1beV8FwY',
    'infield',
    'littleLeague',
    ['double play', 'middle infield', 'footwork'],
    'Master the footwork and technique for turning double plays effectively.'
  ),
  
  // Pitching samples
  createSampleContent(
    'pitching1',
    'Basic Pitching Mechanics',
    'https://www.youtube.com/watch?v=1YDhjvvXPfk',
    'pitching',
    'beginner',
    ['mechanics', 'fundamentals', 'delivery'],
    'Learn proper pitching mechanics and delivery fundamentals.'
  ),
  createSampleContent(
    'pitching2',
    'Developing a Changeup',
    'https://www.youtube.com/watch?v=22JgW_xruhQ',
    'pitching',
    'littleLeague',
    ['changeup', 'grip', 'off-speed'],
    'Step-by-step guide to developing an effective changeup pitch.'
  ),
  createSampleContent(
    'pitching3',
    'Advanced Breaking Ball Techniques',
    'https://www.youtube.com/watch?v=mVyJr3D2cVA',
    'pitching',
    'highLevel',
    ['breaking ball', 'curveball', 'slider'],
    'Master the art of throwing effective breaking balls with proper grip and wrist action.'
  ),
  
  // Catching samples
  createSampleContent(
    'catching1',
    "Catcher's Stance and Signals",
    'https://www.youtube.com/watch?v=qB5_yZuG42I',
    'catching',
    'beginner',
    ['stance', 'signals', 'fundamentals'],
    'Learn the proper catcher stance and how to give effective signals to your pitcher.'
  ),
  createSampleContent(
    'catching2',
    'Blocking Techniques',
    'https://www.youtube.com/watch?v=e6HA1BNqg5Y',
    'catching',
    'littleLeague',
    ['blocking', 'technique', 'wild pitches'],
    'Master the art of blocking wild pitches and keeping runners from advancing.'
  )
];

// Function to seed the database with sample content
export const seedSampleContent = async (createFn: (content: Omit<ContentItem, 'id'>) => Promise<string>) => {
  for (const content of sampleContentItems) {
    try {
      await createFn(content);
      console.log(`Created sample content: ${content.title}`);
    } catch (error) {
      console.error(`Error creating sample content: ${content.title}`, error);
    }
  }
}; 
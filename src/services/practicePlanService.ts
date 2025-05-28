import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PracticePlan {
  id?: string;
  title: string;
  practiceDate: string;
  phases: any[];
  totalTime: number;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PracticeTemplate {
  id?: string;
  name: string;
  description?: string;
  phases: any[];
  totalTime: number;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const practicePlanService = {
  // Save a new practice plan
  async savePracticePlan(practicePlan: Omit<PracticePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'practicePlans'), {
        ...practicePlan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving practice plan:', error);
      throw new Error('Failed to save practice plan');
    }
  },

  // Get a practice plan by ID
  async getPracticePlan(id: string): Promise<PracticePlan | null> {
    console.log('practicePlanService.getPracticePlan called with ID:', id);
    try {
      const docRef = doc(db, 'practicePlans', id);
      console.log('Created doc reference:', docRef.path);
      const docSnap = await getDoc(docRef);
      console.log('Document exists:', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Document data:', data);
        const result = {
          id: docSnap.id,
          ...data
        } as PracticePlan;
        console.log('Returning practice plan:', result);
        return result;
      } else {
        console.log('Document does not exist');
        return null;
      }
    } catch (error) {
      console.error('Error getting practice plan:', error);
      throw new Error('Failed to get practice plan');
    }
  },

  // Get all practice plans for a user
  async getUserPracticePlans(userId: string): Promise<PracticePlan[]> {
    try {
      const q = query(
        collection(db, 'practicePlans'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const practicePlans: PracticePlan[] = [];
      
      querySnapshot.forEach((doc) => {
        practicePlans.push({
          id: doc.id,
          ...doc.data()
        } as PracticePlan);
      });
      
      return practicePlans;
    } catch (error) {
      console.error('Error getting user practice plans:', error);
      throw new Error('Failed to get practice plans');
    }
  },

  // Save a practice template
  async saveTemplate(template: Omit<PracticeTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'practiceTemplates'), {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving practice template:', error);
      throw new Error('Failed to save practice template');
    }
  },

  // Get all templates for a user
  async getUserTemplates(userId: string): Promise<PracticeTemplate[]> {
    try {
      const q = query(
        collection(db, 'practiceTemplates'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: PracticeTemplate[] = [];
      
      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data()
        } as PracticeTemplate);
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting user templates:', error);
      throw new Error('Failed to get templates');
    }
  },

  // Get a template by ID
  async getTemplate(id: string): Promise<PracticeTemplate | null> {
    try {
      const docRef = doc(db, 'practiceTemplates', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as PracticeTemplate;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting template:', error);
      throw new Error('Failed to get template');
    }
  }
}; 
'use client';

import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: any;
  updatedAt: any;
}

const USERS_COLLECTION = 'users';

// Create a new user document in Firestore
export const createUserDocument = async (
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  emailVerified: boolean = false
): Promise<void> => {
  try {
    console.log(`Creating user document for ${email} with uid: ${uid}`);
    
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userData: UserDocument = {
      uid,
      email,
      displayName,
      photoURL,
      emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, userData);
    console.log(`Successfully created user document for ${email}`);
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Get a user document from Firestore
export const getUserDocument = async (uid: string): Promise<UserDocument | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserDocument;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Update a user document in Firestore
export const updateUserDocument = async (
  uid: string,
  updateData: Partial<UserDocument>
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    console.log(`Successfully updated user document for uid: ${uid}`);
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

// Create or update user document (for Google sign-in)
export const createOrUpdateUserDocument = async (
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  emailVerified: boolean = false
): Promise<void> => {
  try {
    console.log(`Creating or updating user document for ${email}`);
    
    const existingUser = await getUserDocument(uid);
    
    if (existingUser) {
      // Update existing user
      await updateUserDocument(uid, {
        email,
        displayName,
        photoURL,
        emailVerified
      });
      console.log(`Updated existing user document for ${email}`);
    } else {
      // Create new user
      await createUserDocument(uid, email, displayName, photoURL, emailVerified);
      console.log(`Created new user document for ${email}`);
    }
  } catch (error) {
    console.error('Error creating or updating user document:', error);
    throw error;
  }
}; 
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we're in a build environment or if credentials are missing
const isCredentialsAvailable = () => {
  return process.env.FIREBASE_PROJECT_ID && 
         process.env.FIREBASE_CLIENT_EMAIL && 
         process.env.FIREBASE_PRIVATE_KEY;
};

let app: any = null;

// Lazy initialization function
const initializeFirebaseAdmin = () => {
  if (app) return app;

  if (!isCredentialsAvailable()) {
    console.warn('Firebase Admin credentials not available. Some features may not work.');
    return null;
  }

  try {
    const apps = getApps();
    
    if (apps.length > 0) {
      app = apps[0];
    } else {
      const firebaseAdminConfig = {
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      };
      
      app = initializeApp(firebaseAdminConfig);
    }
    
    console.log('Firebase Admin initialized successfully');
    return app;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    return null;
  }
};

// Export lazy-initialized services
export const getAdminAuth = () => {
  const adminApp = initializeFirebaseAdmin();
  return adminApp ? getAuth(adminApp) : null;
};

export const getAdminDb = () => {
  const adminApp = initializeFirebaseAdmin();
  return adminApp ? getFirestore(adminApp) : null;
};

// For backward compatibility
export const auth = new Proxy({} as any, {
  get(target, prop) {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      throw new Error('Firebase Admin Auth not available. Check your credentials.');
    }
    return adminAuth[prop as keyof typeof adminAuth];
  }
});

export const adminDb = new Proxy({} as any, {
  get(target, prop) {
    const db = getAdminDb();
    if (!db) {
      throw new Error('Firebase Admin Firestore not available. Check your credentials.');
    }
    return db[prop as keyof typeof db];
  }
}); 
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This function ensures Firebase Admin is initialized only once.
function getAdminApp(): App | null {
  // If the app is already initialized, return it.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // This line is crucial for parsing the private key from a single-line env var.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Verify that all required service account properties are available.
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      console.error('Firebase Admin credentials are not fully available in environment variables.');
      return null;
    }

    console.log('Attempting to initialize Firebase Admin...');
    const app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
      storageBucket: `${serviceAccount.projectId}.appspot.com`,
    });
    console.log('Firebase Admin initialized successfully.');
    return app;
  } catch (error: any) {
    console.error('!!! Critical Error Initializing Firebase Admin !!!');
    console.error(error.message);
    if (error.errorInfo) {
      console.error('Firebase Admin Error Info:', error.errorInfo);
    }
    return null;
  }
}

// Export functions that provide the initialized services.
// They will return null if the initialization failed.
export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

// Export the initialized DB instance directly for convenience.
// Code using this must handle the possibility of it being null.
export const adminDb = getAdminDb();

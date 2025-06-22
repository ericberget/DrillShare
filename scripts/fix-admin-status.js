require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Firebase Admin credentials not found in .env.local. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function fixAdminStatus() {
  try {
    const userId = 'uFjSMoXun5NUMw4bDCwfLgocZfl2';
    
    // Update the user document to have isAdmin: true
    await db.collection('users').doc(userId).update({
      isAdmin: true,
      adminGrantedAt: new Date(),
      adminGrantedBy: 'fix-script'
    });
    
    console.log(`Successfully updated user ${userId} to have admin privileges`);
    
    // Verify the update
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists()) {
      console.log('Updated user data:', userDoc.data());
    }
    
  } catch (error) {
    console.error('Error updating admin status:', error);
  } finally {
    process.exit(0);
  }
}

fixAdminStatus(); 
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

async function checkUserStatus() {
  try {
    // First, let's find the user document by email
    const usersRef = db.collection('users');
    const q = usersRef.where('email', '==', 'berget3333@gmail.com');
    const querySnapshot = await q.get();
    
    if (querySnapshot.empty) {
      console.log('No user found with email berget3333@gmail.com');
      return;
    }
    
    querySnapshot.forEach((doc) => {
      console.log('User document found:');
      console.log('Document ID:', doc.id);
      console.log('User data:', doc.data());
      console.log('isAdmin field:', doc.data().isAdmin);
    });
    
  } catch (error) {
    console.error('Error checking user status:', error);
  } finally {
    process.exit(0);
  }
}

checkUserStatus(); 
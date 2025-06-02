const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up your service account)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Or use service account key file
    // credential: admin.credential.cert('./path-to-service-account-key.json'),
  });
}

const db = admin.firestore();

async function fixShareLinks() {
  try {
    console.log('Starting share link migration...');
    
    // Get all collections
    const collectionsRef = db.collection('collections');
    const snapshot = await collectionsRef.get();
    
    let updated = 0;
    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Check if the share link contains localhost
      if (data.shareLink && data.shareLink.includes('localhost')) {
        console.log(`Found collection with localhost link: ${doc.id}`);
        console.log(`Current link: ${data.shareLink}`);
        
        // Extract the share ID from the existing link
        const shareIdMatch = data.shareLink.match(/\/share\/collections\/(.+)$/);
        if (shareIdMatch) {
          const shareId = shareIdMatch[1];
          const newShareLink = `https://drillshare.netlify.app/share/collections/${shareId}`;
          
          console.log(`New link: ${newShareLink}`);
          
          // Add to batch update
          batch.update(doc.ref, { 
            shareLink: newShareLink,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          updated++;
        }
      }
    });
    
    if (updated > 0) {
      console.log(`Updating ${updated} collections...`);
      await batch.commit();
      console.log('Migration completed successfully!');
    } else {
      console.log('No collections with localhost links found.');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the admin app
    admin.app().delete();
  }
}

// Run the migration
fixShareLinks(); 
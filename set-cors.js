const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

async function setCors() {
  try {
    console.log('Starting CORS configuration...');
    
    // Initialize Firebase Admin with explicit project ID
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'drillshare-e35f2'
    });

    // Get storage instance
    const storage = admin.storage(app);
    
    // Get bucket with explicit name - using the correct bucket name from Firebase Console
    const bucket = storage.bucket('drillshare-e35f2.firebasestorage.app');
    console.log('Attempting to configure bucket:', bucket.name);

    // Simple CORS configuration
    const corsConfig = [{
      origin: ["*"],
      method: ["GET", "POST", "PUT", "DELETE", "HEAD"],
      responseHeader: [
        "Content-Type",
        "Content-Length",
        "Accept",
        "Authorization",
        "Origin",
        "Range"
      ],
      maxAgeSeconds: 3600
    }];

    console.log('Setting CORS configuration...');
    
    // Set CORS configuration
    await bucket.setCorsConfiguration(corsConfig);
    console.log('CORS configuration set successfully');
    
    // Verify the configuration
    const [metadata] = await bucket.getMetadata();
    console.log('Current CORS configuration:', JSON.stringify(metadata.cors, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setCors(); 
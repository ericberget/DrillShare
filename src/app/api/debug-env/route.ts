import { NextResponse } from 'next/server';

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const adminSecret = process.env.ADMIN_SECRET;

  const getStatus = (variable: string | undefined) => {
    if (variable) {
      return `Loaded (length: ${variable.length})`;
    }
    return 'MISSING or empty';
  };

  const privateKeyPreview = privateKey 
    ? `${privateKey.substring(0, 30)}...${privateKey.substring(privateKey.length - 30)}`
    : 'N/A';

  return NextResponse.json({
    message: "This is a temporary debug route. It should be deleted after troubleshooting.",
    env_variables_status: {
      FIREBASE_PROJECT_ID: getStatus(projectId),
      FIREBASE_CLIENT_EMAIL: getStatus(clientEmail),
      FIREBASE_PRIVATE_KEY: getStatus(privateKey),
      ADMIN_SECRET: getStatus(adminSecret),
    },
    private_key_preview: privateKeyPreview,
  });
} 
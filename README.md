# DrillShare

A web application for managing and sharing baseball training videos.

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/ericberget/DrillShare.git
cd DrillShare
```

2. Create a `.env.local` file in the project root with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Set up Firebase Service Account:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Project Settings
   - Go to Service Accounts tab
   - Click "Generate New Private Key"
   - Save the downloaded file as `service-account.json` in the project root

4. Install dependencies:
```bash
npm install
```

5. Start the development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

## CORS Configuration

If you need to upload videos, you'll need to configure CORS for Firebase Storage:

1. Make sure you have the `service-account.json` file in your project root
2. Run the CORS configuration script:
```bash
node set-cors.js
```

## Features

- Upload and manage baseball training videos
- Support for both YouTube videos and direct video uploads
- Organize videos by player and category
- Share videos with team members
- Modern, responsive UI

## Tech Stack

- Next.js 14
- Firebase (Auth, Storage, Firestore)
- Tailwind CSS
- TypeScript

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

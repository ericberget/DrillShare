'use client';

import './globals.css'
import { Inter, Oswald } from 'next/font/google'
import { Providers } from '../components/Providers'
import { PageTransition } from '@/components/animations'
import { FooterClientOnly } from '../components/FooterClientOnly'
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })
const oswald = Oswald({ 
  subsets: ['latin'],
  variable: '--font-oswald'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // Fallback for SSR/SSG: usePathname hook only works in client components
  // We'll use a dynamic import for the footer to ensure client-side rendering

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>DrillShare</title>
        <meta name="description" content="Share and discover baseball drills" />
        
        {/* Favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Meta tags for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${inter.className} ${oswald.variable} min-h-screen bg-slate-900 text-slate-200 bg-gradient-glow bg-mesh bg-glow`}>
        <Providers>
          <PageTransition>
            {children}
            <FooterClientOnly />
          </PageTransition>
        </Providers>
      </body>
    </html>
  )
}

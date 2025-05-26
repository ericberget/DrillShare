'use client';

import './globals.css'
import { Inter, Oswald } from 'next/font/google'
import { Providers } from '../components/Providers'

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>DrillShare</title>
        <meta name="description" content="Share and discover baseball drills" />
      </head>
      <body className={`${inter.className} ${oswald.variable} min-h-screen bg-slate-900 text-slate-200 bg-gradient-glow bg-mesh bg-glow`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

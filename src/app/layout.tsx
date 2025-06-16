'use client';

import './globals.css'
import { Inter, Oswald } from 'next/font/google'
import { Providers } from '../components/Providers'
import { PageTransition } from '@/components/animations'
import { usePathname } from 'next/navigation';
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
            {/* Footer: only show if not on home page */}
            {typeof window !== 'undefined' && pathname !== '/' && (
              <footer 
                className="border-t border-slate-800/30 mt-0 relative z-10"
                style={{
                  backgroundImage: "url('/bg-5b.jpg')",
                  backgroundRepeat: "repeat-x",
                  backgroundSize: "auto 100%",
                  backgroundPosition: "center",
                }}
              >
                <div className="container mx-auto py-12 px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                      <img 
                        src="/logo-small.png" 
                        alt="DrillShare Logo" 
                        className="h-12 opacity-90"
                      />
                      <p className="text-slate-400 text-sm">
                        Professional video analysis and coaching tools for baseball players and coaches.
                      </p>
                    </div>
                    {/* Quick Links */}
                    <div>
                      <h3 className="text-slate-300 font-semibold mb-4">Quick Links</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                            Home
                          </Link>
                        </li>
                        <li>
                          <Link href="/player-analysis" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                            Player Analysis
                          </Link>
                        </li>
                        <li>
                          <Link href="/drill-library" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                            Drill Library
                          </Link>
                        </li>
                        <li>
                          <Link href="/film-room" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                            Film Room
                          </Link>
                        </li>
                      </ul>
                    </div>
                    {/* Contact/Feedback */}
                    <div>
                      <h3 className="text-slate-300 font-semibold mb-4">Get in Touch</h3>
                      <p className="text-slate-400 text-sm mb-4">
                        Have feedback or questions? We'd love to hear from you.
                      </p>
                      <div className="flex gap-3">
                        <Link 
                          href="/contact" 
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          Contact Us
                        </Link>
                        <Link
                          href="/feature-request"
                          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-slate-200 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a7 7 0 0 1 7 7c0 3.5-2.5 6.5-7 13-4.5-6.5-7-9.5-7-13a7 7 0 0 1 7-7z"/>
                            <circle cx="12" cy="9" r="2.5"/>
                          </svg>
                          Feature Request
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* Bottom Bar */}
                  <div className="border-t border-slate-800/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                      © {new Date().getFullYear()} DrillShare. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                      <Link href="/privacy" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
                        Privacy Policy
                      </Link>
                      <Link href="/terms" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
                        Terms of Service
                      </Link>
                    </div>
                  </div>
                </div>
              </footer>
            )}
          </PageTransition>
        </Providers>
      </body>
    </html>
  )
}

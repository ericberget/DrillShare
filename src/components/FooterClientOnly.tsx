"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function FooterClientOnly() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer 
      className="border-t border-slate-800/30 mt-0 relative z-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(13,22,45,0.97), rgba(13,22,45,0.97)),
          url('/bg-5b.jpg')
        `,
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
              Coaching tools for baseball players and coaches.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-slate-300 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/content" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  My Video Library
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/practice-planner" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Quick Practice Planner
                </Link>
              </li>
              <li>
                <Link href="/player-analysis" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Film Room
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Pricing
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
                href="/contact"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-slate-200 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6"/>
                  <path d="M12 22v-4"/>
                  <path d="M5 12h14"/>
                  <path d="M7 7l10 10"/>
                  <path d="M17 7L7 17"/>
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
  );
} 
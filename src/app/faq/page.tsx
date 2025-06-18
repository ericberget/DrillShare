import React from 'react';
import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-400 mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">What are "Collections"?</h2>
            <p className="text-slate-400">Collections let you group together related training videos, drills, or resources. You can organize content for a specific team, skill, or season, and share collections with others using a single link.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">What is the "Player Analysis" section?</h2>
            <p className="text-slate-400">Player Analysis is where you can upload or link videos for detailed review. Use drawing tools and notes to break down mechanics, highlight strengths, and track progress over time. Great for coaches and athletes alike.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">How does the "Practice Planner" work?</h2>
            <p className="text-slate-400">The Practice Planner helps you design, organize, and share structured practice plans. Add drills, set durations, and create a clear agenda for your team. Plans can be saved, reused, and shared with a link.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Is DrillShare free? What about pricing?</h2>
            <p className="text-slate-400">DrillShare is currently <span className="text-emerald-400 font-semibold">100% free</span> during our beta period. In the future, we plan to offer premium features for $5–$10/month, but all core features are free for now. We'll notify users well in advance before any changes.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Can I share my content with others?</h2>
            <p className="text-slate-400">Yes! You can share individual videos, collections, or practice plans with a simple link. No account is required for viewers to access shared content.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">How do I get support or request a feature?</h2>
            <p className="text-slate-400">We love feedback! Please use our <Link href="/contact" className="text-emerald-400 hover:underline">Contact</Link> page to reach out with questions, bug reports, or feature requests.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Is my data private and secure?</h2>
            <p className="text-slate-400">We take privacy seriously. Your videos and collections are private by default. Only people with your share links can view shared content. For more, see our <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>.</p>
          </section>
        </div>
        <div className="mt-12 text-center">
          <Link href="/" className="text-emerald-400 hover:underline text-lg">Back to Home</Link>
        </div>
      </div>
    </div>
  );
} 
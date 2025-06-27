"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen text-white py-12 px-4 relative" style={{ backgroundColor: '#0D1529' }}>
      <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none" style={{ backgroundImage: "url('/bgCoach.jpg')" }} />
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-2 md:px-8">
          {/* Back Button */}
          <div className="max-w-6xl mx-auto px-2 md:px-8 mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 text-base font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              <span>Back to Home</span>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-16 mb-10 md:mb-20">
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              <Image
                src="/stackPics.png"
                alt="Coach and kids"
                width={480}
                height={480}
                className="rounded-2xl shadow-xl object-cover"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-600 mb-4 tracking-tight">About DrillShare</h1>
              <p className="text-lg text-slate-200 mb-4 leading-relaxed">
                Hi, I'm Eric, a baseball dad and coach. Like a lot of parents, I found myself helping coach my kids' teams—one is 12, the other is 8. Over the years, I've juggled practice plans, drills, and video links scattered across notetaking apps, email chains, and random group texts. It was hard to keep everything organized, let alone share it with other coaches or parents.
              </p>
              <p className="text-lg text-slate-200 mb-4 leading-relaxed">
                DrillShare was born out of that chaos. I wanted a simple, beautiful way to gather, organize, and share baseball training videos and ideas. Whether you're a head coach, an assistant, or just a parent trying to help out, I hope DrillShare makes your coaching life a little easier—and helps more kids fall in love with the game.
              </p>
              <p className="text-base text-slate-400 mt-6">
                Have feedback or want to connect? <Link href="/contact" className="text-emerald-400 hover:underline">Contact me here</Link>.
              </p>
            </div>
          </div>
        </div>
        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20 mb-20 bg-white rounded-2xl shadow-2xl p-10 md:p-16">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-600 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">What is DrillShare?</h3>
              <p className="text-slate-700">DrillShare is a web app for baseball coaches and parents to organize, store, and share training videos, drills, and practice plans in one place. No more scattered links or lost notes!</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Who is DrillShare for?</h3>
              <p className="text-slate-700">Anyone who helps coach baseball—head coaches, assistants, or parents. If you want to make practices more effective and keep your team organized, DrillShare is for you.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Is DrillShare free?</h3>
              <p className="text-slate-700">Yes! DrillShare is currently free while we continue to improve and add features. To help keep my hosting costs reasonable, there is a limit to how many videos you can upload to the Film Room. In the future, I may introduce a tiered pricing plan for users who want to upload dozens of videos or need expanded storage—so everyone can find the right fit. Your feedback helps shape the future of the app.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Can I share my content with others?</h3>
              <p className="text-slate-700">Absolutely. You can share individual videos, collections, or practice plans with a simple link. No account is required for viewers to access shared content.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">How do I get support or request a feature?</h3>
              <p className="text-slate-700">We love feedback! Please use our <Link href="/contact" className="text-emerald-600 hover:underline">Contact</Link> page to reach out with questions, bug reports, or feature requests.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">What isn't DrillShare?</h3>
              <p className="text-slate-700">DrillShare isn't a replacement for in-person coaching, team management apps, or live game streaming. It's not a social network or a place for public video sharing—it's a private, practical tool for coaches and parents to organize and share training content with their teams.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
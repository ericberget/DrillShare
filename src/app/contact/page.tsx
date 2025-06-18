'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, addDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, db } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    if (!db) {
      setError('Database not available. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Basic validation
      if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
        setError('Please fill in all fields');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Save to Firestore
      const feedbackData = {
        name,
        email,
        subject,
        message,
        userId: user?.uid || 'anonymous',
        createdAt: Timestamp.now(),
        status: 'new'
      };

      await addDoc(collection(db, 'feedback'), feedbackData);

      // Show success message
      setSuccess(true);
      
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header
        className="border-b border-slate-800/30"
        style={{
          backgroundImage: "url('/bgtexture.jpg')",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto py-8 md:py-12">
          <div className="flex flex-col items-center gap-6 md:gap-8">
            {/* Centered Logo */}
            <div className="text-center order-1 md:order-2" style={{ marginTop: '-40px', marginBottom: '20px' }}>
              <img 
                src="/contactTitle.png" 
                alt="Contact Us" 
                className="h-20 md:h-24 mx-auto"
              />
            </div>
            
            {/* Navigation Row */}
            <div className="flex items-center justify-between w-full order-2 md:order-1 md:mt-8 md:-mb-16">
              <div className="flex items-center gap-2 md:gap-4">
                <Link href="/" className="flex items-center gap-2 md:gap-4 text-slate-400 hover:text-slate-300 opacity-50 hover:opacity-100 transition-all text-sm md:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                  </svg>
                  <span className="font-medium">Back to DrillShare</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-900/30 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200 text-2xl">Contact Us</CardTitle>
              <CardDescription className="text-slate-400">
                Have questions or feedback? We'd love to hear from you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-300">Message</Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-32 rounded-md border border-slate-700 bg-slate-800 text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="Your message here..."
                    required
                  />
                </div>

                {error && (
                  <Alert className="bg-red-900/20 border border-red-800 text-red-300">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-emerald-900/20 border border-emerald-800 text-emerald-300">
                    <AlertDescription>
                      Thank you for your message! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </div>
              </form>
              {/* Contact Info Section */}
              <div className="mt-10 border-t border-slate-700 pt-8">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Other Ways to Reach Me
                </h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>Email:</span>
                    <a href="mailto:berget3333@gmail.com" className="text-emerald-400 hover:underline">berget3333@gmail.com</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37V7.5a2.5 2.5 0 0 0-5 0v3.87"/><path d="M12 17v.01"/></svg>
                    <span>LinkedIn:</span>
                    <a href="https://www.linkedin.com/in/ericberget/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">linkedin.com/in/ericberget</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
                    <span>Website:</span>
                    <a href="https://ericberget.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">ericberget.com</a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ContactPage; 
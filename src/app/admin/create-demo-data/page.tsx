'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function CreateDemoDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createDemoData = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/create-demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Create Demo Data</CardTitle>
            <CardDescription className="text-slate-400">
              This will duplicate content from berget3333@gmail.com account to create demo data.
              It will first clean up any existing sample/demo data, then create new demo data with real URLs and content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">What this will do:</h3>
              <ul className="text-slate-300 space-y-1 text-sm">
                <li>• Delete all existing sample content (isSample: true)</li>
                <li>• Delete all existing demo content (userId: 'demo')</li>
                <li>• Delete all existing demo player analysis videos</li>
                <li>• Fetch real content from berget3333@gmail.com account</li>
                <li>• Create demo copies with real URLs, titles, and tags</li>
                <li>• Mark content as sample data for demo mode</li>
              </ul>
            </div>

            <Button 
              onClick={createDemoData} 
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Demo Data...
                </>
              ) : (
                'Create Demo Data'
              )}
            </Button>

            {error && (
              <Alert className="border-red-500 bg-red-950/50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-300">
                  Error: {error}
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="border-green-500 bg-green-950/50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-300">
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            {result?.summary && (
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 p-3 rounded">
                      <div className="text-slate-400 text-sm">Content Items</div>
                      <div className="text-white font-semibold">
                        {result.summary.contentItems.source} → {result.summary.contentItems.created}
                      </div>
                    </div>
                    <div className="bg-slate-700 p-3 rounded">
                      <div className="text-slate-400 text-sm">Player Analysis Videos</div>
                      <div className="text-white font-semibold">
                        {result.summary.playerAnalysisVideos.source} → {result.summary.playerAnalysisVideos.created}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-slate-400 text-sm mb-2">Cleanup</div>
                    <div className="text-white text-sm">
                      Deleted {result.summary.cleanup.deletedSampleContent} sample content, {' '}
                      {result.summary.cleanup.deletedDemoContent} demo content, {' '}
                      {result.summary.cleanup.deletedDemoPlayerAnalysis} demo player analysis videos
                    </div>
                  </div>

                  {result.summary.sampleData.content.length > 0 && (
                    <div className="bg-slate-700 p-3 rounded">
                      <div className="text-slate-400 text-sm mb-2">Sample Content Created</div>
                      <div className="space-y-2">
                        {result.summary.sampleData.content.map((item: any, index: number) => (
                          <div key={index} className="text-white text-sm">
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-slate-300 text-xs">{item.url}</div>
                            <div className="text-slate-400 text-xs">
                              {item.category} • {item.tags.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.summary.sampleData.playerAnalysis.length > 0 && (
                    <div className="bg-slate-700 p-3 rounded">
                      <div className="text-slate-400 text-sm mb-2">Sample Player Analysis Created</div>
                      <div className="space-y-2">
                        {result.summary.sampleData.playerAnalysis.map((video: any, index: number) => (
                          <div key={index} className="text-white text-sm">
                            <div className="font-semibold">{video.playerName}</div>
                            <div className="text-slate-300 text-xs">{video.videoUrl}</div>
                            <div className="text-slate-400 text-xs">
                              {video.videoType} • {video.notes}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
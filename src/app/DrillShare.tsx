import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CoachingApp = () => {
  // Initial video data
  const initialVideos = {
    hitting: [
      {
        id: 'default-1',
        title: 'Fixing Bat Lag Drill',
        url: 'https://www.youtube.com/watch?v=6dfjV84ZN1g',
        category: 'hitting',
        skillLevel: 'highLevel',
        teachingCue: 'Replace the elbow, 10lb weight, one hand swing',
        tags: ['mechanics', 'drills']
      },
      {
        id: 'default-2',
        title: 'Elbow In Palm Up',
        url: 'https://www.facebook.com/share/r/15JmP8kffq/',
        category: 'hitting',
        skillLevel: 'littleLeague',
        teachingCue: 'Focus on keeping elbow in with palm up position',
        tags: ['mechanics', 'fundamentals']
      },
      {
        id: 'default-3',
        title: 'Load Position - Chest Over Back Foot',
        url: 'https://www.facebook.com/reel/1650842449194914',
        category: 'hitting',
        skillLevel: 'highLevel',
        teachingCue: 'Load is not turn the shoulders...it\'s Chest over back foot',
        tags: ['mechanics', 'load']
      },
      {
        id: 'default-4',
        title: 'Fused Swing Visual',
        url: 'https://www.facebook.com/share/r/12JKZHwwTx1/',
        category: 'hitting',
        skillLevel: 'highLevel',
        teachingCue: 'Visual demonstration of fused swing mechanics',
        tags: ['mechanics', 'advanced']
      }
    ],
    pitching: [
      {
        id: 'default-5',
        title: 'Coil Mechanics',
        url: 'https://www.facebook.com/share/r/gY5rPBqfoyd67SLv/',
        category: 'pitching',
        skillLevel: 'highLevel',
        teachingCue: 'Not Tall and Fall or drop... Screw Yourself into the ground (COIL)',
        tags: ['mechanics', 'advanced']
      },
      {
        id: 'default-6',
        title: 'Whip vs Push Mechanics',
        url: 'https://www.facebook.com/share/r/8Pct4W864EjmoJmB/',
        category: 'pitching',
        skillLevel: 'highLevel',
        teachingCue: 'For better velocity Make a Whip, (not a push) - and recoil',
        tags: ['mechanics', 'velocity']
      }
    ],
    infield: [],
    catching: [],
    other: []
  };

  // State declarations
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('hitting');
  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem('baseballVideos');
    return saved ? JSON.parse(saved) : initialVideos;
  });

  // Save to localStorage whenever videos change
  useEffect(() => {
    localStorage.setItem('baseballVideos', JSON.stringify(videos));
  }, [videos]);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
    } catch (e) {
      console.error('Invalid URL:', e);
    }
    return null;
  };

  // Add new video to collection
  const addVideo = (videoData) => {
    const newVideo = {
      id: Date.now().toString(),
      ...videoData
    };
    setVideos(prev => ({
      ...prev,
      [videoData.category]: [...(prev[videoData.category] || []), newVideo]
    }));
    setShowAddForm(false);
  };

  // Save edited video
  const handleSaveEdit = (updatedVideo) => {
    setVideos(prev => ({
      ...prev,
      [updatedVideo.category]: prev[updatedVideo.category].map(v => 
        v.id === updatedVideo.id ? { ...updatedVideo, isEditing: false } : v
      )
    }));
    setSelectedVideo(null);
  };

  // Video card component
  const VideoCard = ({ video }) => {
    const youtubeId = getYouTubeVideoId(video.url);
    
    const handleEdit = (e) => {
      e.stopPropagation();
      setSelectedVideo({ ...video, isEditing: true });
    };
    
    return (
      <Card className="mb-4 hover:bg-slate-800 cursor-pointer bg-slate-800/50 border-slate-700" onClick={() => setSelectedVideo({ ...video, isEditing: false })}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-slate-400">{video.title}</CardTitle>
              <Button 
                onClick={handleEdit}
                variant="ghost" 
                size="sm"
                className="text-slate-400 hover:text-slate-300"
              >
                ✎
              </Button>
            </div>
            <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-400/30">
              {video.skillLevel === 'beginner' ? 'Beginner' :
               video.skillLevel === 'littleLeague' ? 'Little League' : 'High Level'}
            </Badge>
          </div>
          {youtubeId && (
            <img 
              src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
              alt="Video thumbnail"
              className="w-full mt-2 rounded"
            />
          )}
          <div className="text-sm text-gray-400 mt-2">{video.teachingCue}</div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {video.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-slate-700">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Edit form component
  const EditForm = ({ video, onSave, onCancel }) => {
    const [formData, setFormData] = useState(video);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg w-full max-w-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-400">Edit Content</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle" className="text-slate-200">Title</Label>
              <Input 
                id="editTitle"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>

            <div>
              <Label htmlFor="editSkillLevel" className="text-slate-200">Skill Level</Label>
              <Select 
                value={formData.skillLevel}
                onValueChange={value => setFormData({...formData, skillLevel: value})}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="littleLeague">Little League</SelectItem>
                  <SelectItem value="highLevel">High Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editTeachingCue" className="text-slate-200">Teaching Cue</Label>
              <Textarea 
                id="editTeachingCue"
                value={formData.teachingCue}
                onChange={e => setFormData({...formData, teachingCue: e.target.value})}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onCancel} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-slate-600 hover:bg-slate-700">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Add content form component
  const AddContentForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
      title: '',
      url: '',
      category: '',
      skillLevel: '',
      teachingCue: '',
      tags: []
    });
    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.category || !formData.title || !formData.url) {
        console.log('Missing required fields');
        return;
      }
      onSubmit(formData);
    };

    const handleAddTag = () => {
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
        setNewTag('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg w-full max-w-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-400">Add New Content</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="url" className="text-slate-200">Video URL</Label>
              <Input 
                id="url"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
                placeholder="Paste Facebook or YouTube URL"
                required
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <Label htmlFor="title" className="text-slate-200">Title</Label>
              <Input 
                id="title"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Video title"
                required
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-slate-200">Category</Label>
              <Select 
                value={formData.category}
                onValueChange={value => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hitting">Hitting</SelectItem>
                  <SelectItem value="infield">Infield</SelectItem>
                  <SelectItem value="pitching">Pitching</SelectItem>
                  <SelectItem value="catching">Catching</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="skillLevel" className="text-slate-200">Skill Level</Label>
              <Select 
                value={formData.skillLevel}
                onValueChange={value => setFormData({...formData, skillLevel: value})}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="littleLeague">Little League</SelectItem>
                  <SelectItem value="highLevel">High Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="teachingCue" className="text-slate-200">Teaching Cue/Notes</Label>
              <Textarea 
                id="teachingCue"
                value={formData.teachingCue}
                onChange={e => setFormData({...formData, teachingCue: e.target.value})}
                placeholder="Key teaching points or notes"
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <Label className="text-slate-200">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <Badge 
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer bg-slate-700 hover:bg-slate-600"
                    onClick={() => setFormData({
                      ...formData,
                      tags: formData.tags.filter(t => t !== tag)
                    })}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                />
                <Button onClick={handleAddTag} className="bg-slate-600 hover:bg-slate-700">
                  Add Tag
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-slate-600 hover:bg-slate-700">
              Add Content
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Main component return
  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800">
        <h1 className="text-2xl font-bold text-slate-400">DrillHub</h1>
        <Button onClick={() => setShowAddForm(true)} className="bg-slate-600 hover:bg-slate-700 text-white">+ Add Content</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Mobile: Dropdown for category selection */}
        <div className="md:hidden p-4 border-b border-slate-700 bg-slate-800">
          <Select 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value)}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue>
                {activeTab === 'hitting' && 'Hitting'}
                {activeTab === 'infield' && 'Infield'}
                {activeTab === 'pitching' && 'Pitching'}
                {activeTab === 'catching' && 'Catching'}
                {activeTab === 'other' && 'Other'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-slate-100 max-h-[300px]">
              <SelectItem value="hitting">Hitting</SelectItem>
              <SelectItem value="infield">Infield</SelectItem>
              <SelectItem value="pitching">Pitching</SelectItem>
              <SelectItem value="catching">Catching</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Desktop: Horizontal Tabs */}
        <TabsList className="hidden md:flex w-full justify-start px-4 bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="hitting" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Hitting</TabsTrigger>
          <TabsTrigger value="infield" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Infield</TabsTrigger>
          <TabsTrigger value="pitching" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Pitching</TabsTrigger>
          <TabsTrigger value="catching" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Catching</TabsTrigger>
          <TabsTrigger value="other" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Other</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1 p-4">
          {Object.entries(videos).map(([category, categoryVideos]) => (
            <TabsContent key={category} value={category}>
              {categoryVideos.length > 0 ? (
                categoryVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No videos in this category yet. Add your first one!
                </div>
              )}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>

      {showAddForm && <AddContentForm onSubmit={addVideo} />}
      
      {selectedVideo?.isEditing ? (
        <EditForm 
          video={selectedVideo} 
          onSave={handleSaveEdit}
          onCancel={() => setSelectedVideo(null)} 
        />
      ) : selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-slate-400">{selectedVideo.title}</h2>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-slate-700 mb-4 flex flex-col items-center justify-center p-4 rounded">
                {getYouTubeVideoId(selectedVideo.url) ? (
                  <div className="w-full flex flex-col items-center">
                    <img 
                      src={`https://img.youtube.com/vi/${getYouTubeVideoId(selectedVideo.url)}/0.jpg`}
                      alt="Video thumbnail"
                      className="w-full mb-4 rounded"
                    />
                    <a 
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-slate-300">Preview not available</p>
                    <a 
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                    >
                      Open Video
                    </a>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-slate-300">Teaching Cue:</h3>
                <p className="text-slate-300">{selectedVideo.teachingCue}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  {selectedVideo.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="mr-2 bg-slate-700">{tag}</Badge>
                  ))}
                </div>
                <Button 
                  onClick={() => setSelectedVideo(null)}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingApp;
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { PracticePlan } from '@/types/practice';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';

// Mock data - replace with actual data from your backend
const mockPracticeItems = [
  {
    id: '1',
    title: 'Ground Ball Station',
    description: 'Basic ground ball fielding practice with multiple stations',
    type: 'station',
    duration: 15,
    category: 'infield',
    skillLevel: 'beginner' as const,
    equipment: ['Baseballs', 'Cones'],
    setup: 'Set up 4 stations with cones 20 feet apart',
    instructions: [
      'Players rotate through stations every 3 minutes',
      'Coach rolls ground balls to each station',
      'Focus on proper fielding position and glove work'
    ],
    tags: ['ground balls', 'fielding', 'fundamentals']
  },
  // Add more mock items as needed
];

export default function NewPracticePlanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<PracticePlan>>({
    items: [],
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(mockPracticeItems);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    router.push('/practice');
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddItem = (item: typeof mockPracticeItems[0]) => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        {
          itemId: item.id,
          duration: item.duration,
          order: formData.items?.length || 0
        }
      ]
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items?.filter(item => item.itemId !== itemId)
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formData.items || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const filteredItems = selectedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto bg-slate-900/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-emerald-400">Create New Practice Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-slate-200">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-200">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div>
              <Label className="text-slate-200">Practice Items</Label>
              <div className="space-y-4">
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-slate-300 font-medium">Available Items</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredItems.map((item) => (
                        <Card
                          key={item.id}
                          className="bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30 cursor-pointer"
                          onClick={() => handleAddItem(item)}
                        >
                          <CardContent className="p-4">
                            <h4 className="text-emerald-400 font-medium">{item.title}</h4>
                            <p className="text-slate-400 text-sm">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="bg-slate-700">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-slate-300 font-medium">Selected Items</h3>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="practice-items">
                        {(provided: DroppableProvided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 max-h-[400px] overflow-y-auto"
                          >
                            {formData.items?.map((item, index) => {
                              const practiceItem = mockPracticeItems.find(i => i.id === item.itemId);
                              if (!practiceItem) return null;

                              return (
                                <Draggable key={item.itemId} draggableId={item.itemId} index={index}>
                                  {(provided: DraggableProvided) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-slate-800/50 border-slate-700/50"
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h4 className="text-emerald-400 font-medium">{practiceItem.title}</h4>
                                            <p className="text-slate-400 text-sm">{practiceItem.description}</p>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveItem(item.itemId)}
                                            className="text-red-400 hover:text-red-300"
                                          >
                                            ×
                                          </Button>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                          {practiceItem.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="bg-slate-700">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-slate-200">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer bg-slate-700 hover:bg-slate-600"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/practice')}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Create Practice Plan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
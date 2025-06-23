'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { PracticeItem, PracticeItemType } from '@/types/practice';

export default function NewPracticeItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<PracticeItem>>({
    type: 'drill',
    equipment: [],
    instructions: [],
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

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

  const handleAddInstruction = () => {
    if (newInstruction && !formData.instructions?.includes(newInstruction)) {
      setFormData({
        ...formData,
        instructions: [...(formData.instructions || []), newInstruction]
      });
      setNewInstruction('');
    }
  };

  const handleRemoveInstruction = (instructionToRemove: string) => {
    setFormData({
      ...formData,
      instructions: formData.instructions?.filter(instruction => instruction !== instructionToRemove)
    });
  };

  const handleAddEquipment = () => {
    if (newEquipment && !formData.equipment?.includes(newEquipment)) {
      setFormData({
        ...formData,
        equipment: [...(formData.equipment || []), newEquipment]
      });
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (equipmentToRemove: string) => {
    setFormData({
      ...formData,
      equipment: formData.equipment?.filter(item => item !== equipmentToRemove)
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto bg-slate-900/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-emerald-400">Create New Practice Item</CardTitle>
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
              <Label htmlFor="type" className="text-slate-200">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: PracticeItemType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                  <SelectItem value="station">Station</SelectItem>
                  <SelectItem value="drill">Drill</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="warmup">Warm-up</SelectItem>
                  <SelectItem value="conditioning">Conditioning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="text-slate-200">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-slate-200">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] sm:max-h-[300px]">
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
                onValueChange={(value: 'beginner' | 'littleLeague' | 'highLevel') => setFormData({ ...formData, skillLevel: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="littleLeague">Little League</SelectItem>
                  <SelectItem value="highLevel">High Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="setup" className="text-slate-200">Setup Instructions</Label>
              <Textarea
                id="setup"
                value={formData.setup || ''}
                onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div>
              <Label className="text-slate-200">Equipment Needed</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.equipment?.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="cursor-pointer bg-slate-700 hover:bg-slate-600"
                    onClick={() => handleRemoveEquipment(item)}
                  >
                    {item} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add equipment"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                <Button
                  type="button"
                  onClick={handleAddEquipment}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Add
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-slate-200">Instructions</Label>
              <div className="space-y-2 mb-2">
                {formData.instructions?.map((instruction, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-slate-300">{index + 1}.</span>
                    <span className="text-slate-300">{instruction}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInstruction(instruction)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add instruction"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                <Button
                  type="button"
                  onClick={handleAddInstruction}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Add
                </Button>
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
                Create Practice Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
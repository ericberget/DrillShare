'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageSelected: (file: File) => void;
  onImageRemove?: () => void;
  uploading?: boolean;
  progress?: number;
}

export function ImageUpload({
  currentImageUrl,
  onImageSelected,
  onImageRemove,
  uploading = false,
  progress = 0
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    onImageSelected(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onImageRemove) onImageRemove();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24">
        {!preview ? (
          <div className="absolute inset-0 rounded-full bg-slate-800 flex items-center justify-center">
            <Camera className="h-12 w-12 text-slate-400" />
          </div>
        ) : (
          <>
            <img
              src={preview}
              alt="Profile preview"
              className="absolute inset-0 w-full h-full rounded-full object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {uploading && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center mt-1">Uploading: {Math.round(progress)}%</p>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              {preview ? 'Change Picture' : 'Upload Picture'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { AnnotationTool, AnnotationPoint, VideoAnnotation } from '@/types/content';
import { Timestamp } from 'firebase/firestore';

interface VideoAnnotationCanvasProps {
  videoElement: HTMLVideoElement | null;
  isAnnotationMode: boolean;
  onAnnotationSave: (annotation: VideoAnnotation) => void;
  existingAnnotations: VideoAnnotation[];
  currentTime: number;
  onAnnotationDelete?: (annotationId: string) => void;
  showAnnotations: boolean;
}

export const VideoAnnotationCanvas: React.FC<VideoAnnotationCanvasProps> = ({
  videoElement,
  isAnnotationMode,
  onAnnotationSave,
  existingAnnotations,
  currentTime,
  onAnnotationDelete,
  showAnnotations
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [currentPoints, setCurrentPoints] = useState<AnnotationPoint[]>([]);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [localAnnotations, setLocalAnnotations] = useState<VideoAnnotation[]>([]);

  // Initialize canvas when video is available
  useEffect(() => {
    if (!canvasRef.current || !videoElement) return;

    const canvas = canvasRef.current;
    const video = videoElement;
    
    const updateCanvasSize = () => {
      const videoRect = video.getBoundingClientRect();
      if (videoRect.width > 0 && videoRect.height > 0) {
        canvas.width = videoRect.width;
        canvas.height = videoRect.height;
        drawAllAnnotations();
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(video);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [videoElement]);

  // Get mouse/pen position relative to canvas
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>): AnnotationPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  // Handle pointer down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAnnotationMode || !canvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = getPointerPos(e);
    setIsDrawing(true);
    setCurrentPoints([point]);
  };

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isAnnotationMode || !canvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = getPointerPos(e);
    const newPoints = [...currentPoints, point];
    setCurrentPoints(newPoints);
    
    // Draw line segment
    const ctx = canvasRef.current.getContext('2d');
    if (ctx && currentPoints.length > 0) {
      const lastPoint = currentPoints[currentPoints.length - 1];
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  // Handle pointer up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isAnnotationMode) return;
    
    const finalPoint = getPointerPos(e);
    const finalPoints = [...currentPoints, finalPoint];
    
    // Create and save the annotation immediately
    const annotation: VideoAnnotation = {
      id: `annotation_${Date.now()}`,
      timestamp: currentTime,
      tool: 'freehand',
      points: finalPoints,
      color: currentColor,
      strokeWidth: strokeWidth,
      createdAt: Timestamp.now()
    };

    setLocalAnnotations(prev => [...prev, annotation]);
    onAnnotationSave(annotation);
    
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  // Draw all annotations
  const drawAllAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all annotations
    [...existingAnnotations, ...localAnnotations].forEach(annotation => {
      if (annotation.tool === 'freehand' && annotation.points.length > 1) {
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
        for (let i = 1; i < annotation.points.length; i++) {
          ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
        }
        ctx.stroke();
      }
    });
  }, [existingAnnotations, localAnnotations]);

  // Redraw when annotations change
  useEffect(() => {
    drawAllAnnotations();
  }, [drawAllAnnotations]);

  // Clear all annotations
  const handleClear = () => {
    if (!window.confirm('Clear all drawings?')) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setLocalAnnotations([]);
    existingAnnotations.forEach(annotation => {
      if (onAnnotationDelete) {
        onAnnotationDelete(annotation.id);
      }
    });
  };

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${isAnnotationMode ? 'cursor-crosshair' : ''}`}
        onPointerDown={isAnnotationMode ? handlePointerDown : undefined}
        onPointerMove={isAnnotationMode ? handlePointerMove : undefined}
        onPointerUp={isAnnotationMode ? handlePointerUp : undefined}
        onPointerLeave={isAnnotationMode ? handlePointerUp : undefined}
        onContextMenu={(e) => e.preventDefault()}
        style={{ 
          pointerEvents: isAnnotationMode ? 'auto' : 'none',
          backgroundColor: 'transparent',
          zIndex: isAnnotationMode ? 50 : 10,
          maskImage: isAnnotationMode ? 'linear-gradient(to bottom, white 90%, transparent 100%)' : undefined,
          WebkitMaskImage: isAnnotationMode ? 'linear-gradient(to bottom, white 90%, transparent 100%)' : undefined
        }}
      />
      
      {/* Simplified toolbar - only show in annotation mode */}
      {isAnnotationMode && (
        <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm rounded-lg p-3 flex flex-col gap-2 shadow-lg border border-slate-700" style={{ zIndex: 1001, pointerEvents: 'auto' }}>
          {/* Color selection */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium">Colors</div>
            <div className="flex gap-1">
              {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ffffff'].map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    currentColor === color ? 'border-slate-300 scale-110' : 'border-slate-600 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                  title={`Select ${color === '#ff0000' ? 'red' : color === '#00ff00' ? 'green' : color === '#0000ff' ? 'blue' : color === '#ffff00' ? 'yellow' : 'white'} color`}
                />
              ))}
            </div>
          </div>
          
          {/* Stroke width */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Size:</span>
            <input
              type="range"
              min="1"
              max="8"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-16"
            />
          </div>
          
          {/* Clear button */}
          <Button
            variant="outline"
            size="sm"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            onClick={handleClear}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}; 
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
}

export const VideoAnnotationCanvas: React.FC<VideoAnnotationCanvasProps> = ({
  videoElement,
  isAnnotationMode,
  onAnnotationSave,
  existingAnnotations,
  currentTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>('line');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [startPoint, setStartPoint] = useState<AnnotationPoint | null>(null);
  const [currentPoints, setCurrentPoints] = useState<AnnotationPoint[]>([]);

  // Initialize canvas when annotation mode is enabled
  useEffect(() => {
    if (!isAnnotationMode || !canvasRef.current || !videoElement) return;

    const canvas = canvasRef.current;
    const video = videoElement;
    
    // Wait for video to be loaded and get its display size
    const updateCanvasSize = () => {
      const videoRect = video.getBoundingClientRect();
      console.log('Video rect:', videoRect);
      
      if (videoRect.width > 0 && videoRect.height > 0) {
        canvas.width = videoRect.width;
        canvas.height = videoRect.height;
        
        console.log('Canvas sized to:', canvas.width, 'x', canvas.height);
        
        // Draw test elements to verify canvas is working
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          console.log('Canvas initialized successfully');
        }
      }
    };

    // Update canvas size immediately and on video resize
    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(video);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [isAnnotationMode, videoElement]);

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): AnnotationPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('Mouse position:', { x, y }, 'Canvas rect:', rect);
    return { x, y };
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse down event triggered');
    
    if (!isAnnotationMode || !canvasRef.current) {
      console.log('Ignoring mouse down - annotation mode:', isAnnotationMode);
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoints([point]);
    
    console.log('Starting drawing at:', point);
    
    // Draw immediate feedback
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.fillStyle = currentColor;
      ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
      console.log('Drew feedback dot');
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isAnnotationMode || !canvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // For freehand, just add points and draw continuously
    if (currentTool === 'freehand') {
      const newPoints = [...currentPoints, point];
      setCurrentPoints(newPoints);
      
      // Draw line segment
      if (currentPoints.length > 0) {
        const lastPoint = currentPoints[currentPoints.length - 1];
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse up event');
    
    if (!isDrawing || !isAnnotationMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = getMousePos(e);
    setIsDrawing(false);

    let finalPoints: AnnotationPoint[] = [];
    
    if (currentTool === 'freehand') {
      finalPoints = [...currentPoints, point];
    } else if (startPoint) {
      finalPoints = [startPoint, point];
      
      // Draw the final shape
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        
        switch (currentTool) {
          case 'line':
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(point.x, point.y);
            break;
          case 'circle':
            const radius = Math.sqrt(
              Math.pow(point.x - startPoint.x, 2) + 
              Math.pow(point.y - startPoint.y, 2)
            );
            ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
            break;
          case 'arrow':
            // Draw line
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(point.x, point.y);
            // Draw arrowhead
            const angle = Math.atan2(point.y - startPoint.y, point.x - startPoint.x);
            const headLength = 15;
            ctx.lineTo(
              point.x - headLength * Math.cos(angle - Math.PI / 6),
              point.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(
              point.x - headLength * Math.cos(angle + Math.PI / 6),
              point.y - headLength * Math.sin(angle + Math.PI / 6)
            );
            break;
        }
        
        ctx.stroke();
      }
    }

    console.log('Final points for annotation:', finalPoints);

    // Create annotation if we have valid points
    if (finalPoints.length > 0) {
      const annotation: VideoAnnotation = {
        id: `annotation_${Date.now()}`,
        timestamp: currentTime,
        tool: currentTool,
        points: finalPoints,
        color: currentColor,
        strokeWidth: strokeWidth,
        createdAt: Timestamp.now()
      };

      console.log('Saving annotation:', annotation);
      onAnnotationSave(annotation);
    }

    setStartPoint(null);
    setCurrentPoints([]);
  };

  // Draw existing annotations for current timestamp
  const drawExistingAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Find annotations within 0.5 seconds of current time
    const relevantAnnotations = existingAnnotations.filter(
      annotation => Math.abs(annotation.timestamp - currentTime) <= 0.5
    );
    
    // Draw each annotation
    relevantAnnotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.lineWidth = annotation.strokeWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      
      switch (annotation.tool) {
        case 'line':
          if (annotation.points.length >= 2) {
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            ctx.lineTo(annotation.points[1].x, annotation.points[1].y);
          }
          break;
        case 'circle':
          if (annotation.points.length >= 2) {
            const radius = Math.sqrt(
              Math.pow(annotation.points[1].x - annotation.points[0].x, 2) + 
              Math.pow(annotation.points[1].y - annotation.points[0].y, 2)
            );
            ctx.arc(annotation.points[0].x, annotation.points[0].y, radius, 0, 2 * Math.PI);
          }
          break;
        case 'arrow':
          if (annotation.points.length >= 2) {
            const start = annotation.points[0];
            const end = annotation.points[1];
            // Draw line
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            // Draw arrowhead
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const headLength = 15;
            ctx.lineTo(
              end.x - headLength * Math.cos(angle - Math.PI / 6),
              end.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle + Math.PI / 6),
              end.y - headLength * Math.sin(angle + Math.PI / 6)
            );
          }
          break;
        case 'freehand':
          if (annotation.points.length > 1) {
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            for (let i = 1; i < annotation.points.length; i++) {
              ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
            }
          }
          break;
      }
      
      ctx.stroke();
    });
  }, [existingAnnotations, currentTime]);

  // Redraw annotations when time changes
  useEffect(() => {
    if (isAnnotationMode) {
      drawExistingAnnotations();
    }
  }, [isAnnotationMode, drawExistingAnnotations]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isAnnotationMode) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'l':
          setCurrentTool('line');
          break;
        case 'c':
          setCurrentTool('circle');
          break;
        case 'a':
          setCurrentTool('arrow');
          break;
        case 'f':
          setCurrentTool('freehand');
          break;
        case 'escape':
          // You could add an onExit prop to handle this
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnnotationMode]);

  if (!isAnnotationMode) return null;

  return (
    <div className="absolute inset-0 z-50">
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          console.log('Canvas clicked!', getMousePos(e));
        }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ 
          pointerEvents: 'auto',
          backgroundColor: 'transparent' // Remove red overlay for production
        }}
      />
      
      {/* Annotation toolbar */}
      <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm rounded-lg p-3 flex flex-col gap-2 shadow-lg border border-slate-700" style={{ zIndex: 1001 }}>
        {/* Tool selection */}
        <div className="space-y-1">
          <div className="text-xs text-slate-400 font-medium">Tools</div>
          <div className="flex gap-1">
            {(['line', 'circle', 'arrow', 'freehand'] as AnnotationTool[]).map(tool => (
              <Button
                key={tool}
                variant={currentTool === tool ? 'default' : 'outline'}
                size="sm"
                className={`w-8 h-8 p-0 ${
                  currentTool === tool 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setCurrentTool(tool)}
                title={`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool (${tool === 'line' ? 'L' : tool === 'circle' ? 'C' : tool === 'arrow' ? 'A' : 'F'})`}
              >
                {tool === 'line' && '—'}
                {tool === 'circle' && '○'}
                {tool === 'arrow' && '→'}
                {tool === 'freehand' && '✏'}
              </Button>
            ))}
          </div>
        </div>
        
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
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawExistingAnnotations(); // Redraw existing annotations
              }
            }
          }}
        >
          Clear
        </Button>
        
        {/* Annotation count */}
        <div className="text-xs text-slate-400 text-center">
          {existingAnnotations.filter(a => Math.abs(a.timestamp - currentTime) <= 0.5).length} annotations
        </div>
      </div>
    </div>
  );
}; 
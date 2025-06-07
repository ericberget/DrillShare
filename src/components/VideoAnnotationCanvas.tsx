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
  const [currentTool, setCurrentTool] = useState<AnnotationTool>('line');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [startPoint, setStartPoint] = useState<AnnotationPoint | null>(null);
  const [currentPoints, setCurrentPoints] = useState<AnnotationPoint[]>([]);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [pendingAnnotation, setPendingAnnotation] = useState<VideoAnnotation | null>(null);

  // Initialize canvas when video is available (not just in annotation mode)
  useEffect(() => {
    if (!canvasRef.current || !videoElement) return;

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
        
        // Draw existing annotations immediately
        drawExistingAnnotations();
      }
    };

    // Update canvas size immediately and on video resize
    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(video);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [videoElement]); // Remove isAnnotationMode dependency

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
    if (!isDrawing || !isAnnotationMode) return;
    
    setIsDrawing(false);
    
    const currentPoint = getMousePos(e);
    let finalPoints: AnnotationPoint[] = [];
    
    // Finalize points based on tool type
    switch (currentTool) {
      case 'line':
      case 'circle':
      case 'arrow':
        if (startPoint) {
          finalPoints = [startPoint, currentPoint];
        }
        break;
      case 'freehand':
        finalPoints = [...currentPoints, currentPoint];
        break;
    }

    console.log('Final points for annotation:', finalPoints);

    // Create pending annotation instead of auto-saving
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

      console.log('Creating pending annotation:', annotation);
      setPendingAnnotation(annotation);
    }

    setStartPoint(null);
    setCurrentPoints([]);
  };

  // Save the pending annotation
  const handleSaveAnnotation = () => {
    if (pendingAnnotation) {
      onAnnotationSave(pendingAnnotation);
      setPendingAnnotation(null);
    }
  };

  // Cancel the pending annotation
  const handleCancelAnnotation = () => {
    setPendingAnnotation(null);
    // Redraw existing annotations only
    drawExistingAnnotations();
  };

  // Check if a point is near an annotation (for hover/click detection)
  const getAnnotationAtPoint = useCallback((point: AnnotationPoint): VideoAnnotation | null => {
    const relevantAnnotations = existingAnnotations.filter(
      annotation => Math.abs(annotation.timestamp - currentTime) <= 0.5
    );

    // Check each annotation to see if the point is near it
    for (const annotation of relevantAnnotations) {
      const tolerance = 10; // pixels

      switch (annotation.tool) {
        case 'line':
          if (annotation.points.length >= 2) {
            // Check if point is near the line
            const start = annotation.points[0];
            const end = annotation.points[1];
            const distance = distanceFromPointToLine(point, start, end);
            if (distance <= tolerance) return annotation;
          }
          break;
        case 'circle':
          if (annotation.points.length >= 2) {
            const center = annotation.points[0];
            const radius = Math.sqrt(
              Math.pow(annotation.points[1].x - center.x, 2) + 
              Math.pow(annotation.points[1].y - center.y, 2)
            );
            const distanceFromCenter = Math.sqrt(
              Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
            );
            // Check if point is near the circle edge
            if (Math.abs(distanceFromCenter - radius) <= tolerance) return annotation;
          }
          break;
        case 'arrow':
          if (annotation.points.length >= 2) {
            // Check if point is near the arrow line
            const start = annotation.points[0];
            const end = annotation.points[1];
            const distance = distanceFromPointToLine(point, start, end);
            if (distance <= tolerance) return annotation;
          }
          break;
        case 'freehand':
          // Check if point is near any part of the freehand drawing
          for (let i = 0; i < annotation.points.length - 1; i++) {
            const distance = distanceFromPointToLine(point, annotation.points[i], annotation.points[i + 1]);
            if (distance <= tolerance) return annotation;
          }
          break;
      }
    }
    return null;
  }, [existingAnnotations, currentTime]);

  // Helper function to calculate distance from point to line
  const distanceFromPointToLine = (point: AnnotationPoint, lineStart: AnnotationPoint, lineEnd: AnnotationPoint): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    
    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle mouse move for hover detection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnnotationMode) {
      handleMouseMove(e);
      return;
    }

    // Check for annotation hover when not in annotation mode
    const mousePos = getMousePos(e);
    const annotation = getAnnotationAtPoint(mousePos);
    setHoveredAnnotation(annotation?.id || null);
    
    // Change cursor based on hover
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = annotation ? 'pointer' : 'default';
    }
  };

  // Handle click for annotation deletion
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnnotationMode) return;

    const mousePos = getMousePos(e);
    const annotation = getAnnotationAtPoint(mousePos);
    
    if (annotation && onAnnotationDelete) {
      // Show confirmation before deleting
      if (window.confirm(`Delete this ${annotation.tool} annotation at ${Math.floor(annotation.timestamp / 60)}:${(annotation.timestamp % 60).toFixed(1).padStart(4, '0')}s?`)) {
        onAnnotationDelete(annotation.id);
      }
    }
  };

  // Draw existing annotations for current timestamp
  const drawExistingAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only draw if annotations should be shown
    if (!showAnnotations && !isAnnotationMode) return;
    
    // Find annotations within 0.5 seconds of current time
    let relevantAnnotations = existingAnnotations.filter(
      annotation => Math.abs(annotation.timestamp - currentTime) <= 0.5
    );

    // Add pending annotation if it exists
    if (pendingAnnotation && isAnnotationMode) {
      relevantAnnotations = [...relevantAnnotations, pendingAnnotation];
    }
    
    // Draw each annotation
    relevantAnnotations.forEach(annotation => {
      // Apply hover effect
      const isHovered = hoveredAnnotation === annotation.id;
      const isPending = annotation.id === pendingAnnotation?.id;
      
      ctx.strokeStyle = isPending ? '#fbbf24' : (isHovered ? '#ffffff' : annotation.color); // Yellow for pending
      ctx.lineWidth = isHovered ? annotation.strokeWidth + 1 : annotation.strokeWidth;
      ctx.lineCap = 'round';
      
      // Add glow effect for hovered annotation or pending annotation
      if (isHovered || isPending) {
        ctx.shadowColor = isPending ? '#fbbf24' : annotation.color;
        ctx.shadowBlur = isPending ? 8 : 5;
      } else {
        ctx.shadowBlur = 0;
      }
      
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
      ctx.shadowBlur = 0; // Reset shadow
    });
  }, [existingAnnotations, currentTime, hoveredAnnotation, pendingAnnotation, showAnnotations, isAnnotationMode]);

  // Redraw annotations when time changes or annotations change
  useEffect(() => {
    drawExistingAnnotations();
  }, [drawExistingAnnotations]);

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

  // Always render the canvas (not just in annotation mode)
  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${isAnnotationMode ? 'cursor-crosshair' : ''}`}
        onMouseDown={isAnnotationMode ? handleMouseDown : undefined}
        onMouseMove={isAnnotationMode ? handleMouseMove : handleCanvasMouseMove}
        onMouseUp={isAnnotationMode ? handleMouseUp : undefined}
        onClick={isAnnotationMode ? undefined : handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        style={{ 
          pointerEvents: isAnnotationMode ? 'auto' : (showAnnotations && existingAnnotations.filter(a => Math.abs(a.timestamp - currentTime) <= 0.5).length > 0 ? 'auto' : 'none'),
          backgroundColor: 'transparent',
          zIndex: isAnnotationMode ? 50 : 10 // Lower z-index when not in annotation mode
        }}
      />
      
      {/* Annotation toolbar - only show in annotation mode */}
      {isAnnotationMode && (
        <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm rounded-lg p-3 flex flex-col gap-2 shadow-lg border border-slate-700" style={{ zIndex: 1001, pointerEvents: 'auto' }}>
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
      )}

      {/* Save/Cancel buttons for pending annotation */}
      {pendingAnnotation && isAnnotationMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-amber-600/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-amber-500" style={{ zIndex: 1001, pointerEvents: 'auto' }}>
          <div className="flex items-center gap-3">
            <div className="text-sm text-amber-100 font-medium">
              Save this {pendingAnnotation.tool} annotation?
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleSaveAnnotation}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-100 hover:bg-amber-600"
                onClick={handleCancelAnnotation}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Show deletion hint when hovering over annotation and not in annotation mode */}
      {!isAnnotationMode && hoveredAnnotation && showAnnotations && (
        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-slate-700" style={{ zIndex: 1001, pointerEvents: 'auto' }}>
          <div className="text-xs text-slate-300">
            Click to delete annotation
          </div>
        </div>
      )}
    </div>
  );
}; 
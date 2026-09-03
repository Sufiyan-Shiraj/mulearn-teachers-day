'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TEMPLATE_REGISTRY } from '@/templates/registry';
import { TemplateDefinition } from '@/templates/types';
import { QuadPoints, Point2D, getPolygonClipPath, getQuadBoundsAndRotation } from '@/lib/perspectiveWarp';
import {
  Move,
  Layers,
  Eraser,
  Type,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Upload,
  ZoomIn,
  Sliders,
  Image as ImageIcon,
  ArrowRight,
  AlertCircle,
  Undo2,
  Redo2,
  Brush,
  Wand2,
  MousePointerClick,
  Heart,
  Star,
  Sparkle,
} from 'lucide-react';

const TEST_PHOTOS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
];

interface SmartItemPreset {
  id: string;
  name: string;
  templateId: string;
  icon: string;
  region: { x: number; y: number; width: number; height: number }; // percentage bbox
}

const SMART_PRESETS: SmartItemPreset[] = [
  // Template 1 items
  {
    id: 't1-heart',
    name: '3D Glossy Red Heart',
    templateId: 'template-maroon-party',
    icon: 'heart',
    region: { x: 2, y: 52, width: 22, height: 18 },
  },
  {
    id: 't1-star',
    name: '3D Silver Star Balloon',
    templateId: 'template-maroon-party',
    icon: 'star',
    region: { x: 78, y: 38, width: 22, height: 16 },
  },
  {
    id: 't1-cocktail',
    name: 'Cocktail Orange Slice',
    templateId: 'template-maroon-party',
    icon: 'sparkle',
    region: { x: 76, y: 76, width: 24, height: 20 },
  },
  // Template 2 items
  {
    id: 't2-numerals',
    name: '"2*26" Retro Numerals',
    templateId: 'template-blue-2026',
    icon: 'sparkle',
    region: { x: 25, y: 68, width: 34, height: 18 },
  },
  {
    id: 't2-washi',
    name: 'Polka Washi Tape',
    templateId: 'template-blue-2026',
    icon: 'sparkle',
    region: { x: 70, y: 64, width: 26, height: 16 },
  },
  {
    id: 't2-star',
    name: 'Gold Star & Doodles',
    templateId: 'template-blue-2026',
    icon: 'star',
    region: { x: 4, y: 50, width: 18, height: 16 },
  },
];

export default function AdminTemplateMapperPage() {
  const [templates, setTemplates] = useState<TemplateDefinition[]>(TEMPLATE_REGISTRY);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(TEMPLATE_REGISTRY[0]);
  const [activeTool, setActiveTool] = useState<'quad' | 'mask' | 'wand' | 'text' | 'preview'>('quad');
  const [testPhotoUrl, setTestPhotoUrl] = useState<string>(TEST_PHOTOS[0]);
  const [showNodes, setShowNodes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Fetch freshest templates from API on load
  useEffect(() => {
    fetch('/api/admin/save-template-mapping')
      .then((res) => res.json())
      .then((data) => {
        if (data.templates && data.templates.length) {
          setTemplates(data.templates);
          const current = data.templates.find((t: TemplateDefinition) => t.id === selectedTemplate.id);
          if (current) {
            setSelectedTemplate(current);
          }
        }
      })
      .catch(() => {});
  }, []);

  // 4 Quad Points state (percentage 0-100 relative to template canvas)
  const [quad, setQuad] = useState<QuadPoints>(
    selectedTemplate.photoWindow.quadPoints || {
      topLeft: { x: selectedTemplate.photoWindow.left, y: selectedTemplate.photoWindow.top },
      topRight: { x: selectedTemplate.photoWindow.left + selectedTemplate.photoWindow.width, y: selectedTemplate.photoWindow.top },
      bottomRight: {
        x: selectedTemplate.photoWindow.left + selectedTemplate.photoWindow.width,
        y: selectedTemplate.photoWindow.top + selectedTemplate.photoWindow.height,
      },
      bottomLeft: {
        x: selectedTemplate.photoWindow.left,
        y: selectedTemplate.photoWindow.top + selectedTemplate.photoWindow.height,
      },
    }
  );

  // Text placement state
  const [textPlacement, setTextPlacement] = useState(selectedTemplate.teacherNamePlacement);

  // Mask Painting & Wand State
  const [brushSize, setBrushSize] = useState(30);
  const [wandTolerance, setWandTolerance] = useState(40);
  const [isErasing, setIsErasing] = useState(false);
  const [maskDataUrl, setMaskDataUrl] = useState<string | undefined>(selectedTemplate.foregroundMaskUrl);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);

  const [draggingNode, setDraggingNode] = useState<keyof QuadPoints | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingMask, setIsDrawingMask] = useState(false);

  // Undo / Redo History stack for mask canvas
  const [maskHistory, setMaskHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Preload Template Image for cutout extraction
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTemplate.baseImageUrl || selectedTemplate.previewImageUrl;
    img.onload = () => {
      templateImgRef.current = img;
    };
    if (img.complete && img.naturalWidth > 0) {
      templateImgRef.current = img;
    }
  }, [selectedTemplate]);

  // Load / Reload canvas state when template switches
  useEffect(() => {
    setQuad(
      selectedTemplate.photoWindow.quadPoints || {
        topLeft: { x: selectedTemplate.photoWindow.left, y: selectedTemplate.photoWindow.top },
        topRight: { x: selectedTemplate.photoWindow.left + selectedTemplate.photoWindow.width, y: selectedTemplate.photoWindow.top },
        bottomRight: {
          x: selectedTemplate.photoWindow.left + selectedTemplate.photoWindow.width,
          y: selectedTemplate.photoWindow.top + selectedTemplate.photoWindow.height,
        },
        bottomLeft: {
          x: selectedTemplate.photoWindow.left,
          y: selectedTemplate.photoWindow.top + selectedTemplate.photoWindow.height,
        },
      }
    );
    setTextPlacement(selectedTemplate.teacherNamePlacement);
    setMaskDataUrl(selectedTemplate.foregroundMaskUrl);

    // Reset history and load existing mask
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (selectedTemplate.foregroundMaskUrl) {
          const maskImg = new Image();
          maskImg.src = selectedTemplate.foregroundMaskUrl;
          maskImg.onload = () => {
            ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
            const initialData = canvas.toDataURL('image/png');
            setMaskHistory([initialData]);
            setHistoryIndex(0);
          };
        } else {
          setMaskHistory([canvas.toDataURL('image/png')]);
          setHistoryIndex(0);
        }
      }
    }
  }, [selectedTemplate]);

  // Handle Dragging Quad Corner Nodes
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingNode || !containerRef.current || activeTool !== 'quad') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setQuad((prev) => ({
      ...prev,
      [draggingNode]: { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 },
    }));
  };

  const handleContainerMouseUp = () => {
    setDraggingNode(null);
  };

  // Helper to convert mouse event to canvas pixel coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Push new state to undo/redo history
  const pushHistoryState = (dataUrl: string) => {
    setMaskDataUrl(dataUrl);
    const nextHistory = maskHistory.slice(0, historyIndex + 1);
    nextHistory.push(dataUrl);
    setMaskHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  // 1-Click Smart Item Region Stamp
  const stampSmartItem = (preset: SmartItemPreset) => {
    const canvas = canvasRef.current;
    const templateImg = templateImgRef.current;
    if (!canvas || !templateImg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = (preset.region.x / 100) * canvas.width;
    const y = (preset.region.y / 100) * canvas.height;
    const w = (preset.region.width / 100) * canvas.width;
    const h = (preset.region.height / 100) * canvas.height;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    pushHistoryState(dataUrl);
  };

  // Smart Magic Wand Click Extractor
  const handleWandClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const templateImg = templateImgRef.current;
    if (!coords || !canvas || !templateImg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create an offscreen canvas to sample original template pixels
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    const imgData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const startX = Math.floor(coords.x);
    const startY = Math.floor(coords.y);
    const startIdx = (startY * canvas.width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];

    // Flood fill / region segment within bounding radius around click
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.35; // 35% bounding scope
    const visited = new Uint8Array(canvas.width * canvas.height);
    const queue: [number, number][] = [[startX, startY]];
    visited[startY * canvas.width + startX] = 1;

    const resultImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const resData = resultImgData.data;

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const idx = (cy * canvas.width + cx) * 4;

      // Copy pixel from template to mask
      resData[idx] = data[idx];
      resData[idx + 1] = data[idx + 1];
      resData[idx + 2] = data[idx + 2];
      resData[idx + 3] = data[idx + 3];

      // Check 4 neighbors
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
          const nIdx = ny * canvas.width + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            const dist = Math.hypot(nx - startX, ny - startY);
            if (dist <= maxRadius) {
              const pIdx = nIdx * 4;
              const r = data[pIdx];
              const g = data[pIdx + 1];
              const b = data[pIdx + 2];
              const colorDist = Math.sqrt(
                Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2)
              );

              if (colorDist <= wandTolerance) {
                queue.push([nx, ny]);
              }
            }
          }
        }
      }
    }

    ctx.putImageData(resultImgData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    pushHistoryState(dataUrl);
  };

  // Draw Stroke (Cutout template pixels or erase)
  const drawStroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(to.x, to.y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cutout Brush Mode: Create clipping region from brush path, then render clean template pixels
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(from.x, from.y, brushSize, 0, Math.PI * 2);
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.arc(to.x, to.y, brushSize, 0, Math.PI * 2);
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Clip and paint the real template image pixels without any black stroke lines
      ctx.clip();
      const templateImg = templateImgRef.current;
      if (templateImg && templateImg.complete && templateImg.naturalWidth > 0) {
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
      }
    }
    ctx.restore();
  };

  const handleMaskMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'wand') {
      handleWandClick(e);
      return;
    }
    if (activeTool !== 'mask') return;
    e.stopPropagation();
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setIsDrawingMask(true);
    setLastPoint(coords);
    drawStroke(coords, coords);
  };

  const handleMaskMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMask || activeTool !== 'mask' || !lastPoint) return;
    e.stopPropagation();
    const coords = getCanvasCoords(e);
    if (!coords) return;
    drawStroke(lastPoint, coords);
    setLastPoint(coords);
  };

  const handleMaskMouseUp = () => {
    if (!isDrawingMask) return;
    setIsDrawingMask(false);
    setLastPoint(null);

    // Save snapshot to history
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      pushHistoryState(dataUrl);
    }
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex <= 0 || !canvasRef.current) return;
    const nextIndex = historyIndex - 1;
    const targetData = maskHistory[nextIndex];
    setHistoryIndex(nextIndex);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (targetData) {
      const img = new Image();
      img.src = targetData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setMaskDataUrl(targetData);
      };
    } else {
      setMaskDataUrl(undefined);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex >= maskHistory.length - 1 || !canvasRef.current) return;
    const nextIndex = historyIndex + 1;
    const targetData = maskHistory[nextIndex];
    setHistoryIndex(nextIndex);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (targetData) {
      const img = new Image();
      img.src = targetData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setMaskDataUrl(targetData);
      };
    }
  };

  // Clear Mask
  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const emptyData = canvas.toDataURL('image/png');
    pushHistoryState(emptyData);
  };

  // Calculate bounding box and clip path from quad
  const minX = Math.min(quad.topLeft.x, quad.bottomLeft.x);
  const maxX = Math.max(quad.topRight.x, quad.bottomRight.x);
  const minY = Math.min(quad.topLeft.y, quad.topRight.y);
  const maxY = Math.max(quad.bottomLeft.y, quad.bottomRight.y);
  const bboxWidth = Math.max(1, maxX - minX);
  const bboxHeight = Math.max(1, maxY - minY);

  // Save Mapping Permanently via API Route
  const handleSavePermanently = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);

    const quadMetrics = getQuadBoundsAndRotation(quad);

    const updatedTemplate: TemplateDefinition = {
      ...selectedTemplate,
      photoWindow: {
        ...selectedTemplate.photoWindow,
        left: quadMetrics.minX,
        top: quadMetrics.minY,
        width: quadMetrics.bboxW,
        height: quadMetrics.bboxH,
        rotation: quadMetrics.rotation,
        quadPoints: quad,
      },
      teacherNamePlacement: textPlacement,
      foregroundMaskUrl: maskDataUrl,
    };

    try {
      const res = await fetch('/api/admin/save-template-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTemplate),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.templates) {
          setTemplates(data.templates);
        }
        setSaveSuccessMsg(`Template "${selectedTemplate.name}" mapping saved permanently!`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        alert(`Error saving mapping: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Save request failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const currentPresets = SMART_PRESETS.filter((p) => p.templateId === selectedTemplate.id);

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#7A1F1F] text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Admin Tool
              </span>
              <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-stone-900">
                Template Perspective & Mapping Studio
              </h1>
            </div>
            <p className="font-script-accent text-stone-600 text-lg mt-0.5">
              Drag 4 corners to warp photo, paint foreground cutouts, and position perspective text permanently.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePermanently}
              disabled={isSaving}
              className="px-6 py-3 bg-[#7A1F1F] hover:bg-[#5C1515] text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? 'Saving...' : 'Save Mapping Permanently'}</span>
            </button>
          </div>
        </div>

        {/* Save Success Alert */}
        {saveSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-900 font-semibold text-sm shadow-md animate-fade-in">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT CONTROLS TOOLBAR */}
          <div className="lg:col-span-4 bg-[#FFFDF9] rounded-3xl p-6 border border-stone-200 shadow-xl space-y-6">
            {/* 1. Template Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                1. Select Template to Map
              </label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-2.5 rounded-2xl border text-left transition ${
                      selectedTemplate.id === tpl.id
                        ? 'bg-amber-100/60 border-[#7A1F1F] ring-2 ring-[#7A1F1F]'
                        : 'bg-stone-50 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <img
                      src={tpl.previewImageUrl}
                      alt={tpl.name}
                      className="w-full aspect-[4/5] object-cover rounded-xl mb-1.5"
                    />
                    <p className="font-bold text-xs text-stone-900 truncate">{tpl.name}</p>
                    <p className="text-[10px] text-stone-500">{tpl.aspectRatio}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tool Mode Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                2. Select Mapping Mode
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-2xl">
                <button
                  onClick={() => setActiveTool('quad')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    activeTool === 'quad' ? 'bg-white text-[#7A1F1F] shadow-sm' : 'text-stone-600'
                  }`}
                >
                  <Move className="w-4 h-4" />
                  <span>4 Nodes</span>
                </button>

                <button
                  onClick={() => setActiveTool('wand')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    activeTool === 'wand' ? 'bg-white text-[#7A1F1F] shadow-sm' : 'text-stone-600'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Smart Wand</span>
                </button>

                <button
                  onClick={() => setActiveTool('mask')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    activeTool === 'mask' ? 'bg-white text-[#7A1F1F] shadow-sm' : 'text-stone-600'
                  }`}
                >
                  <Brush className="w-4 h-4" />
                  <span>Brush/Erase</span>
                </button>

                <button
                  onClick={() => setActiveTool('text')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    activeTool === 'text' ? 'bg-white text-[#7A1F1F] shadow-sm' : 'text-stone-600'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Text Angle</span>
                </button>
              </div>
            </div>

            {/* TOOL 0: SMART ITEM SELECTOR & 1-CLICK PRESETS */}
            {activeTool === 'wand' && (
              <div className="space-y-4 animate-fade-in bg-[#FAF6F0] p-4 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                    1-Click Smart Foreground Items
                  </h3>
                  <p className="text-xs text-stone-600 mb-3">
                    Click any item below to bring it to the front layer over the photo:
                  </p>

                  <div className="space-y-2">
                    {currentPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => stampSmartItem(preset)}
                        className="w-full py-2.5 px-3 bg-white hover:bg-amber-50 border border-stone-300 hover:border-[#7A1F1F] rounded-xl flex items-center justify-between text-xs font-bold text-stone-800 transition shadow-xs cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          {preset.icon === 'heart' && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                          {preset.icon === 'star' && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          {preset.icon === 'sparkle' && <Sparkle className="w-4 h-4 text-sky-500 fill-sky-500" />}
                          <span>{preset.name}</span>
                        </div>
                        <span className="text-[10px] text-[#7A1F1F] group-hover:underline">
                          Bring to Front →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Magic Wand Click Sensitivity */}
                <div className="pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#7A1F1F]" />
                      <span>Canvas Click Wand Tolerance</span>
                    </span>
                    <span className="font-mono">{wandTolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    value={wandTolerance}
                    onChange={(e) => setWandTolerance(parseInt(e.target.value, 10))}
                    className="w-full accent-[#7A1F1F]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Or click directly on any object on the canvas with the Magic Wand to select its boundary.
                  </p>
                </div>

                {/* Undo / Redo */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition ${
                        historyIndex > 0
                          ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300 cursor-pointer'
                          : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>

                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= maskHistory.length - 1}
                      className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition ${
                        historyIndex < maskHistory.length - 1
                          ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300 cursor-pointer'
                          : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                      <span>Redo</span>
                    </button>
                  </div>

                  <button
                    onClick={clearMask}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All Cutouts
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 1: QUAD CORNER NODE READOUTS */}
            {activeTool === 'quad' && (
              <div className="space-y-4 animate-fade-in bg-[#FAF6F0] p-4 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-600 font-medium">
                  Drag the 4 corner handles on the card to fit the tilted Polaroid frame:
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white rounded-xl border border-stone-300">
                    <span className="font-bold text-red-600">Top-Left (TL)</span>
                    <p className="font-mono text-stone-700">X: {quad.topLeft.x}% Y: {quad.topLeft.y}%</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-300">
                    <span className="font-bold text-sky-600">Top-Right (TR)</span>
                    <p className="font-mono text-stone-700">X: {quad.topRight.x}% Y: {quad.topRight.y}%</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-300">
                    <span className="font-bold text-emerald-600">Bottom-Right (BR)</span>
                    <p className="font-mono text-stone-700">X: {quad.bottomRight.x}% Y: {quad.bottomRight.y}%</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-300">
                    <span className="font-bold text-amber-600">Bottom-Left (BL)</span>
                    <p className="font-mono text-stone-700">X: {quad.bottomLeft.x}% Y: {quad.bottomLeft.y}%</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setQuad({
                      topLeft: { x: 14.5, y: 36.2 },
                      topRight: { x: 85.5, y: 34.0 },
                      bottomRight: { x: 86.5, y: 78.5 },
                      bottomLeft: { x: 15.5, y: 80.7 },
                    })
                  }
                  className="text-xs text-[#7A1F1F] hover:underline font-semibold cursor-pointer"
                >
                  Reset to Default Quad
                </button>
              </div>
            )}

            {/* TOOL 2: CUTOUT MASK BRUSH CONTROLS WITH UNDO / REDO */}
            {activeTool === 'mask' && (
              <div className="space-y-4 animate-fade-in bg-[#FAF6F0] p-4 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-600 font-medium">
                  Paint freehand over foreground elements or erase to trim edges:
                </p>

                {/* Brush / Eraser Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsErasing(false)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      !isErasing ? 'bg-[#7A1F1F] text-white shadow-sm' : 'bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Brush className="w-3.5 h-3.5" />
                    <span>Cutout Brush</span>
                  </button>
                  <button
                    onClick={() => setIsErasing(true)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isErasing ? 'bg-[#7A1F1F] text-white shadow-sm' : 'bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>
                </div>

                {/* Brush Size Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>Brush Size</span>
                    <span className="font-mono">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="80"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                    className="w-full accent-[#7A1F1F]"
                  />
                </div>

                {/* Undo, Redo, and Clear Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition ${
                        historyIndex > 0
                          ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300 cursor-pointer'
                          : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>

                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= maskHistory.length - 1}
                      className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition ${
                        historyIndex < maskHistory.length - 1
                          ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300 cursor-pointer'
                          : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                      <span>Redo</span>
                    </button>
                  </div>

                  <button
                    onClick={clearMask}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear Mask
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 3: PERSPECTIVE TEXT PLACEMENT */}
            {activeTool === 'text' && (
              <div className="space-y-4 animate-fade-in bg-[#FAF6F0] p-4 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-600 font-medium">
                  Position and tilt the teacher name text box to align with the Polaroid caption area:
                </p>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>Rotation / Tilt Angle</span>
                    <span className="font-mono">{textPlacement.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={textPlacement.rotation || 0}
                    onChange={(e) =>
                      setTextPlacement({ ...textPlacement, rotation: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#7A1F1F]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>Top Position (Y)</span>
                    <span className="font-mono">{textPlacement.top}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    step="0.5"
                    value={textPlacement.top}
                    onChange={(e) =>
                      setTextPlacement({ ...textPlacement, top: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#7A1F1F]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>Left Position (X)</span>
                    <span className="font-mono">{textPlacement.left}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="0.5"
                    value={textPlacement.left}
                    onChange={(e) =>
                      setTextPlacement({ ...textPlacement, left: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#7A1F1F]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>Width Box</span>
                    <span className="font-mono">{textPlacement.width}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="1"
                    value={textPlacement.width}
                    onChange={(e) =>
                      setTextPlacement({ ...textPlacement, width: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#7A1F1F]"
                  />
                </div>
              </div>
            )}

            {/* Test Photo Switcher */}
            <div className="pt-2 border-t border-stone-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Live Test Photo
              </label>
              <div className="flex items-center gap-2">
                {TEST_PHOTOS.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => setTestPhotoUrl(p)}
                    className={`rounded-xl overflow-hidden border-2 transition ${
                      testPhotoUrl === p ? 'border-[#7A1F1F] ring-2 ring-[#7A1F1F]' : 'border-stone-300 opacity-70'
                    }`}
                  >
                    <img src={p} alt={`Test ${i + 1}`} className="w-12 h-12 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT INTERACTIVE CANVAS VIEW */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            {/* Top Canvas Controls Bar */}
            <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] mb-3">
              <span className="text-xs font-semibold text-stone-600">
                Canvas Preview ({selectedTemplate.aspectRatio})
              </span>
              <button
                onClick={() => setShowNodes(!showNodes)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  showNodes
                    ? 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
                    : 'bg-[#7A1F1F] text-white border-[#7A1F1F]'
                }`}
              >
                {showNodes ? <EyeOff className="w-3.5 h-3.5 text-stone-600" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showNodes ? 'Hide Node Handles' : 'Show Node Handles'}</span>
              </button>
            </div>

            <div
              ref={containerRef}
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              className="relative w-[340px] sm:w-[400px] md:w-[440px] rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-900 bg-stone-900 select-none"
              style={{
                aspectRatio: selectedTemplate.aspectRatio === '9/16' ? '9 / 16' : selectedTemplate.aspectRatio === '3/4' ? '3 / 4' : '4 / 5',
              }}
            >
              {/* 1. Base Template Image */}
              {selectedTemplate.baseImageUrl && (
                <img
                  src={selectedTemplate.baseImageUrl}
                  alt={selectedTemplate.name}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}

              {/* 2. Warped Photo Layer (Tilted, Sized, and Clipped via Quadrilateral) */}
              {(() => {
                const qm = getQuadBoundsAndRotation(quad);
                return (
                  <div
                    className="absolute overflow-hidden z-10"
                    style={{
                      left: `${qm.minX}%`,
                      top: `${qm.minY}%`,
                      width: `${qm.bboxW}%`,
                      height: `${qm.bboxH}%`,
                      transform: `rotate(${qm.rotation}deg)`,
                      transformOrigin: 'center center',
                      clipPath: qm.relativeClipPath,
                    }}
                  >
                    <img
                      src={testPhotoUrl}
                      alt="Warped Student Photo"
                      className="w-full h-full object-cover pointer-events-none scale-105"
                    />
                  </div>
                );
              })()}

              {/* 3. Foreground Mask Canvas Layer */}
              <canvas
                ref={canvasRef}
                width={880}
                height={1564}
                onMouseDown={handleMaskMouseDown}
                onMouseMove={handleMaskMouseMove}
                onMouseUp={handleMaskMouseUp}
                className={`absolute inset-0 w-full h-full z-20 ${
                  activeTool === 'mask' || activeTool === 'wand'
                    ? 'cursor-crosshair pointer-events-auto'
                    : 'pointer-events-none'
                }`}
              />

              {/* 4. Perspective Text Placement Preview */}
              <div
                className="absolute z-25 text-center px-2 pointer-events-none"
                style={{
                  left: `${textPlacement.left}%`,
                  top: `${textPlacement.top}%`,
                  width: `${textPlacement.width}%`,
                  transform: textPlacement.rotation ? `rotate(${textPlacement.rotation}deg)` : undefined,
                  border: activeTool === 'text' ? '1.5px dashed #7A1F1F' : 'none',
                }}
              >
                <p className="font-handwritten font-bold text-stone-900 text-lg md:text-xl leading-tight">
                  Prof. Anjali Sharma
                </p>
              </div>

              {/* 5. DRAGGABLE QUAD NODE HANDLES (When in Quad Mode & Nodes Visible) */}
              {activeTool === 'quad' && showNodes && (
                <>
                  {/* Polygon outline wireframe with viewBox 0 0 100 100 */}
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none z-30"
                  >
                    <polygon
                      points={`${quad.topLeft.x},${quad.topLeft.y} ${quad.topRight.x},${quad.topRight.y} ${quad.bottomRight.x},${quad.bottomRight.y} ${quad.bottomLeft.x},${quad.bottomLeft.y}`}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="#2563EB"
                      strokeWidth="0.7"
                      strokeDasharray="1.5 1.5"
                    />
                  </svg>

                  {/* Node 1: Top-Left (TL) */}
                  <div
                    onMouseDown={() => setDraggingNode('topLeft')}
                    className="absolute z-40 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-black text-white"
                    style={{ left: `${quad.topLeft.x}%`, top: `${quad.topLeft.y}%` }}
                  >
                    TL
                  </div>

                  {/* Node 2: Top-Right (TR) */}
                  <div
                    onMouseDown={() => setDraggingNode('topRight')}
                    className="absolute z-40 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-600 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-black text-white"
                    style={{ left: `${quad.topRight.x}%`, top: `${quad.topRight.y}%` }}
                  >
                    TR
                  </div>

                  {/* Node 3: Bottom-Right (BR) */}
                  <div
                    onMouseDown={() => setDraggingNode('bottomRight')}
                    className="absolute z-40 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-black text-white"
                    style={{ left: `${quad.bottomRight.x}%`, top: `${quad.bottomRight.y}%` }}
                  >
                    BR
                  </div>

                  {/* Node 4: Bottom-Left (BL) */}
                  <div
                    onMouseDown={() => setDraggingNode('bottomLeft')}
                    className="absolute z-40 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-black text-white"
                    style={{ left: `${quad.bottomLeft.x}%`, top: `${quad.bottomLeft.y}%` }}
                  >
                    BL
                  </div>
                </>
              )}
            </div>

            <p className="font-script-accent text-stone-500 text-sm mt-4">
              {activeTool === 'quad' && 'Drag TL, TR, BR, BL nodes to align the four corners of the Polaroid frame'}
              {activeTool === 'wand' && 'Click any 1-Click item button or click on the canvas to auto-select and bring foreground objects forward'}
              {activeTool === 'mask' && 'Click and paint foreground objects to draw them on top of the photo. Use Undo/Redo or Eraser anytime.'}
              {activeTool === 'text' && 'Adjust rotation and positions on the left panel to place the teacher name'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

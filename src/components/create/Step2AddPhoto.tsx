'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, RefreshCw, Sparkles, ArrowRight, ArrowLeft, Image as ImageIcon, X, ZoomIn, Move, RotateCw, RotateCcw } from 'lucide-react';
import { WashiTape } from '../card/WashiTape';
import { CardCustomConfig } from '@/types';

interface Step2AddPhotoProps {
  photoUrl: string;
  photoPosition?: { x: number; y: number; scale: number; rotation: number };
  onPhotoSelected: (photoUrl: string, file?: File) => void;
  onPhotoPositionChange?: (position: { x: number; y: number; scale: number; rotation: number }) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2AddPhoto: React.FC<Step2AddPhotoProps> = ({
  photoUrl,
  photoPosition = { x: 0, y: 0, scale: 1, rotation: 0 },
  onPhotoSelected,
  onPhotoPositionChange,
  onNext,
  onBack,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facingMode: 'user' | 'environment' = cameraFacing) => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access not granted or not supported on this device. Please choose or upload a photo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCountdown(null);
  };

  const captureSelfie = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          performCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 800);
  };

  const performCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onPhotoSelected(capturedDataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoSelected(reader.result, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const flipCamera = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const updatePos = (newPos: Partial<typeof photoPosition>) => {
    if (onPhotoPositionChange) {
      onPhotoPositionChange({ ...photoPosition, ...newPos });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center relative mb-8">
        <p className="font-script-accent text-[#7A1F1F] text-2xl md:text-3xl font-bold">
          Add your moment
        </p>
        <h1 className="font-serif-heading text-3xl md:text-5xl font-extrabold text-stone-900 mt-1">
          Upload or take a photo with your teacher
        </h1>
        <p className="font-script-accent text-stone-600 text-lg md:text-xl mt-2 max-w-lg mx-auto">
          This photo will make your card extra special.
        </p>
      </div>

      {/* Selected Photo Position & Crop Controls */}
      {photoUrl && !isCameraActive && (
        <div className="mb-8 max-w-xl mx-auto bg-[#FFFDF9] rounded-3xl p-5 border-2 border-stone-200 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <img src={photoUrl} alt="Selected" className="w-12 h-12 rounded-xl object-cover border border-stone-300" />
              <div>
                <p className="font-semibold text-stone-900 text-sm">Adjust Photo Placement</p>
                <p className="text-xs text-stone-500">Pan and zoom so faces fit perfectly in the frame</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[#7A1F1F] hover:underline"
            >
              Change Photo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {/* Zoom / Scale */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom</span>
                </span>
                <span className="font-mono">{Math.round(photoPosition.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={photoPosition.scale}
                onChange={(e) => updatePos({ scale: parseFloat(e.target.value) })}
                className="w-full accent-[#7A1F1F]"
              />
            </div>

            {/* Horizontal Pan */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Pan X</span>
                <span className="font-mono">{photoPosition.x}px</span>
              </div>
              <input
                type="range"
                min="-150"
                max="150"
                value={photoPosition.x}
                onChange={(e) => updatePos({ x: parseInt(e.target.value, 10) })}
                className="w-full accent-[#7A1F1F]"
              />
            </div>

            {/* Vertical Pan */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Pan Y</span>
                <span className="font-mono">{photoPosition.y}px</span>
              </div>
              <input
                type="range"
                min="-150"
                max="150"
                value={photoPosition.y}
                onChange={(e) => updatePos({ y: parseInt(e.target.value, 10) })}
                className="w-full accent-[#7A1F1F]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => updatePos({ x: 0, y: 0, scale: 1, rotation: 0 })}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Reset Position
            </button>
          </div>
        </div>
      )}

      {/* CAMERA ACTIVE MODAL */}
      {isCameraActive ? (
        <div className="max-w-xl mx-auto bg-[#1C1917] rounded-3xl p-4 md:p-6 shadow-2xl border-4 border-stone-700 relative overflow-hidden animate-scale-up">
          <div className="flex items-center justify-between mb-3 text-white px-2">
            <span className="font-script-accent text-amber-300 text-xl font-bold">
              Capture a memory together
            </span>
            <button
              onClick={stopCamera}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden border border-stone-700">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {countdown !== null && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                <span className="font-serif-heading text-8xl text-white font-black animate-ping">
                  {countdown}
                </span>
              </div>
            )}

            <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-xl pointer-events-none" />
          </div>

          {cameraError && (
            <p className="text-red-400 text-xs text-center mt-2 px-2">{cameraError}</p>
          )}

          <div className="flex items-center justify-around mt-5 pt-2">
            <button
              onClick={stopCamera}
              className="text-xs text-stone-400 hover:text-white font-medium"
            >
              Cancel
            </button>

            <button
              onClick={captureSelfie}
              disabled={countdown !== null}
              className="w-18 h-18 rounded-full bg-white p-1.5 shadow-xl hover:scale-105 active:scale-95 transition"
            >
              <div className="w-full h-full rounded-full border-2 border-stone-900 bg-white flex items-center justify-center">
                <Camera className="w-7 h-7 text-stone-900" />
              </div>
            </button>

            <button
              onClick={flipCamera}
              className="flex flex-col items-center text-xs text-stone-300 hover:text-white gap-1"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Flip</span>
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD 2-CARD CHOOSER */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1: Upload a Photo */}
          <div className="relative bg-[#FFFDF9] rounded-3xl p-8 shadow-lg border border-stone-200 flex flex-col items-center text-center justify-between group hover:shadow-xl transition">
            <div className="absolute -top-3 left-6">
              <WashiTape pattern="polka" width={90} height={24} rotation={-4} />
            </div>

            <div className="w-20 h-20 rounded-full bg-amber-50 text-stone-800 flex items-center justify-center mb-4 mt-2 group-hover:scale-110 transition border border-amber-200">
              <UploadCloud className="w-10 h-10 text-stone-800" />
            </div>

            <div>
              <h3 className="font-serif-heading text-2xl font-bold text-stone-900">
                Upload a photo
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Choose from your gallery or files.
              </p>
            </div>

            <div className="mt-8 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1C1917] hover:bg-stone-800 text-white font-semibold text-sm shadow transition active:scale-95"
              >
                Choose Photo
              </button>
              <span className="block text-[11px] text-stone-400 mt-2">
                PNG, JPG up to 10MB
              </span>
            </div>
          </div>

          {/* Card 2: Take a Photo */}
          <div className="relative bg-[#1C1917] rounded-3xl p-8 shadow-xl border border-stone-800 flex flex-col items-center text-center justify-between group hover:shadow-2xl transition text-white">
            <div className="absolute -top-3 right-6">
              <WashiTape pattern="red" width={90} height={24} rotation={4} />
            </div>

            <div className="w-20 h-20 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center mb-4 mt-2 group-hover:scale-110 transition border border-stone-700">
              <Camera className="w-10 h-10 text-amber-400" />
            </div>

            <div>
              <h3 className="font-serif-heading text-2xl font-bold text-white">
                Take a photo
              </h3>
              <p className="text-stone-400 text-sm mt-1">
                Capture a new photo with your teacher.
              </p>
            </div>

            <div className="mt-8 w-full">
              <button
                onClick={() => startCamera()}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#D49B4B] hover:bg-[#E5A83B] text-stone-950 font-bold text-sm shadow transition active:scale-95"
              >
                Open Camera
              </button>
              <span className="block text-[11px] text-stone-400 mt-2">
                Instant webcam or phone camera
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-full border border-stone-400 hover:bg-stone-100 text-stone-700 font-semibold text-sm flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </button>

        <button
          onClick={onNext}
          disabled={!photoUrl}
          className={`px-8 py-3.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition transform active:scale-95 ${
            photoUrl
              ? 'bg-[#7A1F1F] hover:bg-[#5C1515] text-white cursor-pointer'
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
        >
          <span>Continue to Editor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

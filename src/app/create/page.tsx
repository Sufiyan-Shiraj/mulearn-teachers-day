'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CardCustomConfig, CardTemplate, CardData } from '@/types';
import { fetchTemplates, saveCard } from '@/lib/storage';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { StepIndicator } from '@/components/create/StepIndicator';
import { Step1PickCard } from '@/components/create/Step1PickCard';
import { Step2AddPhoto } from '@/components/create/Step2AddPhoto';
import { Step3CardCanvas } from '@/components/create/Step3CardCanvas';
import { Step4Preview } from '@/components/create/Step4Preview';
import { Step5Share } from '@/components/create/Step5Share';
import { Sparkles, User, ArrowRight } from 'lucide-react';
import { WashiTape } from '@/components/card/WashiTape';

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, signInWithGoogle } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedCard, setPublishedCard] = useState<CardData | null>(null);

  // Fallback active template
  const activeTemplate: CardTemplate = selectedTemplate || templates[0] || {
    id: 'template-maroon-party',
    name: 'Party Sparkle Maroon',
    category: 'Bold',
    previewImageUrl: '/templates/template_1.png',
    bgType: 'image',
    bgImageUrl: '/templates/template_1.png',
    defaultConfig: {},
  };

  // Configuration state
  const [config, setConfig] = useState<CardCustomConfig>({
    teacherName: '',
    message: 'Thank you for inspiring me every day! You make learning an adventure.',
    titleText: 'HAPPY TEACHERS DAY',
    fontFamily: 'Playful',
    textColor: '#FFFFFF',
    textSize: 22,
    textAlign: 'center',
    photoPosition: { x: 0, y: 0, scale: 1, rotation: 0 },
    stickers: [],
    insideMessage: '',
  });

  useEffect(() => {
    fetchTemplates().then((tpls) => {
      setTemplates(tpls);
      if (tpls.length > 0) {
        const templateParam = searchParams.get('template');
        const found = templateParam ? tpls.find((t) => t.id === templateParam) : tpls[0];
        if (found) {
          setSelectedTemplate(found);
          applyTemplateDefaults(found);
        }
      }
    });
  }, [searchParams]);

  const applyTemplateDefaults = (tpl: CardTemplate) => {
    setConfig((prev) => ({
      ...prev,
      ...tpl.defaultConfig,
      teacherName: prev.teacherName || tpl.defaultConfig.teacherName || 'Dear Teacher',
      message: prev.message || tpl.defaultConfig.message || 'Happy Teachers Day!',
    }));
  };

  const handleSelectTemplate = (tpl: CardTemplate) => {
    setSelectedTemplate(tpl);
    applyTemplateDefaults(tpl);
  };

  const handlePhotoSelected = (url: string, file?: File) => {
    setPhotoUrl(url);
    if (file) setPhotoFile(file);
  };

  const handlePublishAndShare = async (): Promise<CardData> => {
    setIsPublishing(true);
    try {
      let finalPhotoUrl = photoUrl;
      let photoPublicId = undefined;

      if (photoFile || photoUrl.startsWith('data:')) {
        const uploadResult = await uploadToCloudinary(photoFile || photoUrl);
        finalPhotoUrl = uploadResult.secureUrl;
        photoPublicId = uploadResult.publicId;
      }

      const nameSlug = (config.teacherName || 'teacher')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 18);
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const shareSlug = `${nameSlug}-${randomSuffix}`;

      const saved = await saveCard({
        ownerId: user?.id || 'demo-user-123',
        ownerName: user?.displayName || 'mulearn Student',
        ownerUsername: user?.username || 'student',
        ownerAvatar: user?.avatarUrl || '',
        templateId: activeTemplate.id,
        templateName: activeTemplate.name,
        teacherName: config.teacherName,
        message: config.message,
        photoUrl: finalPhotoUrl,
        photoPublicId,
        shareSlug,
        likeCount: 0,
        customConfig: config,
      });

      setPublishedCard(saved);
      setIsPublishing(false);
      return saved;
    } catch (e) {
      console.error('Publish error:', e);
      setIsPublishing(false);
      throw e;
    }
  };

  // 1. AUTH GATE: User must be signed in with Google to create cards
  if (!isLoading && !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl p-8 border border-stone-200 shadow-2xl text-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape-red w-32 h-6 rounded-[1px] shadow-sm -rotate-1" />

          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#7A1F1F] flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <User className="w-8 h-8" />
          </div>

          <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-stone-900 leading-tight">
            Sign In to Create Your Card
          </h2>
          <p className="font-script-accent text-stone-600 text-lg mt-2 mb-8">
            Please sign in with your Google account to customize and save your cards.
          </p>

          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-stone-50 border-2 border-stone-300 rounded-2xl shadow-sm text-stone-800 font-bold text-sm transition transform active:scale-95 hover:shadow cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-[11px] text-stone-400 mt-4">
            One-click Google authentication powered by Supabase for mulearn ASI club members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAF6F0] py-4">
      {/* 5-Step Shared Progress Stepper */}
      <StepIndicator
        currentStep={step}
        onStepClick={(s) => {
          if (s < step || (s === 2 && selectedTemplate) || (s === 3 && photoUrl)) {
            setStep(s);
          }
        }}
      />

      {/* Step Content */}
      <div className="mt-2">
        {step === 1 && (
          <Step1PickCard
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2AddPhoto
            photoUrl={photoUrl}
            photoPosition={config.photoPosition}
            onPhotoSelected={handlePhotoSelected}
            onPhotoPositionChange={(pos) => setConfig({ ...config, photoPosition: pos })}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3CardCanvas
            template={activeTemplate}
            photoUrl={photoUrl}
            config={config}
            onChangeConfig={(newCfg) => setConfig(newCfg)}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <Step4Preview
            template={activeTemplate}
            photoUrl={photoUrl}
            config={config}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
            onJumpToStep={(s) => setStep(s)}
          />
        )}

        {step === 5 && (
          <Step5Share
            template={activeTemplate}
            photoUrl={photoUrl}
            config={config}
            publishedCard={publishedCard}
            isPublishing={isPublishing}
            onPublishAndShare={handlePublishAndShare}
            onEdit={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#7A1F1F] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}

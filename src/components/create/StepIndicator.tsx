'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, label: 'Pick Card' },
  { step: 2, label: 'Add Photo' },
  { step: 3, label: 'Create' },
  { step: 4, label: 'Preview' },
  { step: 5, label: 'Share' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full max-w-xl mx-auto py-3 px-4 select-none">
      <div className="relative flex items-center justify-between">
        {/* Continuous background connecting line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[2px] bg-stone-300 z-0" />
        
        {/* Filled progress line */}
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-[2px] bg-[#7A1F1F] z-0 transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 92}%`,
          }}
        />

        {STEPS.map(({ step, label }) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const isAccessible = step <= currentStep;

          return (
            <div
              key={step}
              onClick={() => {
                if (isAccessible && onStepClick) {
                  onStepClick(step);
                }
              }}
              className={`relative z-10 flex flex-col items-center group ${
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm ${
                  isCurrent
                    ? 'bg-[#7A1F1F] text-white ring-4 ring-[#7A1F1F]/20 scale-110'
                    : isCompleted
                    ? 'bg-[#FFFDF9] text-stone-800 border-2 border-stone-400 hover:border-[#7A1F1F]'
                    : 'bg-[#FFFDF9] text-stone-400 border border-stone-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-800 stroke-[3]" />
                ) : (
                  <span>{step}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-[10px] sm:text-xs mt-1.5 font-medium transition ${
                  isCurrent
                    ? 'text-[#7A1F1F] font-bold'
                    : isCompleted
                    ? 'text-stone-700'
                    : 'text-stone-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

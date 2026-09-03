import { QuadPoints } from '@/lib/perspectiveWarp';

export type TemplateAspectRatio = '9/16' | '3/4' | '4/5' | '1/1';

export interface PhotoWindowConfig {
  /** Left offset percentage (0 - 100) */
  left: number;
  /** Top offset percentage (0 - 100) */
  top: number;
  /** Width percentage (0 - 100) */
  width: number;
  /** Height percentage (0 - 100) */
  height: number;
  /** Rotation in degrees */
  rotation: number;
  /** Border radius in px or % */
  borderRadius?: string;
  /** Optional 4-Corner Pin Quad Points for perspective warping */
  quadPoints?: QuadPoints;
}

export interface TextPlacementConfig {
  top: number; // percentage
  left: number; // percentage
  width: number; // percentage
  rotation?: number; // degrees
  align: 'left' | 'center' | 'right';
  defaultColor: string;
  defaultFont: 'Playful' | 'Elegant' | 'Typewriter' | 'Handwritten' | 'Classic' | 'Bold';
  defaultSize: number;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'Bold' | 'Vintage' | 'Floral' | 'Minimal' | 'Soft' | 'Playful' | 'Retro';
  previewImageUrl: string;
  baseImageUrl?: string;
  aspectRatio: TemplateAspectRatio;
  badgeText?: string;
  isNew?: boolean;
  isPopular?: boolean;
  photoWindow: PhotoWindowConfig;
  teacherNamePlacement: TextPlacementConfig;
  messagePlacement: TextPlacementConfig;
  insideBgColor: string;
  insideTextColor: string;
  // Foreground overlay components/renderers or cutouts
  foregroundType?: 'template_1_overlay' | 'template_2_overlay' | 'custom_mask' | 'none';
  foregroundMaskUrl?: string; // Data URI / PNG of user-drawn foreground mask
}

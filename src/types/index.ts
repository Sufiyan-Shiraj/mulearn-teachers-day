export type TemplateCategory = 
  | 'All' 
  | 'Bold' 
  | 'Soft' 
  | 'Floral' 
  | 'Minimal' 
  | 'Vintage' 
  | 'Playful' 
  | 'Retro';

export type FontFamilyChoice = 
  | 'Playful' 
  | 'Elegant' 
  | 'Typewriter' 
  | 'Handwritten' 
  | 'Classic' 
  | 'Bold';

export interface StickerElement {
  id: string;
  type: 'star' | 'heart' | 'flower' | 'disco' | 'gradcap' | 'vinyl' | 'sparkle' | 'tape' | 'doodle_heart' | 'doodle_star' | 'paperclip';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px
  rotation: number; // deg
  color?: string;
  variant?: string;
}

export interface TextElement {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // px
  fontFamily: FontFamilyChoice;
  color: string;
  align: 'left' | 'center' | 'right';
  isDragging?: boolean;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface CardCustomConfig {
  teacherName: string;
  message: string;
  titleText?: string;
  fontFamily: FontFamilyChoice;
  textColor: string;
  textSize: number;
  textAlign: 'left' | 'center' | 'right';
  photoPosition?: { x: number; y: number; scale: number; rotation: number };
  stickers: StickerElement[];
  drawings?: DrawingPath[];
  insideMessage?: string;
  insideTeacherName?: string;
  insideFontFamily?: FontFamilyChoice;
  insideTextColor?: string;
  themeColor?: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  previewImageUrl: string;
  bgImageUrl?: string;
  bgType: 'image' | 'maroon_party' | 'blue_2026' | 'vintage_floral' | 'minimal_dark' | 'soft_lilac';
  badgeText?: string;
  isNew?: boolean;
  isPopular?: boolean;
  defaultConfig: Partial<CardCustomConfig>;
  insideBgColor?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  username: string;
  createdAt: string;
}

export interface CardData {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerUsername?: string;
  ownerAvatar?: string;
  templateId: string;
  templateName?: string;
  teacherName: string;
  message: string;
  photoUrl: string;
  photoPublicId?: string;
  shareSlug: string;
  likeCount: number;
  customConfig: CardCustomConfig;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  cardCount: number;
  likeCount: number;
  rank: number;
  badge?: 'gold' | 'silver' | 'bronze';
  note?: string;
}

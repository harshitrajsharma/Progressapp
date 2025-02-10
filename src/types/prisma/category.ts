import { LucideIcon } from "lucide-react";

export type ChapterCategory = 'learning' | 'revision' | 'practice' | 'test';

export interface CategoryStyles {
  color: string;
  activeColor?: string;
  hoverColor?: string;
  outlineColor?: string;
  defaultColor?: string;
}

export interface CategoryConfig extends CategoryStyles {
  id: ChapterCategory;
  label: string;
  icon: LucideIcon;
  borderColor?: string;
}

export interface CategoryVariant {
  default: string;
  icon: string;
} 
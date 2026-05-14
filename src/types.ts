export type OutMode = 'open' | 'double' | 'master';
export type BullMode = 'fat' | 'separate';
export type AppMode = 'practice' | 'test' | 'calculator' | 'arrangement';
export type ArrangementCategory = 'open' | 'double' | 'master' | 'double_separate';

export interface ThrowResult {
  display: string;
  score: number;
  multiplier: 1 | 2 | 3;
  value: number;
}

export interface ArrangementEntry {
  id: string;
  score: number;
  dart1: string;
  dart2: string;
  dart3: string;
  left: number | null;
  category: ArrangementCategory;
  savedAt: number;
}

export interface GameSettings {
  bullMode: BullMode;
  outMode: OutMode;
}

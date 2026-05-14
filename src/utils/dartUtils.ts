import { ThrowResult, OutMode, BullMode } from '../types';

export const SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

export const BOARD_RADII = {
  doubleBull: 0.095,
  singleBull: 0.195,
  tripleInner: 0.540,
  tripleOuter: 0.640,
  doubleInner: 0.860,
  doubleOuter: 1.0,
};

export function getThrowFromClick(
  clickX: number,
  clickY: number,
  centerX: number,
  centerY: number,
  boardRadius: number,
  bullMode?: BullMode
): ThrowResult | null {
  const dx = clickX - centerX;
  const dy = clickY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const r = dist / boardRadius;

  if (r > 1.0) return null;

  let angleDeg = Math.atan2(dx, -dy) * 180 / Math.PI;
  if (angleDeg < 0) angleDeg += 360;

  if (r < BOARD_RADII.doubleBull) {
    return { display: 'Bull', score: 50, multiplier: 2, value: 25 };
  }
  if (r < BOARD_RADII.singleBull) {
    // ファットブルではアウターブルも50点扱い
    if (bullMode === 'fat') {
      return { display: 'Bull', score: 50, multiplier: 2, value: 25 };
    }
    return { display: '25', score: 25, multiplier: 1, value: 25 };
  }

  const segmentIndex = Math.floor((angleDeg + 9) / 18) % 20;
  const value = SEGMENTS[segmentIndex];

  if (r >= BOARD_RADII.tripleInner && r <= BOARD_RADII.tripleOuter) {
    return { display: `T${value}`, score: value * 3, multiplier: 3, value };
  } else if (r >= BOARD_RADII.doubleInner) {
    return { display: `D${value}`, score: value * 2, multiplier: 2, value };
  } else {
    return { display: `${value}`, score: value, multiplier: 1, value };
  }
}

function getReachableIn1(): Set<number> {
  const scores = new Set<number>();
  for (let i = 1; i <= 20; i++) {
    scores.add(i);
    scores.add(i * 2);
    scores.add(i * 3);
  }
  scores.add(25);
  scores.add(50);
  return scores;
}

let _reachableIn2: Set<number> | null = null;
function getReachableInAtMost2(): Set<number> {
  if (_reachableIn2) return _reachableIn2;
  const in1 = getReachableIn1();
  const scores = new Set<number>([0]);
  for (const a of in1) {
    scores.add(a);
    for (const b of in1) {
      scores.add(a + b);
    }
  }
  _reachableIn2 = scores;
  return scores;
}

function getValidFinishDartsForMode(outMode: OutMode, bullMode: BullMode): number[] {
  if (outMode === 'open') {
    return Array.from(getReachableIn1());
  }
  const darts: number[] = [];
  for (let i = 1; i <= 20; i++) darts.push(i * 2);
  darts.push(50);
  if (bullMode === 'fat') darts.push(25);
  if (outMode === 'master') {
    for (let i = 1; i <= 20; i++) darts.push(i * 3);
  }
  return darts;
}

export function canFinishScore(score: number, outMode: OutMode, bullMode: BullMode): boolean {
  if (score <= 0 || score > 170) return false;
  const reachableIn2 = getReachableInAtMost2();
  const finishDarts = getValidFinishDartsForMode(outMode, bullMode);
  for (const last of finishDarts) {
    if (last > score) continue;
    if (reachableIn2.has(score - last)) return true;
  }
  return false;
}

export function isValidFinish(
  throws: (ThrowResult | null)[],
  targetScore: number,
  outMode: OutMode,
  bullMode: BullMode
): boolean {
  const validThrows = throws.filter((t): t is ThrowResult => t !== null);
  const total = validThrows.reduce((sum, t) => sum + t.score, 0);
  if (total !== targetScore) return false;
  if (validThrows.length === 0) return false;
  const lastThrow = validThrows[validThrows.length - 1];
  if (outMode === 'open') return true;
  if (outMode === 'double') {
    if (lastThrow.multiplier === 2) return true;
    if (lastThrow.display === 'Bull') return true;
    if (bullMode === 'fat' && lastThrow.display === '25') return true;
    return false;
  }
  if (outMode === 'master') {
    if (lastThrow.multiplier === 2 || lastThrow.multiplier === 3) return true;
    if (lastThrow.display === 'Bull') return true;
    if (bullMode === 'fat' && lastThrow.display === '25') return true;
    return false;
  }
  return false;
}

export function getValidFinishScores(outMode: OutMode, bullMode: BullMode): number[] {
  const scores: number[] = [];
  for (let s = 1; s <= 170; s++) {
    if (canFinishScore(s, outMode, bullMode)) scores.push(s);
  }
  return scores;
}

export function generateTestQuestions(outMode: OutMode, bullMode: BullMode): number[] {
  const validScores = getValidFinishScores(outMode, bullMode);
  const easy = validScores.filter(s => s <= 40);
  const medium = validScores.filter(s => s > 40 && s <= 100);
  const hard = validScores.filter(s => s > 100 && s <= 140);
  const veryHard = validScores.filter(s => s > 140);

  function pickRandom(arr: number[], count: number): number[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  const q1 = pickRandom(easy, 2);
  const q2 = pickRandom(easy.filter(s => !q1.includes(s)), 1);
  const q3 = pickRandom(medium, 3);
  const q4 = pickRandom(hard, 2);
  const q5 = pickRandom(veryHard, 2);

  return [...q1, ...q2, ...q3, ...q4, ...q5].slice(0, 10);
}

export function getOutModeLabel(outMode: OutMode): string {
  switch (outMode) {
    case 'open': return 'Open Out';
    case 'double': return 'Double Out';
    case 'master': return 'Master Out';
  }
}

export function getBullModeLabel(bullMode: BullMode): string {
  return bullMode === 'fat' ? 'ファットブル' : 'セパレートブル';
}

export function throwsTotal(throws: (ThrowResult | null)[]): number {
  return throws.reduce((sum, t) => sum + (t?.score ?? 0), 0);
}

import { useState, useEffect, useCallback } from 'react';
import PracticeMode from './components/PracticeMode';
import TestMode from './components/TestMode';
import CalculatorMode from './components/CalculatorMode';
import ArrangementTable from './components/ArrangementTable';
import { AppMode, ArrangementEntry, ArrangementCategory, ThrowResult } from './types';
import './App.css';

const STORAGE_KEY = 'darts-arrangements';

function loadEntries(): ArrangementEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntriesToStorage(entries: ArrangementEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

const HOME_ITEMS: { key: AppMode; label: string; sub: string; icon: string }[] = [
  { key: 'practice',    label: '練習モード',   sub: '好きな点数でアレンジ練習',   icon: '🎯' },
  { key: 'test',        label: 'テストモード',  sub: '10問ランダム出題',           icon: '📝' },
  { key: 'calculator',  label: '計算機モード',  sub: '3本の合計を計算',            icon: '🔢' },
  { key: 'arrangement', label: 'アレンジ表',    sub: '保存したアレンジを確認',     icon: '📋' },
];

const MODE_LABELS: Record<AppMode, string> = {
  practice: '練習モード',
  test: 'テストモード',
  calculator: '計算機モード',
  arrangement: 'アレンジ表',
};

export default function App() {
  const [mode, setMode] = useState<AppMode | null>(null);
  const [entries, setEntries] = useState<ArrangementEntry[]>(loadEntries);

  useEffect(() => {
    saveEntriesToStorage(entries);
  }, [entries]);

  const handleSave = useCallback((
    score: number,
    throws: (ThrowResult | null)[],
    category: ArrangementCategory
  ) => {
    const validThrows = throws.filter((t): t is ThrowResult => t !== null);
    const totalThrown = validThrows.reduce((s, t) => s + t.score, 0);
    const left = score - totalThrown;

    const entry: ArrangementEntry = {
      id: `${Date.now()}-${Math.random()}`,
      score,
      dart1: throws[0]?.display ?? '',
      dart2: throws[1]?.display ?? '',
      dart3: throws[2]?.display ?? '',
      left: left > 0 ? left : null,
      category,
      savedAt: Date.now(),
    };

    setEntries(prev => [...prev, entry]);
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  if (mode === null) {
    return (
      <div className="app home-screen">
        <div className="home-header">
          <h1 className="home-title">🎯 ダーツ アレンジ練習</h1>
        </div>
        <div className="home-grid">
          {HOME_ITEMS.map(item => (
            <button key={item.key} className="home-card" onClick={() => setMode(item.key)}>
              <span className="home-card-icon">{item.icon}</span>
              <span className="home-card-label">{item.label}</span>
              <span className="home-card-sub">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="back-btn" onClick={() => setMode(null)}>← ホーム</button>
        <h1 className="app-title">{MODE_LABELS[mode]}</h1>
      </header>
      <main className="app-main">
        {mode === 'practice' && <PracticeMode onSave={handleSave} />}
        {mode === 'test' && <TestMode />}
        {mode === 'calculator' && <CalculatorMode onSave={handleSave} />}
        {mode === 'arrangement' && (
          <ArrangementTable entries={entries} onDelete={handleDeleteEntry} />
        )}
      </main>
    </div>
  );
}

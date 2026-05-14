import { useState, useCallback } from 'react';
import DartBoard from './DartBoard';
import ThrowDisplay from './ThrowDisplay';
import GameSettings from './GameSettings';
import { ThrowResult, GameSettings as GameSettingsType, ArrangementCategory } from '../types';
import { throwsTotal } from '../utils/dartUtils';
import './PracticeMode.css';

interface PracticeModeProps {
  onSave: (score: number, throws: (ThrowResult | null)[], category: ArrangementCategory) => void;
}

export default function PracticeMode({ onSave }: PracticeModeProps) {
  const [targetScore, setTargetScore] = useState<number>(501);
  const [inputValue, setInputValue] = useState<string>('501');
  const [settings, setSettings] = useState<GameSettingsType>({ bullMode: 'fat', outMode: 'double' });
  const [throws, setThrows] = useState<(ThrowResult | null)[]>([null, null, null]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const total = throwsTotal(throws);
  const remaining = targetScore - total;

  const handleThrow = useCallback((result: ThrowResult) => {
    setThrows(prev => {
      const next = [...prev];
      next[selectedIndex] = result;
      const nextFilled = next.findIndex(t => t === null);
      if (nextFilled !== -1 && nextFilled !== selectedIndex) {
        setSelectedIndex(nextFilled);
      } else if (selectedIndex < 2) {
        const after = next.slice(selectedIndex + 1).findIndex(t => t === null);
        if (after !== -1) setSelectedIndex(selectedIndex + 1 + after);
      }
      return next;
    });
  }, [selectedIndex]);

  function handleDelete() {
    setThrows([null, null, null]);
    setSelectedIndex(0);
  }

  function handleDeleteSingle(index: number) {
    setThrows(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setSelectedIndex(index);
  }

  function handleScoreSubmit() {
    const v = parseInt(inputValue);
    if (!isNaN(v) && v >= 1 && v <= 501) {
      setTargetScore(v);
      setThrows([null, null, null]);
      setSelectedIndex(0);
    }
  }

  function handleSaveWithCategory(category: ArrangementCategory) {
    onSave(targetScore, throws, category);
    setShowSaveDialog(false);
  }

  const hasThrows = throws.some(t => t !== null);

  return (
    <div className="practice-mode">
      <div className="score-setup">
        <div className="score-input-row">
          <input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onBlur={handleScoreSubmit}
            onKeyDown={e => e.key === 'Enter' && handleScoreSubmit()}
            min={1}
            max={501}
            className="score-input"
          />
          <span className="score-input-label">pts — Practice</span>
        </div>
        <GameSettings settings={settings} onChange={setSettings} />
      </div>

      <div className="score-left-display">
        <div className="score-left-col">
          <span className="sl-label">Score</span>
          <span className="sl-value">{total}</span>
        </div>
        <div className="score-left-divider" />
        <div className="score-left-col">
          <span className="sl-label">Left</span>
          <span className={`sl-value${remaining < 0 ? ' bust' : ''}`}>
            {remaining < 0 ? 'BUST' : remaining}
          </span>
          {remaining < 0 && (
            <span className="bust-over">{Math.abs(remaining)} over</span>
          )}
        </div>
      </div>

      <DartBoard onThrow={handleThrow} bullMode={settings.bullMode} />

      <ThrowDisplay
        throws={throws}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        onDelete={handleDelete}
        onDeleteSingle={handleDeleteSingle}
      />

      {hasThrows && (
        <button className="save-btn" onClick={() => setShowSaveDialog(true)}>
          Save
        </button>
      )}

      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Save to Checkout Chart</h3>
            <p>Which chart?</p>
            <div className="modal-buttons">
              <button onClick={() => handleSaveWithCategory('open')}>Open Out</button>
              <button onClick={() => handleSaveWithCategory('double')}>Double Out</button>
              <button onClick={() => handleSaveWithCategory('master')}>Master Out</button>
              <button onClick={() => handleSaveWithCategory('double_separate')}>Double Out (Bull Separate)</button>
            </div>
            <button className="modal-cancel" onClick={() => setShowSaveDialog(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from 'react';
import DartBoard from './DartBoard';
import ThrowDisplay from './ThrowDisplay';
import { ThrowResult, ArrangementCategory } from '../types';
import { throwsTotal } from '../utils/dartUtils';
import './CalculatorMode.css';

interface CalculatorModeProps {
  onSave: (score: number, throws: (ThrowResult | null)[], category: ArrangementCategory) => void;
}

export default function CalculatorMode({ onSave }: CalculatorModeProps) {
  const [throws, setThrows] = useState<(ThrowResult | null)[]>([null, null, null]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const total = throwsTotal(throws);
  const hasThrows = throws.some(t => t !== null);

  const handleThrow = useCallback((result: ThrowResult) => {
    setThrows(prev => {
      const next = [...prev] as (ThrowResult | null)[];
      next[selectedIndex] = result;
      if (selectedIndex < 2) {
        const nextEmpty = next.slice(selectedIndex + 1).findIndex(t => t === null);
        if (nextEmpty !== -1) setSelectedIndex(selectedIndex + 1 + nextEmpty);
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

  function handleSaveWithCategory(category: ArrangementCategory) {
    onSave(total, throws, category);
    setShowSaveDialog(false);
  }

  return (
    <div className="calculator-mode">
      <div className="calc-total">
        <span className="calc-total-label">合計</span>
        <span className="calc-total-value">{total}</span>
        <span className="calc-total-unit">点</span>
      </div>

      <DartBoard onThrow={handleThrow} />

      <ThrowDisplay
        throws={throws}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        onDelete={handleDelete}
        onDeleteSingle={handleDeleteSingle}
      />

      {hasThrows && (
        <button className="save-btn-calc" onClick={() => setShowSaveDialog(true)}>
          Save
        </button>
      )}

      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>アレンジ表に保存</h3>
            <p>どのアレンジ表に保存しますか？</p>
            <div className="modal-buttons">
              <button onClick={() => handleSaveWithCategory('open')}>Open Out</button>
              <button onClick={() => handleSaveWithCategory('double')}>Double Out</button>
              <button onClick={() => handleSaveWithCategory('master')}>Master Out</button>
              <button onClick={() => handleSaveWithCategory('double_separate')}>Double Out (Bull Separate)</button>
            </div>
            <button className="modal-cancel" onClick={() => setShowSaveDialog(false)}>キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}

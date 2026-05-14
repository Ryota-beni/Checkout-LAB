import { ThrowResult } from '../types';
import './ThrowDisplay.css';

interface ThrowDisplayProps {
  throws: (ThrowResult | null)[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onDelete: () => void;
  onDeleteSingle: (index: number) => void;
}

export default function ThrowDisplay({ throws, selectedIndex, onSelectIndex, onDelete, onDeleteSingle }: ThrowDisplayProps) {
  return (
    <div className="throw-display">
      <div className="throw-slots">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`throw-slot${selectedIndex === i ? ' selected' : ''}${throws[i] ? ' has-value' : ''}`}
            onClick={() => onSelectIndex(i)}
          >
            {throws[i] && (
              <button
                className="slot-delete-btn"
                onClick={e => { e.stopPropagation(); onDeleteSingle(i); }}
              >×</button>
            )}
            <span className="throw-label">{i + 1}本目</span>
            <span className="throw-value">{throws[i]?.display ?? '—'}</span>
            {throws[i] && (
              <span className="throw-score">{throws[i]!.score}点</span>
            )}
          </div>
        ))}
      </div>
      <button className="delete-btn" onClick={onDelete}>全削除</button>
    </div>
  );
}

import { useState } from 'react';
import { ArrangementEntry, ArrangementCategory } from '../types';
import './ArrangementTable.css';

interface ArrangementTableProps {
  entries: ArrangementEntry[];
  onDelete: (id: string) => void;
}

const CATEGORIES: { key: ArrangementCategory; label: string }[] = [
  { key: 'open', label: 'Open Out' },
  { key: 'double', label: 'Double Out' },
  { key: 'master', label: 'Master Out' },
  { key: 'double_separate', label: 'Double Out\n(Bull Separate)' },
];

export default function ArrangementTable({ entries, onDelete }: ArrangementTableProps) {
  const [activeCategory, setActiveCategory] = useState<ArrangementCategory>('open');

  const filtered = entries
    .filter(e => e.category === activeCategory)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="arrangement-table">
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`cat-tab${activeCategory === cat.key ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No arrangements saved yet</p>
          <p className="empty-hint">Hit Save in Practice or Calculator mode to add one</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="arrange-table">
            <thead>
              <tr>
                <th>Score</th>
                <th>1st</th>
                <th>2nd</th>
                <th>3rd</th>
                <th>Left</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td className="score-cell">{entry.score}</td>
                  <td className="dart-cell">{entry.dart1 || '—'}</td>
                  <td className="dart-cell">{entry.dart2 || '—'}</td>
                  <td className="dart-cell">{entry.dart3 || '—'}</td>
                  <td className="left-cell">
                    {entry.left !== null && entry.left !== 0 ? entry.left : ''}
                  </td>
                  <td>
                    <button className="delete-entry-btn" onClick={() => onDelete(entry.id)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

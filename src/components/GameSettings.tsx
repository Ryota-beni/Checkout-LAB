import { GameSettings as GameSettingsType, BullMode, OutMode } from '../types';
import './GameSettings.css';

interface GameSettingsProps {
  settings: GameSettingsType;
  onChange: (settings: GameSettingsType) => void;
}

export default function GameSettings({ settings, onChange }: GameSettingsProps) {
  return (
    <div className="game-settings">
      <div className="settings-group">
        <label>Bull</label>
        <div className="toggle-group">
          {(['fat', 'separate'] as BullMode[]).map(mode => (
            <button
              key={mode}
              className={`toggle-btn${settings.bullMode === mode ? ' active' : ''}`}
              onClick={() => onChange({ ...settings, bullMode: mode })}
            >
              {mode === 'fat' ? 'Fat BULL' : 'Separate BULL'}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-group">
        <label>Out</label>
        <div className="toggle-group">
          {(['open', 'double', 'master'] as OutMode[]).map(mode => (
            <button
              key={mode}
              className={`toggle-btn${settings.outMode === mode ? ' active' : ''}`}
              onClick={() => onChange({ ...settings, outMode: mode })}
            >
              {mode === 'open' ? 'Open Out' : mode === 'double' ? 'Double Out' : 'Master Out'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

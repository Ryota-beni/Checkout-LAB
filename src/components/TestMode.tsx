import { useState, useCallback, useEffect } from 'react';
import DartBoard from './DartBoard';
import ThrowDisplay from './ThrowDisplay';
import GameSettings from './GameSettings';
import { ThrowResult, GameSettings as GameSettingsType } from '../types';
import { throwsTotal, isValidFinish, generateTestQuestions } from '../utils/dartUtils';
import './TestMode.css';

export default function TestMode() {
  const [settings, setSettings] = useState<GameSettingsType>({ bullMode: 'fat', outMode: 'double' });
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<number[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [throws, setThrows] = useState<(ThrowResult | null)[]>([null, null, null]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [gameFinished, setGameFinished] = useState(false);

  const currentScore = questions[questionIndex] ?? 0;

  // 合計がちょうど一致 or 3本全部入った瞬間に自動判定
  useEffect(() => {
    if (!gameStarted || answered) return;
    const total = throwsTotal(throws);
    const allFilled = throws.every(t => t !== null);

    if (total === currentScore) {
      const valid = isValidFinish(throws, currentScore, settings.outMode, settings.bullMode);
      setCorrect(valid);
      setAnswered(true);
    } else if (total > currentScore || allFilled) {
      setCorrect(false);
      setAnswered(true);
    }
  }, [throws, gameStarted, answered, currentScore, settings]);

  function startGame() {
    const qs = generateTestQuestions(settings.outMode, settings.bullMode);
    setQuestions(qs);
    setQuestionIndex(0);
    setThrows([null, null, null]);
    setSelectedIndex(0);
    setAnswered(false);
    setResults([]);
    setGameStarted(true);
    setGameFinished(false);
  }

  const handleThrow = useCallback((result: ThrowResult) => {
    if (answered) return;
    setThrows(prev => {
      const next = [...prev] as (ThrowResult | null)[];
      next[selectedIndex] = result;
      if (selectedIndex < 2) {
        const nextEmpty = next.slice(selectedIndex + 1).findIndex(t => t === null);
        if (nextEmpty !== -1) setSelectedIndex(selectedIndex + 1 + nextEmpty);
      }
      return next;
    });
  }, [selectedIndex, answered]);

  function handleDelete() {
    if (answered) return;
    setThrows([null, null, null]);
    setSelectedIndex(0);
  }

  function handleDeleteSingle(index: number) {
    if (answered) return;
    setThrows(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setSelectedIndex(index);
  }

  function handleNext() {
    const newResults = [...results, correct];
    setResults(newResults);
    if (questionIndex + 1 >= questions.length) {
      setGameFinished(true);
    } else {
      setQuestionIndex(i => i + 1);
      setThrows([null, null, null]);
      setSelectedIndex(0);
      setAnswered(false);
    }
  }

  if (!gameStarted) {
    return (
      <div className="test-mode">
        <GameSettings settings={settings} onChange={setSettings} />
        <button className="start-btn" onClick={startGame}>Start Game</button>
      </div>
    );
  }

  if (gameFinished) {
    const score = results.filter(Boolean).length;
    return (
      <div className="test-mode">
        <h2 className="test-title">Results</h2>
        <div className="final-score">
          <span className="final-score-num">{score}</span>
          <span className="final-score-den">/ {results.length}</span>
        </div>
        <div className="result-list">
          {results.map((r, i) => (
            <div key={i} className={`result-item ${r ? 'correct' : 'wrong'}`}>
              Q{i + 1}: {questions[i]} — {r ? '✓ Correct' : '✗ Wrong'}
            </div>
          ))}
        </div>
        <button className="start-btn" onClick={() => setGameStarted(false)}>Change Settings</button>
        <button className="start-btn secondary" onClick={startGame}>Try Again</button>
      </div>
    );
  }

  const total = throwsTotal(throws);

  return (
    <div className="test-mode">
      <div className="question-header">
        <span className="question-num">Q{questionIndex + 1} / {questions.length}</span>
        <div className="progress-dots">
          {questions.map((_, i) => (
            <span key={i} className={`dot${i < results.length ? (results[i] ? ' correct' : ' wrong') : ''}${i === questionIndex ? ' current' : ''}`} />
          ))}
        </div>
      </div>

      <div className="question-score">
        <span className="question-label">Can you finish?</span>
        <span className="question-num-big">{currentScore}</span>
      </div>

      {answered && (
        <div className={`answer-result ${correct ? 'correct' : 'wrong'}`}>
          {correct ? '✓ Correct!' : '✗ Wrong'}
          <div className="answer-detail">
            Total: {total}
            {!correct && total === currentScore && <span> (out condition not met)</span>}
            {!correct && total > currentScore && <span> (over)</span>}
            {!correct && total < currentScore && <span> (not enough)</span>}
          </div>
        </div>
      )}

      <DartBoard onThrow={handleThrow} disabled={answered} bullMode={settings.bullMode} />

      <ThrowDisplay
        throws={throws}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        onDelete={handleDelete}
        onDeleteSingle={handleDeleteSingle}
      />

      {answered && (
        <button className="next-btn" onClick={handleNext}>
          {questionIndex + 1 < questions.length ? 'Next →' : 'See Results'}
        </button>
      )}
    </div>
  );
}

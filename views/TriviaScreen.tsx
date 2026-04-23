import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Club, OnboardingState } from '../types';

const API_BASE = 'https://footnfts.up.railway.app/api';

interface TriviaScreenProps {
  club: Club;
  onboarding: OnboardingState;
  onBack: () => void;
  onEarn: (amount: number, reason: string) => void;
  onComplete?: () => void;
  backendUserId?: string | null;
}

const TriviaScreen: React.FC<TriviaScreenProps> = ({ club, onboarding, onBack, onEarn, onComplete, backendUserId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isDailyLocked, setIsDailyLocked] = useState(false);
  const [cannotPlay, setCannotPlay] = useState(false);
  const [alreadyPlayedMessage, setAlreadyPlayedMessage] = useState('');
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentQuestion = questions[currentStep];

  const updateCountdown = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
  };

  // Check if user can play trivia today
  useEffect(() => {
    const checkCanPlay = async () => {
      if (!backendUserId) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/trivia/can-play?userId=${backendUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (!data.canPlay) {
          setCannotPlay(true);
          setAlreadyPlayedMessage(data.message || 'You have already completed today\'s trivia! Come back tomorrow.');
          setLoading(false);
          return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const lastCompleted = localStorage.getItem('trivia_last_completed_date');
        
        if (lastCompleted === today) {
          setIsDailyLocked(true);
          updateCountdown();
          setLoading(false);
          return;
        }
        
        await loadQuestions();
        
      } catch (error) {
        console.error('Failed to check trivia status:', error);
        setError(true);
        setLoading(false);
      }
    };
    
    checkCanPlay();
  }, [backendUserId]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(false);
    
    try {
      console.log('🔒 Locking trivia for today...');
      const completeResponse = await fetch(`${API_BASE}/trivia/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: backendUserId })
      });
      
      if (!completeResponse.ok) {
        console.error('Failed to lock trivia');
      } else {
        console.log('✅ Trivia locked for today');
      }
      
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('trivia_last_completed_date', today);
      
      const generatedQuestions = [];
      
      for (let i = 0; i < 5; i++) {
        const response = await fetch(`${API_BASE}/trivia/question`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (!data.success || !data.question) {
          throw new Error('Failed to generate question from backend');
        }
        
        generatedQuestions.push({
          id: data.question.id,
          question: data.question.question,
          options: data.question.options,
          correct: data.question.correctAnswer,
          fact: data.question.fact
        });
        
        if (i < 4) await new Promise(r => setTimeout(r, 500));
      }
      
      setQuestions(generatedQuestions);
      
    } catch (err) {
      console.error('Failed to generate questions:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDailyLocked) {
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [isDailyLocked]);

  const handleOptionSelect = async (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    const isCorrect = index === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/user/add-ftc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: backendUserId,
            amount: 10,
            reason: 'trivia_correct'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          onEarn(10, 'trivia_correct');
        }
      } catch (error) {
        console.error('Failed to award FTC:', error);
        onEarn(10, 'trivia_correct');
      }
    } else {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/user/add-ftc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: backendUserId,
            amount: 2,
            reason: 'trivia_participation'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          onEarn(2, 'trivia_participation');
        }
      } catch (error) {
        console.error('Failed to award FTC:', error);
        onEarn(2, 'trivia_participation');
      }
    }
  };

  const nextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (onComplete) onComplete();
    }
  };

  // Already played today screen
  if (cannotPlay) {
    return (
      <div className="trivia-root">
        <style>{TRIVIA_STYLES}</style>
        <div className="trivia-header">
          <button onClick={onBack} className="trivia-back-btn">←</button>
          <span className="trivia-title">Daily Trivia IQ</span>
          <div className="trivia-placeholder" />
        </div>
        <div className="trivia-locked">
          <div className="trivia-locked-icon">🔒</div>
          <h3 className="trivia-locked-title">Already Played Today</h3>
          <p className="trivia-locked-text">{alreadyPlayedMessage}</p>
          <div className="trivia-locked-card">
            <span>Next Trivia Available</span>
            <span className="trivia-countdown">{timeUntilReset || 'Tomorrow at 00:00 UTC'}</span>
          </div>
          <button className="trivia-back-btn-large" onClick={onBack}>Back to Arena</button>
        </div>
      </div>
    );
  }

  // Daily locked screen
  if (isDailyLocked) {
    return (
      <div className="trivia-root">
        <style>{TRIVIA_STYLES}</style>
        <div className="trivia-header">
          <button onClick={onBack} className="trivia-back-btn">←</button>
          <span className="trivia-title">Daily Trivia IQ</span>
          <div className="trivia-placeholder" />
        </div>
        <div className="trivia-locked">
          <div className="trivia-locked-icon">🔒</div>
          <h3 className="trivia-locked-title">Today's IQ Task Complete</h3>
          <p className="trivia-locked-text">You've already claimed your daily trivia reward. Come back tomorrow for a fresh set of challenges.</p>
          <div className="trivia-locked-card">
            <span>Next Daily Unlock</span>
            <span className="trivia-countdown">{timeUntilReset}</span>
          </div>
          <button className="trivia-back-btn-large" onClick={onBack}>Back to Arena</button>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="trivia-root">
        <style>{TRIVIA_STYLES}</style>
        <div className="trivia-header">
          <button onClick={onBack} className="trivia-back-btn">←</button>
          <span className="trivia-title">Daily Trivia IQ</span>
          <div className="trivia-placeholder" />
        </div>
        <div className="trivia-loading">
          <div className="trivia-spinner" />
          <p>Preparing your daily trivia...</p>
          <span>Powered by AI</span>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="trivia-root">
        <style>{TRIVIA_STYLES}</style>
        <div className="trivia-header">
          <button onClick={onBack} className="trivia-back-btn">←</button>
          <span className="trivia-title">Daily Trivia IQ</span>
          <div className="trivia-placeholder" />
        </div>
        <div className="trivia-error">
          <div className="trivia-error-icon">⚠️</div>
          <h3>Unable to load questions</h3>
          <p>The AI service is temporarily unavailable. Please try again.</p>
          <button className="trivia-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    const totalEarned = (score * 10) + ((questions.length - score) * 2);
    return (
      <div className="trivia-root">
        <style>{TRIVIA_STYLES}</style>
        <div className="trivia-header">
          <button onClick={onBack} className="trivia-back-btn">←</button>
          <span className="trivia-title">Daily Trivia IQ</span>
          <div className="trivia-placeholder" />
        </div>
        <div className="trivia-result">
          <div className="trivia-result-icon">🏆</div>
          <h2 className="trivia-result-title">Daily Quiz Complete!</h2>
          <p className="trivia-result-subtitle">You showed true football IQ today.</p>
          <div className="trivia-result-stats">
            <div className="trivia-result-stat">
              <span>Score</span>
              <strong>{score}/{questions.length}</strong>
            </div>
            <div className="trivia-result-stat">
              <span>Earned</span>
              <strong>{totalEarned} FTC</strong>
            </div>
          </div>
          <div className="trivia-result-next">
            <span>Next Trivia</span>
            <span>Tomorrow at 00:00 UTC</span>
          </div>
          <button className="trivia-back-btn-large" onClick={onBack}>Return to Arena</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="trivia-root">
      <style>{TRIVIA_STYLES}</style>
      
      {/* Header */}
      <div className="trivia-header">
        <button onClick={onBack} className="trivia-back-btn">←</button>
        <span className="trivia-title">Daily Trivia IQ</span>
        <div className="trivia-progress-badge">{currentStep + 1}/{questions.length}</div>
      </div>
      
      {/* Progress Bar */}
      <div className="trivia-progress-bar">
        <div 
          className="trivia-progress-fill"
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="trivia-question-container">
        <h3 className="trivia-question">{currentQuestion?.question}</h3>

        {/* Options */}
        <div className="trivia-options">
          {currentQuestion?.options.map((option: string, idx: number) => {
            let optionClass = "trivia-option";
            if (isAnswered) {
              if (idx === currentQuestion.correct) {
                optionClass = "trivia-option correct";
              } else if (idx === selectedOption) {
                optionClass = "trivia-option wrong";
              } else {
                optionClass = "trivia-option disabled";
              }
            } else if (selectedOption === idx) {
              optionClass = "trivia-option selected";
            }

            return (
              <button 
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={optionClass}
              >
                <span>{String.fromCharCode(65 + idx)}. {option}</span>
                {isAnswered && idx === currentQuestion.correct && (
                  <span className="trivia-option-check">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Fact Card */}
        {isAnswered && (
          <div className="trivia-fact">
            <span>📖 Did you know?</span>
            <p>{currentQuestion?.fact}</p>
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <button className="trivia-next-btn" onClick={nextQuestion}>
            {currentStep < questions.length - 1 ? 'Next Question →' : 'Finish Quiz →'}
          </button>
        )}
      </div>
    </div>
  );
};

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const TRIVIA_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap');

  .trivia-root {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: #0d0d0d;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
    z-index: 100;
  }

  /* Header */
  .trivia-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: #111827;
    border-bottom: 1px solid #1f2937;
  }
  .trivia-back-btn {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    text-align: left;
  }
  .trivia-title {
    font-family: 'Oxanium', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: #fff;
    letter-spacing: 0.05em;
  }
  .trivia-placeholder {
    width: 32px;
  }
  .trivia-progress-badge {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #22c55e;
    background: rgba(34,197,94,0.1);
    padding: 4px 8px;
    border-radius: 20px;
    border: 1px solid rgba(34,197,94,0.3);
  }

  /* Progress Bar */
  .trivia-progress-bar {
    flex-shrink: 0;
    height: 3px;
    background: #1f2937;
    width: 100%;
  }
  .trivia-progress-fill {
    height: 100%;
    background: #22c55e;
    transition: width 0.3s ease;
  }

  /* Question Container */
  .trivia-question-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Question Text */
  .trivia-question {
    font-family: 'Oxanium', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: #fff;
    line-height: 1.4;
    margin: 0;
  }

  /* Options */
  .trivia-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .trivia-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 12px;
    text-align: left;
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #f3f4f6;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .trivia-option:hover:not(:disabled) {
    border-color: #22c55e;
    background: rgba(34,197,94,0.1);
  }
  .trivia-option.selected {
    border-color: #22c55e;
    background: rgba(34,197,94,0.15);
  }
  .trivia-option.correct {
    border-color: #22c55e;
    background: rgba(34,197,94,0.2);
    color: #4ade80;
  }
  .trivia-option.wrong {
    border-color: #ef4444;
    background: rgba(239,68,68,0.1);
    color: #f87171;
  }
  .trivia-option.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .trivia-option-check {
    color: #22c55e;
    font-size: 16px;
    font-weight: bold;
  }

  /* Fact Card */
  .trivia-fact {
    background: rgba(34,197,94,0.08);
    border-left: 3px solid #22c55e;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
  }
  .trivia-fact span {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    color: #22c55e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 4px;
  }
  .trivia-fact p {
    font-family: 'Rajdhani', sans-serif;
    font-size: 12px;
    color: #9ca3af;
    margin: 0;
    line-height: 1.4;
  }

  /* Next Button */
  .trivia-next-btn {
    width: 100%;
    padding: 14px;
    background: #22c55e;
    border: none;
    border-radius: 30px;
    font-family: 'Oxanium', sans-serif;
    font-weight: 800;
    font-size: 14px;
    color: #000;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.2s ease;
  }
  .trivia-next-btn:active {
    transform: scale(0.98);
    background: #16a34a;
  }

  /* Locked / Loading / Error States */
  .trivia-locked, .trivia-loading, .trivia-error, .trivia-result {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    gap: 16px;
  }
  .trivia-locked-icon {
    width: 80px;
    height: 80px;
    background: #1f2937;
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }
  .trivia-locked-title, .trivia-result-title {
    font-family: 'Oxanium', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #fff;
    margin: 0;
  }
  .trivia-locked-text, .trivia-result-subtitle {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
    max-width: 280px;
  }
  .trivia-locked-card {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 16px;
    padding: 12px 20px;
    width: 100%;
    max-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .trivia-locked-card span:first-child {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #22c55e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .trivia-countdown {
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }
  .trivia-back-btn-large {
    padding: 12px 24px;
    background: #374151;
    border: none;
    border-radius: 30px;
    font-family: 'Oxanium', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: #fff;
    cursor: pointer;
    margin-top: 8px;
  }
  .trivia-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #22c55e;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .trivia-loading p {
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
  }
  .trivia-loading span {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #4b5563;
  }
  .trivia-error-icon {
    font-size: 48px;
  }
  .trivia-error h3 {
    font-family: 'Oxanium', sans-serif;
    font-size: 18px;
    color: #fff;
    margin: 0;
  }
  .trivia-error p {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
  }
  .trivia-retry-btn {
    padding: 10px 24px;
    background: #22c55e;
    border: none;
    border-radius: 30px;
    font-family: 'Oxanium', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: #000;
    cursor: pointer;
    margin-top: 8px;
  }
  .trivia-result-icon {
    width: 80px;
    height: 80px;
    background: #22c55e;
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }
  .trivia-result-stats {
    display: flex;
    gap: 16px;
    margin: 16px 0;
  }
  .trivia-result-stat {
    background: #1f2937;
    border-radius: 16px;
    padding: 12px 20px;
    text-align: center;
    min-width: 100px;
  }
  .trivia-result-stat span {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #6b7280;
    text-transform: uppercase;
    display: block;
  }
  .trivia-result-stat strong {
    font-family: 'Oxanium', sans-serif;
    font-size: 20px;
    color: #22c55e;
    display: block;
    margin-top: 4px;
  }
  .trivia-result-next {
    background: rgba(34,197,94,0.08);
    border-radius: 16px;
    padding: 12px 20px;
    text-align: center;
    width: 100%;
    max-width: 260px;
  }
  .trivia-result-next span:first-child {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #22c55e;
    text-transform: uppercase;
    display: block;
  }
  .trivia-result-next span:last-child {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #fff;
    display: block;
    margin-top: 4px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default TriviaScreen;
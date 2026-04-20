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
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentQuestion = questions[currentStep];

  // Check if daily trivia is locked
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = localStorage.getItem('trivia_last_completed_date');
    
    if (lastCompleted === today) {
      setIsDailyLocked(true);
      updateCountdown();
    }
    
    // Generate NEW questions from BACKEND only
    const loadQuestions = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const generatedQuestions = [];
        
        // Generate 5 questions from backend Groq API
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
          
          // Small delay between requests
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
    
    if (!isDailyLocked) {
      loadQuestions();
    }
  }, []);

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
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('trivia_last_completed_date', today);
      setShowResult(true);
      if (onComplete) onComplete();
    }
  };

  // Locked screen
  if (isDailyLocked) {
    return (
      <div className="flex flex-col h-full bg-darkBg animate-in fade-in duration-500 overflow-hidden">
        <div className="bg-darkCard px-6 pt-12 pb-6 border-b border-gray-800 flex items-center justify-between sticky top-0 z-20">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-black text-white">Daily Trivia IQ</h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
           <div className="w-32 h-32 bg-darkDeep rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 relative border border-gray-800">
              🔒
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-black border-4 border-darkBg shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
           </div>
           <h3 className="text-2xl font-black text-white mb-2">Today's IQ Task Complete</h3>
           <p className="text-sm text-gray-400 mb-4 leading-relaxed">
             You've already claimed your daily trivia reward. Come back tomorrow for a fresh set of challenges.
           </p>
           <div className="w-full space-y-4">
             <Card className="bg-green-950/20 border border-green-500/30 p-5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-500">
                 <span>Next Daily Unlock</span>
                 <span className="font-mono">{timeUntilReset}</span>
               </div>
               <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: '100%' }}></div>
               </div>
             </Card>
             <Button onClick={onBack}>Back to Fan Arena</Button>
           </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-darkBg animate-in fade-in duration-500 overflow-hidden">
        <div className="bg-darkCard px-6 pt-12 pb-6 border-b border-gray-800 flex items-center justify-between sticky top-0 z-20">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-black text-white">Daily Trivia IQ</h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-gray-400">Generating fresh football questions...</p>
          <p className="text-xs text-gray-600 mt-2">Powered by AI</p>
        </div>
      </div>
    );
  }

  // Error screen - NO FALLBACK, just retry
  if (error) {
    return (
      <div className="flex flex-col h-full bg-darkBg animate-in fade-in duration-500 overflow-hidden">
        <div className="bg-darkCard px-6 pt-12 pb-6 border-b border-gray-800 flex items-center justify-between sticky top-0 z-20">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-black text-white">Daily Trivia IQ</h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-black text-white mb-2">Unable to load questions</h3>
          <p className="text-sm text-gray-400 mb-6">The AI service is temporarily unavailable. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    return (
      <div className="flex flex-col h-full bg-darkBg px-6 pt-20 pb-10 animate-in zoom-in duration-500">
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-green-600 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-2xl animate-bounce">
            🏆
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Daily Quiz Complete!</h2>
          <p className="text-gray-400 font-medium mb-8">You showed true football IQ today.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <Card className="p-6 bg-darkDeep border border-gray-800">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Score</p>
              <p className="text-3xl font-black text-white">{score}/{questions.length}</p>
            </Card>
            <Card className="p-6 bg-green-950/20 border border-green-500/30">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Earned</p>
              <p className="text-3xl font-black text-green-500">{(score * 10) + ((questions.length - score) * 2)} FTC</p>
            </Card>
          </div>
          
          <div className="bg-darkDeep rounded-xl p-4 mb-6 border border-gray-800 w-full">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Next Trivia</p>
            <p className="text-sm text-white font-mono">Tomorrow at 00:00 UTC</p>
          </div>
        </div>
        <Button onClick={onBack}>Return to Arena</Button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col h-full bg-darkBg animate-in slide-in-from-right-10 duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-darkCard px-6 pt-12 pb-4 border-b border-gray-800 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Question {currentStep + 1} of {questions.length}</span>
          </div>
          <div className="w-6"></div>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600 transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col no-scrollbar">
        <h3 className="text-2xl font-black text-white mb-8 leading-tight">
          {currentQuestion?.question}
        </h3>

        <div className="space-y-4 flex-1">
          {currentQuestion?.options.map((option: string, idx: number) => {
            let stateClass = "bg-darkCard border border-gray-800 text-white";
            if (isAnswered) {
              if (idx === currentQuestion.correct) {
                stateClass = "bg-green-950/30 border-green-500 text-green-400";
              } else if (idx === selectedOption) {
                stateClass = "bg-red-950/30 border-red-500 text-red-400";
              } else {
                stateClass = "bg-darkCard border border-gray-800 text-gray-500 opacity-60";
              }
            } else if (selectedOption === idx) {
              stateClass = "border-green-500 ring-1 ring-green-500 bg-darkCard";
            }

            return (
              <button 
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.99] flex items-center justify-between ${stateClass}`}
              >
                <span className={`font-bold ${isAnswered && idx === currentQuestion.correct ? 'text-green-400' : ''}`}>
                  {option}
                </span>
                {isAnswered && idx === currentQuestion.correct && (
                   <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 animate-in slide-in-from-bottom-4">
            <Card className="bg-green-950/20 border border-green-500/30 p-5 mb-6">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Did you know?</p>
              <p className="text-xs text-green-400 font-medium leading-relaxed">{currentQuestion?.fact}</p>
            </Card>
            <Button onClick={nextQuestion}>
              {currentStep < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaScreen;
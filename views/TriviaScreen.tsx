import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Club, OnboardingState } from '../types';

interface TriviaScreenProps {
  club: Club;
  onboarding: OnboardingState;
  onBack: () => void;
  onEarn: (amount: number) => void;
  onComplete?: () => void;
}

const ALL_QUESTIONS = [
  { id: 1, question: "Which player has won the most Ballon d'Or awards in history?", options: ["Cristiano Ronaldo", "Lionel Messi", "Michel Platini", "Johan Cruyff"], correct: 1, fact: "Lionel Messi has won a record 8 Ballon d'Or awards." },
  { id: 2, question: "Which country has won the most FIFA World Cup titles?", options: ["Germany", "Italy", "Argentina", "Brazil"], correct: 3, fact: "Brazil has won the World Cup 5 times (1958, 1962, 1970, 1994, 2002)." },
  { id: 3, question: "In which year was the first ever Premier League season?", options: ["1988/89", "1990/91", "1992/93", "1994/95"], correct: 2, fact: "The Premier League was founded on February 20, 1992." },
  { id: 4, question: "Who is the all-time top scorer in the UEFA Champions League?", options: ["Lionel Messi", "Robert Lewandowski", "Cristiano Ronaldo", "Karim Benzema"], correct: 2, fact: "Cristiano Ronaldo holds the record for most UCL goals." },
  { id: 5, question: "Which club has won the most UEFA Champions League titles?", options: ["AC Milan", "Bayern Munich", "Liverpool", "Real Madrid"], correct: 3, fact: "Real Madrid has won an incredible 14 (now 15) titles." },
  { id: 6, question: "What is the nicknames of the Belgian national football team?", options: ["The Red Devils", "The Lions", "The Eagles", "The Blues"], correct: 0, fact: "They are known globally as the Red Devils." },
  { id: 7, question: "Who was the first ever host of the FIFA World Cup in 1930?", options: ["Brazil", "Uruguay", "France", "Italy"], correct: 1, fact: "Uruguay hosted and won the first World Cup." },
  { id: 8, question: "Which player is famously known as 'The Phenomenon'?", options: ["Ronaldinho", "Pelé", "Ronaldo Nazário", "Romário"], correct: 2, fact: "Ronaldo Nazário is the original 'O Fenômeno'." },
  { id: 9, question: "Which stadium is known as 'The Theatre of Dreams'?", options: ["Anfield", "Wembley", "Old Trafford", "Etihad"], correct: 2, fact: "Sir Bobby Charlton famously gave Old Trafford this nickname." },
  { id: 10, question: "Which manager famously won the 'Treble' with Manchester United in 1999?", options: ["Sir Alex Ferguson", "Matt Busby", "Jose Mourinho", "Arsene Wenger"], correct: 0, fact: "Sir Alex Ferguson led them to Premier League, FA Cup, and UCL glory." },
];

const TriviaScreen: React.FC<TriviaScreenProps> = ({ club, onboarding, onBack, onEarn, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isDailyLocked, setIsDailyLocked] = useState(false);
  const [questions, setQuestions] = useState<typeof ALL_QUESTIONS>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (onboarding.lastTriviaDate === today) {
      setIsDailyLocked(true);
    }

    const seed = today.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...ALL_QUESTIONS].sort((a, b) => {
      return (seed * a.id) % 11 - (seed * b.id) % 11;
    });
    setQuestions(shuffled.slice(0, 4));
  }, [onboarding.lastTriviaDate]);

  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === currentQuestion.correct) {
      setScore(prev => prev + 1);
      onEarn(5);
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
           <p className="text-sm text-gray-400 mb-8 leading-relaxed">
             You've already claimed your daily trivia reward. The locker room is resting. Come back tomorrow for a fresh set of challenges.
           </p>
           <div className="w-full space-y-4">
             <Card className="bg-green-950/20 border border-green-500/30 p-5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-500">
                 <span>Next Daily Unlock</span>
                 <span>00:00 UTC</span>
               </div>
               <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-[75%] animate-pulse"></div>
               </div>
             </Card>
             <Button onClick={onBack}>Back to Fan Arena</Button>
           </div>
        </div>
      </div>
    );
  }

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
              <p className="text-3xl font-black text-green-500">{score * 5} FTC</p>
            </Card>
          </div>
          
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-10">
            Tomorrow's Trivia Locked 🔒
          </p>
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
          {currentQuestion?.options.map((option, idx) => {
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
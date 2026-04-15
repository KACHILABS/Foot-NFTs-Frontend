
import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { UserProfile } from '../types';

interface FanPodScreenProps {
  profile: UserProfile | null;
  onBack: () => void;
  onEarn: (amount: number) => void;
}

const FanPodScreen: React.FC<FanPodScreenProps> = ({ profile, onBack, onEarn }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const startRecording = () => {
    setIsRecording(true);
    // Simulation of recording for 5 seconds
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 5000);
  };

  const handleUpload = () => {
    setIsUploading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setShowSuccess(true);
        onEarn(25); // Significant reward for sharing a personal story
      }
    }, 300);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-darkBg px-6 pt-20 pb-10 animate-in zoom-in duration-500 text-center">
        <div className="w-32 h-32 gradient-primary rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-2xl animate-bounce mx-auto">
          💝
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Story Shared!</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
          Your voice matters. Thank you for sharing how the beautiful game has impacted your life.
        </p>
        
        <Card className="p-6 bg-orange-50 dark:bg-orange-950/20 border-none mb-10">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Impact Reward</p>
          <p className="text-3xl font-black text-orange-600">+25 FTC</p>
        </Card>

        <div className="mt-auto">
          <Button onClick={onBack}>Return to Arena</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-darkBg animate-in slide-in-from-right-10 duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-darkCard px-6 pt-12 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Fan Pod</h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Share Your Voice • Earn FTC</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/20 rounded-2xl flex items-center justify-center text-2xl">
           📹
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {/* Intro */}
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">What has football given you?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Record a short video (up to 30s) sharing how a specific goal, win, or defeat changed your life or taught you something.
          </p>
        </div>

        {/* Recording Interface Simulation */}
        <div className="relative aspect-[4/5] bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center border-4 border-gray-100 dark:border-gray-800">
           {isRecording ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20">
               <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                 <div className="w-16 h-16 bg-red-600 rounded-full"></div>
               </div>
               <p className="text-white font-black text-sm uppercase tracking-widest mt-6 animate-pulse">Recording Story...</p>
               <div className="absolute top-8 left-8 flex items-center gap-2">
                 <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                 <span className="text-white font-black text-xs uppercase">Live</span>
               </div>
             </div>
           ) : hasRecorded ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-4xl mb-4 border border-white/20">
                  ▶️
               </div>
               <p className="text-white font-black text-sm uppercase tracking-widest">Preview Ready</p>
               <button onClick={() => setHasRecorded(false)} className="text-gray-400 text-[10px] font-bold uppercase mt-2">Retake</button>
             </div>
           ) : (
             <div className="flex flex-col items-center text-center px-10">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                 <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                 </svg>
               </div>
               <p className="text-gray-400 text-xs font-medium">Allow camera access to record your fan story.</p>
             </div>
           )}
           
           {isUploading && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
               <div className="w-12 h-12 border-4 border-white/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
               <p className="text-white font-black text-xs uppercase tracking-widest mb-2">Syncing with blockchain...</p>
               <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
               </div>
             </div>
           )}
        </div>

        {/* Action Button */}
        <div className="space-y-4">
           {!hasRecorded ? (
             <Button 
               onClick={startRecording} 
               disabled={isRecording}
               className={isRecording ? 'opacity-50' : ''}
             >
               {isRecording ? 'Capturing Moment...' : 'Start Recording'}
             </Button>
           ) : (
             <Button onClick={handleUpload} disabled={isUploading}>
               Share Your Fan Legacy (+25 FTC)
             </Button>
           )}
           <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center font-bold uppercase tracking-[0.2em] px-4 leading-relaxed">
             By sharing, you agree to feature in the club's digital archive. Stories are encrypted and verified.
           </p>
        </div>
      </div>
    </div>
  );
};

export default FanPodScreen;

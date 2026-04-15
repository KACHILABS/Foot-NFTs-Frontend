import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Club, UserProfile } from '../types';

interface JerseyDayScreenProps {
  club: Club;
  profile: UserProfile | null;
  onBack: () => void;
  onCheckIn: (amount: number) => void;
}

const JerseyDayScreen: React.FC<JerseyDayScreenProps> = ({ club, profile, onBack, onCheckIn }) => {
  const [selectedKit, setSelectedKit] = useState<'home' | 'away' | 'third'>('home');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const kits = [
    { id: 'home', name: 'Home Kit', bgColor: 'bg-white', textColor: 'text-gray-900', icon: '👕', borderColor: 'border-green-500' },
    { id: 'away', name: 'Away Kit', bgColor: 'bg-gray-800', textColor: 'text-white', icon: '👚', borderColor: 'border-gray-600' },
    { id: 'third', name: 'Third Kit', bgColor: 'bg-green-600', textColor: 'text-white', icon: '🎽', borderColor: 'border-green-400' },
  ];

  const handleCheckIn = () => {
    setHasCheckedIn(true);
    onCheckIn(10);
  };

  const selectedKitData = kits.find(k => k.id === selectedKit);

  return (
    <div className="flex flex-col h-full bg-darkBg animate-in slide-in-from-right-10 duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-darkCard px-6 pt-12 pb-6 border-b border-gray-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">Jersey Day</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rep your Colors • Daily</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-green-950/30 rounded-2xl flex items-center justify-center text-2xl">
           👕
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {/* Status Card */}
        <Card className="border border-gray-800 shadow-xl bg-darkDeep text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-2">Today's Objective</p>
            <h3 className="text-2xl font-black mb-2">Wear the {club.name} Colors</h3>
            <p className="text-sm text-gray-400 leading-relaxed pr-8">
              Check-in with your kit today to earn <span className="text-green-500 font-bold">10 FTC</span> and boost your global fan rank.
            </p>
          </div>
        </Card>

        {/* Locker Selection UI */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] px-1">Select Your Kit</p>
          <div className="grid grid-cols-3 gap-4">
            {kits.map((kit) => (
              <button 
                key={kit.id}
                onClick={() => !hasCheckedIn && setSelectedKit(kit.id as any)}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-[2rem] border-2 transition-all duration-300 ${
                  selectedKit === kit.id 
                    ? `${kit.borderColor} bg-darkCard shadow-lg shadow-green-500/20 scale-105` 
                    : 'border-gray-800 bg-darkCard/50 opacity-70'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl ${kit.bgColor} flex items-center justify-center text-3xl shadow-inner border border-gray-700`}>
                   {kit.icon}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-tight ${selectedKit === kit.id ? kit.textColor : 'text-gray-500'}`}>
                  {kit.name}
                </p>
                {selectedKit === kit.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white border-2 border-gray-800">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Preview */}
        <div className="flex justify-center py-4">
          <div className="relative w-48 h-64">
            <div className="absolute inset-0 bg-green-600/10 blur-2xl rounded-full scale-110"></div>
            <Card className={`h-full border border-gray-800 shadow-2xl flex flex-col items-center justify-center p-6 bg-darkCard rounded-[3rem] relative z-10`}>
               <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-10">
                  <img src={club.badge} className="w-24 h-24 grayscale" alt="club-watermark" />
               </div>
               <div className="text-7xl mb-4 drop-shadow-2xl">
                 {selectedKitData?.icon}
               </div>
               <p className={`text-sm font-black ${selectedKitData?.textColor || 'text-white'}`}>{club.name}</p>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">2024/25 Season</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-6 bg-darkCard border-t border-gray-800">
        {!hasCheckedIn ? (
          <Button onClick={handleCheckIn} className="py-5">
            Rep My Kit & Earn 10 FTC
          </Button>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <Card className="bg-green-950/20 border border-green-500/30 p-5 flex items-center justify-center gap-3">
               <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-black">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               <div className="text-left">
                  <p className="text-sm font-black text-green-500 leading-none">Checked In Successfully!</p>
                  <p className="text-[10px] font-bold text-green-400 uppercase mt-1 tracking-widest">+10 FTC Reward Claimed</p>
               </div>
            </Card>
            <Button variant="secondary" onClick={onBack} className="py-4">
               Return to Arena
            </Button>
            <p className="text-[9px] text-gray-500 text-center font-bold uppercase tracking-widest">
              Tap anywhere to close
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JerseyDayScreen;
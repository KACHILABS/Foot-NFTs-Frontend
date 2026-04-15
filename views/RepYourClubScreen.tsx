import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { CLUBS } from '../constants';

interface RepYourClubScreenProps {
  currentClubId: string | null;
  onBack?: () => void;
  onSelect: (clubId: string) => void;
}

const RepYourClubScreen: React.FC<RepYourClubScreenProps> = ({ currentClubId, onSelect }) => {
  const [selected, setSelected] = useState(currentClubId || '');
  const tg = (window as any).Telegram?.WebApp;

  const handleSelect = (id: string) => {
    tg?.HapticFeedback.selectionChanged();
    setSelected(id);
  };

  const activeClub = CLUBS.find(c => c.id === selected);

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8 bg-darkBg animate-in slide-in-from-right-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-white">Rep Your Club</h1>
        <p className="text-gray-400">Lock in your identity and join the ranks.</p>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {activeClub ? (
          <div className="animate-in zoom-in duration-300">
            <Card className="text-center relative overflow-hidden border border-orange-500/30 bg-darkCard">
              <img src={activeClub.badge} className="w-24 h-24 mx-auto mb-4 object-contain" alt={activeClub.name} />
              <h2 className="text-2xl font-black mb-1 text-white">{activeClub.name}</h2>
              <p className="text-orange-500 font-bold mb-4">{activeClub.fanCount.toLocaleString()} fans globally</p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-darkDeep p-3 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Region Rank</p>
                  <p className="font-bold text-white">#42</p>
                </div>
                <div className="bg-darkDeep p-3 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Fan Score</p>
                  <p className="font-bold text-white">1,240</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelected('')}
                className="mt-6 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors py-2"
              >
                Change Club
              </button>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Popular Clubs</p>
               <span className="text-[9px] font-black text-orange-500 uppercase">View All</span>
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4 no-scrollbar">
              {CLUBS.map(club => (
                <button 
                  key={club.id}
                  onClick={() => handleSelect(club.id)}
                  className="flex flex-col items-center p-6 bg-darkCard rounded-3xl border border-gray-800 shadow-sm active:scale-95 transition-all hover:border-orange-500/30"
                >
                  <div className="w-16 h-16 mb-3 flex items-center justify-center">
                    <img src={club.badge} className="max-w-full max-h-full object-contain" alt={club.name} />
                  </div>
                  <p className="font-black text-white text-sm tracking-tight">{club.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button onClick={() => onSelect(selected)} disabled={!selected}>
          Represent {activeClub ? activeClub.name : 'Your Club'}
        </Button>
      </div>
    </div>
  );
};

export default RepYourClubScreen;
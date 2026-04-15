
import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

interface HopeCampaignScreenProps {
  onBack: () => void;
  onEarn: (amount: number) => void;
}

const CAUSES = [
  { id: 'c1', title: 'Unity Through Sport', desc: 'Promoting peaceful community play in conflict zones.', icon: '🌍', progress: 75, goal: '1M FTC' },
  { id: 'c2', title: 'Future Pitch', desc: 'Building sustainable football grounds for underprivileged youth.', icon: '🌱', progress: 42, goal: '500k FTC' },
  { id: 'c3', title: 'Equality Stand', desc: 'Fighting discrimination and fostering inclusion in stadium terraces.', icon: '✊', progress: 90, goal: '250k FTC' },
];

const HopeCampaignScreen: React.FC<HopeCampaignScreenProps> = ({ onBack, onEarn }) => {
  const [pledgedIds, setPledgedIds] = useState<Set<string>>(new Set());
  const [isPledging, setIsPledging] = useState<string | null>(null);

  const handlePledge = (id: string) => {
    if (pledgedIds.has(id)) return;
    setIsPledging(id);
    
    // Simulate pledge recording
    setTimeout(() => {
      setPledgedIds(prev => new Set(prev).add(id));
      setIsPledging(null);
      onEarn(5); // Reward for pledging
    }, 1200);
  };

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
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Hope Campaign</h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Football for Social Good</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl">
           🕊️
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {/* Intro */}
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">The Beautiful Game's Real Power</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-4">
            Join the community in using football's global influence to drive positive change. Pledge your voice to active causes and earn FTC.
          </p>
        </div>

        {/* Causes List */}
        <div className="flex flex-col gap-6">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-[0.2em] px-1">Active Initiatives</p>
          {CAUSES.map((cause) => (
            <Card key={cause.id} className="p-0 overflow-hidden border-none shadow-xl bg-gray-50/50 dark:bg-darkCard/50">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white dark:bg-darkBg rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    {cause.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-gray-900 dark:text-white leading-tight">{cause.title}</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Global Milestone: {cause.goal}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                  {cause.desc}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2 mb-6">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      <span>Community Progress</span>
                      <span className="text-blue-600 dark:text-blue-400">{cause.progress}%</span>
                   </div>
                   <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-1000" 
                        style={{ width: `${cause.progress}%` }}
                      ></div>
                   </div>
                </div>

                <Button 
                  onClick={() => handlePledge(cause.id)}
                  disabled={pledgedIds.has(cause.id) || isPledging === cause.id}
                  variant={pledgedIds.has(cause.id) ? 'outline' : 'primary'}
                  className={`py-3 text-xs ${pledgedIds.has(cause.id) ? 'border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20' : 'bg-blue-600 shadow-blue-100'}`}
                >
                  {isPledging === cause.id ? (
                    <span className="flex items-center gap-2">
                       <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Recording...
                    </span>
                  ) : pledgedIds.has(cause.id) ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Voice Pledged
                    </span>
                  ) : (
                    'Pledge Voice (+5 FTC)'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Banner */}
        <Card className="bg-gray-900 dark:bg-black text-white border-none p-6 text-center">
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Did You Know?</p>
           <p className="text-xs text-gray-300 dark:text-gray-400 font-medium leading-relaxed">
             A portion of every FTC used in our marketplace goes towards supporting the most voted community initiative in the Hope Campaign.
           </p>
        </Card>
        
        <div className="pb-10"></div>
      </div>
    </div>
  );
};

export default HopeCampaignScreen;

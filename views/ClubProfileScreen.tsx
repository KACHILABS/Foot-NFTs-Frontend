import React from 'react';
import { Club, UserProfile } from '../types';
import Card from '../components/Card';
import FanRankBadge from '../components/FanRankBadge';
import Button from '../components/Button';

interface ClubProfileScreenProps {
  club: Club;
  profile: UserProfile | null;
  onSwitch: () => void;
  onEnterChat?: () => void;
}

const ClubProfileScreen: React.FC<ClubProfileScreenProps> = ({ club, profile, onSwitch, onEnterChat }) => {
  const yearsActive = new Date().getFullYear() - club.foundedYear;
  const totalTrophies = club.trophies.league + club.trophies.continental + club.trophies.domestic;

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-darkDeep text-white py-12 px-6 shadow-2xl border border-gray-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600 opacity-20 rounded-full blur-[80px] -translate-y-24 translate-x-24"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-darkCard rounded-[2rem] p-4 mb-5 border border-gray-800 shadow-2xl">
            <img src={club.badge} className="w-full h-full object-contain filter drop-shadow-lg" alt={club.name} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-1 leading-none text-white">{club.name}</h1>
          <p className="text-green-500 font-black text-[10px] tracking-[0.3em] uppercase mb-6 opacity-90">Institutional Legacy • Since {club.foundedYear}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {club.tags.map((tag, i) => (
              <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-darkCard text-gray-300 px-4 py-1.5 rounded-full border border-gray-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Interaction Card */}
      <div className="px-1">
        <Card className="bg-green-600 border-none p-6 text-black flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all" onClick={onEnterChat}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-black">Live Interaction</p>
              <FanRankBadge rank={profile?.fanRank} className="bg-black/20 text-black" />
            </div>
            <h3 className="text-xl font-black leading-tight text-black">Join the Fan Zone</h3>
            <p className="text-xs font-bold opacity-70 mt-1 text-black">Discuss lineups & chat with fans</p>
          </div>
          <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">🏟️</div>
        </Card>
      </div>

      {/* History Card */}
      <div className="px-1">
        <Card className="bg-darkCard border border-gray-800 shadow-sm p-7 leading-relaxed text-gray-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-600 opacity-50"></div>
          <span className="text-4xl text-green-600/30 absolute top-4 right-6 font-serif">“</span>
          <p className="text-sm font-medium italic relative z-10 leading-relaxed pr-4 text-gray-300">{club.historySummary}</p>
        </Card>
      </div>

      {/* Pillars of History */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] px-2">The Pillars of History</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Official Matches */}
          <Card className="p-5 flex flex-col gap-4 border border-gray-800 shadow-sm hover:shadow-md transition-shadow bg-darkCard">
            <div className="w-10 h-10 rounded-xl bg-orange-950/30 flex items-center justify-center text-orange-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{club.totalMatches.toLocaleString()}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Official Matches</p>
            </div>
          </Card>
          
          {/* Years of Legacy */}
          <Card className="p-5 flex flex-col gap-4 border border-gray-800 shadow-sm hover:shadow-md transition-shadow bg-darkCard">
            <div className="w-10 h-10 rounded-xl bg-blue-950/30 flex items-center justify-center text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{yearsActive}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Years of Legacy</p>
            </div>
          </Card>
          
          {/* Major Trophies */}
          <Card className="p-5 flex flex-col gap-4 border border-gray-800 shadow-sm hover:shadow-md transition-shadow bg-darkCard">
            <div className="w-10 h-10 rounded-xl bg-yellow-950/30 flex items-center justify-center text-yellow-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{totalTrophies}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Major Trophies</p>
            </div>
          </Card>
          
          {/* Asset Value */}
          <Card className="p-5 flex flex-col gap-4 border border-gray-800 shadow-sm hover:shadow-md transition-shadow bg-darkCard">
            <div className="w-10 h-10 rounded-xl bg-green-950/30 flex items-center justify-center text-green-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none truncate">{club.valueRange.split(' – ')[0]}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Est. Asset Value</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Market Evaluation */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] px-2">Market Evaluation</p>
        <Card className="bg-darkCard border border-gray-800 p-8 flex flex-col items-center text-center overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-600 opacity-80"></div>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-green-500 mb-3">Institutional Valuation</p>
          <p className="text-3xl font-black text-white tracking-tight">{club.valueRange}</p>
          <div className="mt-6 flex items-center gap-3 px-4 py-2 bg-darkDeep rounded-full border border-gray-800">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Metadata Secured on TON</span>
          </div>
        </Card>
      </div>

      {/* Switch Club Button */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex justify-center px-6">
        <button 
          onClick={onSwitch} 
          className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 hover:text-green-500 transition-all active:scale-95 py-2"
        >
          Affiliate with another institution
        </button>
      </div>
    </div>
  );
};

export default ClubProfileScreen;
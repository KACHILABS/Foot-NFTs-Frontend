import React from 'react';
import Card from '../components/Card';
import { Club } from '../types';
import { CLUBS } from '../constants';

interface ChatLobbyScreenProps {
  onJoinChat: (club: Club) => void;
  onEnterGlobalHall: () => void;  // NEW: prop for entering global banter hall
}

const ChatLobbyScreen: React.FC<ChatLobbyScreenProps> = ({ onJoinChat, onEnterGlobalHall }) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-white tracking-tight">Digital Terraces</h2>
        <p className="text-sm text-gray-400 font-medium">Join any club's chatroom to discuss tactics, transfers, and matchday drama.</p>
      </div>

      <div className="flex flex-col gap-4">
        {CLUBS.map((club) => (
          <Card 
            key={club.id} 
            className="p-5 flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-all active:scale-[0.98] group cursor-pointer"
            onClick={() => onJoinChat(club)}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl p-2.5 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                <img src={club.badge} className="w-full h-full object-contain" alt={club.name} />
              </div>
              <div>
                <h3 className="text-base font-black text-white leading-tight">{club.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {(club.fanCount / 10).toFixed(0)} Fans Online
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden xs:flex flex-col items-end mr-2">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Activity</span>
                <div className="flex gap-0.5 mt-0.5">
                  <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-1 h-2 bg-gray-700 rounded-full self-end"></div>
                </div>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-darkDeep text-white border border-gray-800 p-6 text-center relative overflow-hidden cursor-pointer group" onClick={onEnterGlobalHall}>
        <div className="relative z-10">
          <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Neutral Grounds</p>
          <h4 className="text-lg font-black mb-2">Global Banter Hall</h4>
          <p className="text-xs text-gray-400 mb-4">Discuss neutral football topics and earn FTC tokens for high-quality engagement.</p>
          <button 
            className="w-full bg-green-600 hover:bg-green-500 border border-green-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-black shadow-lg shadow-green-600/20"
          >
            Enter Global Hall
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-green-600 opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity"></div>
      </Card>
    </div>
  );
};

export default ChatLobbyScreen;
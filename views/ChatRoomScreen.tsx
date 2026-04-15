import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import FanRankBadge from '../components/FanRankBadge';
import { Club, ChatMessage, LineupPoll, UserProfile } from '../types';

interface ChatRoomScreenProps {
  club: Club;
  profile: UserProfile | null;
  onBack: () => void;
  onRecordActivity: () => void;
}

type FanZoneTab = 'match' | 'terrace' | 'tactics' | 'hq';

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ club, profile, onBack, onRecordActivity }) => {
  const [activeTab, setActiveTab] = useState<FanZoneTab>('terrace');
  const [currentRegion, setCurrentRegion] = useState('Main Terrace');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Ultra_Madridista', avatar: 'https://i.pravatar.cc/150?u=11', text: `If we play with high intensity like last Tuesday, the trophy is ours!`, time: '10:05', isMe: false, badge: 'Veteran', fanRank: 'Ultra' },
    { id: '2', sender: 'TacticalNerd', avatar: 'https://i.pravatar.cc/150?u=12', text: `Check the poll guys, we need a 3-man midfield for tonight.`, time: '10:07', isMe: false, badge: 'Analyst', fanRank: 'Supporter' },
    { id: '3', sender: 'GoalKing', avatar: 'https://i.pravatar.cc/150?u=13', text: `Is the lineup out yet? Can't wait! 🔥`, time: '10:10', isMe: false, fanRank: 'Regular' },
    { id: '4', sender: 'MadridGirl_99', avatar: 'https://i.pravatar.cc/150?u=14', text: `Just arrived at the virtual gates! Let's goooo!`, time: '10:12', isMe: false, badge: 'Fan', fanRank: 'Amateur' },
  ]);

  const [poll, setPoll] = useState<LineupPoll>({
    id: 'poll-1',
    question: `Preferred tactical setup for the next Big Match?`,
    options: [
      { id: 'opt-1', label: '4-3-3 Heavy Press', votes: 1420 },
      { id: 'opt-2', label: '4-2-3-1 Counter', votes: 2150 },
      { id: 'opt-3', label: '5-3-2 Defensive Wall', votes: 520 },
    ],
    totalVotes: 4090,
    isActive: true
  });

  const [votedId, setVotedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && activeTab === 'terrace') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: profile?.displayName || 'Me',
      avatar: profile?.avatar || 'https://picsum.photos/100',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      badge: 'Fan',
      fanRank: profile?.fanRank
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    onRecordActivity();
  };

  const handleVote = (optionId: string) => {
    if (votedId) return;
    setVotedId(optionId);
    setPoll(prev => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      options: prev.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
    onRecordActivity();
  };

  const renderMatch = () => (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500 overflow-y-auto h-full no-scrollbar pb-24">
      <Card className="bg-darkDeep text-white border border-gray-800 p-0 overflow-hidden relative shadow-2xl">
        <div className="bg-green-600 px-4 py-1.5 flex justify-between items-center">
           <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-black"><span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>Matchday Live</span>
           <span className="text-[10px] font-black uppercase tracking-widest opacity-80 text-black">74'</span>
        </div>
        <div className="p-8 flex items-center justify-around relative">
           <div className="absolute inset-0 bg-green-600 opacity-10"></div>
           <div className="flex flex-col items-center gap-2 relative z-10"><img src={club.badge} className="w-16 h-16 object-contain" alt="Home" /><p className="text-xs font-black uppercase text-white">{club.name}</p></div>
           <div className="text-center relative z-10"><p className="text-5xl font-black mb-1 text-white">2 - 1</p><p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Scoreline</p></div>
           <div className="flex flex-col items-center gap-2 relative z-10 opacity-40"><div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl">🛡️</div><p className="text-xs font-black uppercase text-white">Rival FC</p></div>
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Latest Updates</p>
          <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">View All</span>
        </div>
        <div className="flex flex-col gap-3">
           {[
             { time: '68\'', event: 'Goal!', desc: 'Brilliant strike from outside the box!', icon: '⚽', color: 'bg-green-950/30 text-green-500' },
             { time: '55\'', event: 'Substitution', desc: 'Midfielder replaced by tactical forward.', icon: '🔄', color: 'bg-blue-950/30 text-blue-500' },
             { time: '45\'', event: 'Half Time', desc: 'Dominating possession but need more goals.', icon: '⏱️', color: 'bg-gray-800 text-gray-400' },
           ].map((update, i) => (
             <div key={i} className="flex gap-4 items-start p-4 bg-darkCard rounded-2xl border border-gray-800 shadow-sm animate-in slide-in-from-bottom-2">
                <div className={`w-10 h-10 ${update.color} rounded-xl flex items-center justify-center text-xl shrink-0`}>{update.icon}</div>
                <div>
                   <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-black text-white">{update.event}</span><span className="text-[10px] font-bold text-gray-500">{update.time}</span></div>
                   <p className="text-xs text-gray-400 font-medium">{update.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  const renderTerrace = () => (
    <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-right-10 duration-500">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-scrollbar" ref={scrollRef}>
        <div className="text-center py-2 mb-2"><span className="text-[9px] font-black uppercase text-gray-500 bg-darkCard px-3 py-1 rounded-full border border-gray-800 shadow-sm">Connected to {currentRegion} • {messages.length + 240} fans in stand</span></div>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}>
            <img src={msg.avatar} className="w-9 h-9 rounded-2xl object-cover shrink-0 shadow-sm border border-gray-800" alt="Avatar" />
            <div className={`flex flex-col ${msg.isMe ? 'items-end' : ''}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                {!msg.isMe && <span className="text-[10px] font-black text-white">{msg.sender}</span>}
                <FanRankBadge rank={msg.fanRank} />
                <span className="text-[8px] text-gray-500 font-bold">{msg.time}</span>
              </div>
              <div className={`p-3 rounded-2xl text-sm font-medium ${msg.isMe ? 'bg-green-600 text-black rounded-tr-none shadow-md' : 'bg-darkCard text-gray-200 rounded-tl-none border border-gray-800 shadow-sm'}`}>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-darkCard border-t border-gray-800 flex items-center gap-3 pb-8">
        <div className="flex-1 bg-darkDeep rounded-2xl border border-gray-800 px-4 py-1 flex items-center shadow-inner">
          <input type="text" placeholder="Shout from the terrace..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e as any)} className="w-full bg-transparent py-3 text-sm font-medium outline-none text-white placeholder:text-gray-500" />
        </div>
        <button onClick={handleSendMessage} disabled={!inputText.trim()} className="w-12 h-12 bg-green-600 text-black rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-30"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
      </div>
    </div>
  );

const renderTactics = () => (
  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar animate-in fade-in duration-500 pb-24">
    <div className="relative aspect-[3/4] w-full bg-darkDeep rounded-[2.5rem] border-4 border-gray-800 overflow-hidden shadow-2xl p-4">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gray-800"></div>
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gray-800"></div>
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-32 h-12 border-b-2 border-x-2 border-gray-800"></div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 h-12 border-t-2 border-x-2 border-gray-800"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-gray-800 rounded-full"></div>
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gray-800"></div>
      <div className="relative z-10 w-full h-full flex flex-col justify-between py-8">
        {/* Forward Line - Green */}
        <div className="flex justify-around">
          <div className="group relative">
            <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-[10px] font-black text-black shadow-xl">9</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Striker</div>
          </div>
        </div>
        
        {/* Attacking Midfield - Mix of Green and Orange */}
        <div className="flex justify-around px-4">
          <div className="group relative">
            <div className="w-8 h-8 bg-orange-500 rounded-full border border-gray-800 flex items-center justify-center text-[8px] font-black text-black shadow-md">11</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold">LW</div>
          </div>
          <div className="group relative">
            <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-[10px] font-black text-black shadow-xl animate-pulse">10</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">CAM</div>
          </div>
          <div className="group relative">
            <div className="w-8 h-8 bg-orange-500 rounded-full border border-gray-800 flex items-center justify-center text-[8px] font-black text-black shadow-md">7</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold">RW</div>
          </div>
        </div>
        
        {/* Central Midfield - Orange */}
        <div className="flex justify-around px-12">
          <div className="group relative">
            <div className="w-8 h-8 bg-orange-500 rounded-full border border-gray-800 flex items-center justify-center text-[8px] font-black text-black shadow-md">8</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold">CM</div>
          </div>
          <div className="group relative">
            <div className="w-8 h-8 bg-orange-500 rounded-full border border-gray-800 flex items-center justify-center text-[8px] font-black text-black shadow-md">6</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold">CDM</div>
          </div>
        </div>
        
        {/* Defense - Mix of Green and Orange */}
        <div className="flex justify-around">
          <div className="group relative">
            <div className="w-8 h-8 bg-orange-500 rounded-full border border-gray-800 flex items-center justify-center text-[8px] font-black text-black shadow-md">3</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold">LB</div>
          </div>
          <div className="group relative">
            <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-[10px] font-black text-black shadow-xl">4</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">CB</div>
          </div>
          <div className="group relative">
            <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-[10px] font-black text-black shadow-xl">5</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">CB</div>
          </div>
          <div className="group relative">
            <div className="w-8 h-8 bg-orange-500 rounded-full border border-gray-800 flex items-center justify-center text-[8px] font-black text-black shadow-md">2</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold">RB</div>
          </div>
        </div>
        
        {/* Goalkeeper - Orange */}
        <div className="flex justify-center">
          <div className="group relative">
            <div className="w-10 h-10 bg-orange-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-[10px] font-black text-black shadow-xl">1</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-darkCard text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">GK</div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <p className="text-white text-lg font-black leading-tight">Fan-voted Formation</p>
        <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mt-1">Submit your tactical suggestion</p>
      </div>
    </div>
    <Card className="border border-gray-800 shadow-md bg-darkCard p-5 space-y-4">
      <p className="text-sm font-black text-white leading-tight">{poll.question}</p>
      <div className="space-y-3">
        {poll.options.map((opt) => {
          const percentage = Math.round((opt.votes / poll.totalVotes) * 100);
          return (
            <button key={opt.id} onClick={() => handleVote(opt.id)} className={`w-full relative h-14 rounded-2xl border transition-all overflow-hidden ${votedId === opt.id ? 'border-green-500 bg-green-950/20' : 'border-gray-800 bg-darkDeep'}`}>
              <div className={`absolute inset-y-0 left-0 transition-all duration-1000 ${votedId ? 'bg-green-500/10' : 'bg-transparent'}`} style={{ width: votedId ? `${percentage}%` : '0%' }} />
              <div className="absolute inset-0 flex items-center justify-between px-5 z-10">
                <span className={`text-sm font-black ${votedId === opt.id ? 'text-green-500' : 'text-gray-300'}`}>{opt.label}</span>
                {votedId && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-green-500">{percentage}%</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase">{opt.votes.toLocaleString()} votes</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  </div>
);

  const renderHQ = () => (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500 overflow-y-auto h-full no-scrollbar pb-24">
       <Card className="bg-darkDeep text-white border border-gray-800 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600 opacity-20 rounded-full blur-[80px] -translate-y-24 translate-x-24"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-darkCard rounded-[1.5rem] p-4 mb-4 border border-gray-800 shadow-2xl"><img src={club.badge} className="w-full h-full object-contain" alt={club.name} /></div>
          <h2 className="text-2xl font-black mb-1 text-white">{club.name} HQ</h2>
          <p className="text-green-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">Institutional Hub</p>
          <div className="grid grid-cols-3 gap-4 w-full mt-4"><div className="text-center"><p className="text-xl font-black text-white">{club.trophies.league}</p><p className="text-[8px] uppercase tracking-widest text-gray-500">Leagues</p></div><div className="text-center"><p className="text-xl font-black text-white">{club.trophies.continental}</p><p className="text-[8px] uppercase tracking-widest text-gray-500">Europe</p></div><div className="text-center"><p className="text-xl font-black text-white">{club.trophies.domestic}</p><p className="text-[8px] uppercase tracking-widest text-gray-500">Cups</p></div></div>
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] px-1">Club Identity</p>
        <Card className="p-0 overflow-hidden border border-gray-800 shadow-sm divide-y divide-gray-800 bg-darkCard">
           {[
             { label: 'Founded', value: club.foundedYear, icon: '📅' },
             { label: 'Stadium', value: 'Historical Grounds', icon: '🏟️' },
             { label: 'Coach', value: club.coach.name, icon: '👔' },
             { label: 'Value Range', value: club.valueRange, icon: '💎' },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-darkCard"><div className="flex items-center gap-3"><span className="text-xl">{item.icon}</span><span className="text-xs font-bold text-gray-400">{item.label}</span></div><span className="text-xs font-black text-white">{item.value}</span></div>
           ))}
        </Card>
      </div>
      <Card className="bg-green-950/20 border border-green-500/30 p-6 text-center"><p className="text-xs font-black text-green-500 mb-1">Loyalty Rewards</p><p className="text-[10px] text-green-400 font-medium">Contribute to the terrace daily to earn more influence points.</p></Card>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-darkBg animate-in slide-in-from-right-10 duration-500 overflow-hidden">
      <div className="bg-darkCard px-4 pt-10 pb-2 border-b border-gray-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 mb-5 px-2">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-95 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
          <div className="w-11 h-11 bg-darkDeep rounded-2xl p-1.5 flex items-center justify-center shadow-inner"><img src={club.badge} className="w-full h-full object-contain" alt="Club" /></div>
          <div className="flex-1"><h2 className="text-sm font-black text-white leading-tight uppercase tracking-tight">{club.name} Fan Zone</h2><div className="flex items-center gap-1.5 mt-0.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Digital Stadium</p></div></div>
          <div className="flex -space-x-2.5">
            {[1, 2, 3, 4, 5].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i + 120}`} className="w-7 h-7 rounded-full border-2 border-gray-800 shadow-sm object-cover" alt="Fan" />)}
            <div className="w-7 h-7 rounded-full border-2 border-gray-800 bg-green-600 flex items-center justify-center text-[7px] font-black text-black shadow-sm">+240</div>
          </div>
        </div>
        <div className="flex gap-8 px-4 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'match', label: 'Matchday', icon: '⚽' },
            { id: 'terrace', label: 'Terrace', icon: '🗣️' },
            { id: 'tactics', label: 'Tactics', icon: '📋' },
            { id: 'hq', label: 'Club HQ', icon: '🏢' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as FanZoneTab)} className={`pb-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative shrink-0 flex items-center gap-1.5 ${activeTab === tab.id ? 'text-green-500' : 'text-gray-600'}`}><span>{tab.label}</span>{activeTab === tab.id && <div className="absolute bottom-0 inset-x-0 h-1 bg-green-600 rounded-t-full animate-in slide-in-from-bottom-1" />}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'match' && renderMatch()}
        {activeTab === 'terrace' && renderTerrace()}
        {activeTab === 'tactics' && renderTactics()}
        {activeTab === 'hq' && renderHQ()}
      </div>
    </div>
  );
};

export default ChatRoomScreen;
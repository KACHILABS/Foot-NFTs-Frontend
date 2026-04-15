import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Club, TacticalPoll, Player, PollCategory } from '../types';

interface VotingScreenProps {
  club: Club;
  onBack?: () => void;
  onEarn: (amount: number) => void;
}

const PLAYERS: Player[] = [
  { id: '1', name: 'Courtois', position: 'GK', number: 1, photo: '🧤' },
  { id: '2', name: 'Carvajal', position: 'DEF', number: 2, photo: '🛡️' },
  { id: '3', name: 'Militão', position: 'DEF', number: 3, photo: '🛡️' },
  { id: '4', name: 'Rüdiger', position: 'DEF', number: 22, photo: '🛡️' },
  { id: '5', name: 'Mendy', position: 'DEF', number: 23, photo: '🛡️' },
  { id: '6', name: 'Valverde', position: 'MID', number: 8, photo: '⚡' },
  { id: '7', name: 'Bellingham', position: 'MID', number: 5, photo: '🌟' },
  { id: '8', name: 'Camavinga', position: 'MID', number: 6, photo: '🏃' },
  { id: '9', name: 'Rodrygo', position: 'FWD', number: 11, photo: '🎯' },
  { id: '10', name: 'Vinícius Jr.', position: 'FWD', number: 7, photo: '🔥' },
  { id: '11', name: 'Mbappé', position: 'FWD', number: 9, photo: '🐢' },
];

const ACTIVE_POLLS: TacticalPoll[] = [
  {
    id: 'tp1',
    category: 'formation',
    title: "European Night Formation",
    description: "Choose the shape of our squad for the upcoming European clash.",
    endTime: '18h left',
    totalVotes: 12450,
    options: [
      { id: 'f1', label: '4-3-3 Attack', votes: 5400, description: 'Width and overlapping fullbacks.', icon: '📐' },
      { id: 'f2', label: '4-4-2 Diamond', votes: 3200, description: 'Control the center of the pitch.', icon: '💎' },
      { id: 'f3', label: '3-5-2 Wingbacks', votes: 3850, description: 'Solid defense with high energy.', icon: '🛡️' }
    ]
  },
  {
    id: 'tp2',
    category: 'lineup',
    title: "Derby Starting XI",
    description: "Who deserves the starting spot in the weekend derby?",
    endTime: '2d left',
    totalVotes: 8900
  },
  {
    id: 'tp3',
    category: 'tactics',
    title: "Opening Phase Tactics",
    description: "How should we approach the first 15 minutes of play?",
    endTime: '5h left',
    totalVotes: 15600,
    options: [
      { id: 't1', label: 'High Press', icon: '🔥', votes: 8900, description: 'Suffer the opponent from their box.' },
      { id: 't2', label: 'Possession Play', icon: '♾️', votes: 4500, description: 'Control the tempo with short passes.' },
      { id: 't3', label: 'Low Block', icon: '🧱', votes: 2200, description: 'Invite pressure and hit on counter.' }
    ]
  }
];

const VotingScreen: React.FC<VotingScreenProps> = ({ club, onBack, onEarn }) => {
  const [selectedPoll, setSelectedPoll] = useState<TacticalPoll | null>(null);
  const [votedPollIds, setVotedPollIds] = useState<Set<string>>(new Set());
  const [selectedXI, setSelectedXI] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const handlePollSelect = (poll: TacticalPoll) => {
    setSelectedPoll(poll);
    setSelectedXI([]);
  };

  const handlePlayerToggle = (playerId: string) => {
    if (votedPollIds.has(selectedPoll?.id || '')) return;
    setSelectedXI(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : (prev.length < 11 ? [...prev, playerId] : prev)
    );
  };

  const submitVote = () => {
    if (!selectedPoll) return;
    setConfirming(true);
    setTimeout(() => {
      setVotedPollIds(prev => new Set(prev).add(selectedPoll.id));
      onEarn(15);
      setConfirming(false);
    }, 1500);
  };

  const renderPollList = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24">
      <div className="relative rounded-[2.5rem] overflow-hidden bg-darkDeep text-white p-8 border border-gray-800">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-green-600 opacity-20 blur-3xl rounded-full"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-2 block">Voice of the Stand</span>
        <h2 className="text-2xl font-black mb-2 text-white">Fan Tactical Voting</h2>
        <p className="text-xs text-gray-400 font-medium leading-relaxed">
          Your insight matters. Participate in symbolic club decisions and earn FTC for every contribution.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] px-1">Active Ballots</p>
        {ACTIVE_POLLS.map((poll) => (
          <Card 
            key={poll.id} 
            className="p-5 border border-gray-800 shadow-sm relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all bg-darkCard"
            onClick={() => handlePollSelect(poll)}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${votedPollIds.has(poll.id) ? 'bg-green-950/30 text-green-500' : 'bg-orange-950/30 text-orange-500'}`}>
                {votedPollIds.has(poll.id) ? 'Vote Recorded' : poll.category}
              </span>
              <span className="text-[9px] font-bold text-gray-500 uppercase">{poll.endTime}</span>
            </div>
            <h3 className="text-base font-black text-white leading-tight mb-1">{poll.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-1">{poll.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">{poll.totalVotes.toLocaleString()} fans voted</span>
              <div className="w-8 h-8 rounded-lg bg-darkDeep flex items-center justify-center group-hover:bg-green-950/30 transition-colors">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* NEW: Coming Soon Tile - Vote Football Highlights to Become NFT */}
      <div className="flex flex-col gap-4 mt-4">
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] px-1">Coming Soon</p>
        <Card className="p-5 border border-gray-800 shadow-sm relative overflow-hidden bg-darkCard/50 opacity-80">
          <div className="absolute top-0 right-0 p-2">
            <span className="inline-block bg-orange-600 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">COMING SOON</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-600/20 flex items-center justify-center text-3xl">
              🎬
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-white mb-1">Vote Football Highlights to Become an NFT</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your vote decides which iconic moments get minted as permanent NFTs on the blockchain. 
                Each highlight you vote for earns you royalties forever.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[9px] text-gray-500 font-bold">Earn royalties</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[9px] text-gray-500 font-bold">Permanent on-chain</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[9px] text-gray-500 font-bold">Fan-certified</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider">Launching Phase 3</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-500 font-black uppercase">Reward: </span>
                <span className="text-[8px] font-black text-green-500">+25 FTC per vote</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderLineupVoting = (poll: TacticalPoll) => (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => setSelectedPoll(null)} className="p-2 -ml-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-black text-white">Choose your Starting XI</h2>
      </div>

      <div className="bg-darkDeep rounded-[2.5rem] p-6 relative overflow-hidden aspect-[4/5] border border-gray-800 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-between py-10">
          <div className="flex gap-4">
            {PLAYERS.filter(p => p.position === 'FWD').map(p => (
              <PlayerNode key={p.id} player={p} selected={selectedXI.includes(p.id)} onClick={() => handlePlayerToggle(p.id)} />
            ))}
          </div>
          <div className="flex gap-8">
            {PLAYERS.filter(p => p.position === 'MID').map(p => (
              <PlayerNode key={p.id} player={p} selected={selectedXI.includes(p.id)} onClick={() => handlePlayerToggle(p.id)} />
            ))}
          </div>
          <div className="flex gap-4">
            {PLAYERS.filter(p => p.position === 'DEF').map(p => (
              <PlayerNode key={p.id} player={p} selected={selectedXI.includes(p.id)} onClick={() => handlePlayerToggle(p.id)} />
            ))}
          </div>
          <PlayerNode player={PLAYERS.find(p => p.position === 'GK')!} selected={selectedXI.includes('1')} onClick={() => handlePlayerToggle('1')} />
        </div>
      </div>

      <div className="sticky bottom-0 p-6 bg-darkCard border-t border-gray-800 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Selection: {selectedXI.length}/11</span>
          <span className="text-[10px] font-black uppercase text-green-500">Reward: +15 FTC</span>
        </div>
        <Button 
          disabled={selectedXI.length !== 11 || confirming || votedPollIds.has(poll.id)}
          onClick={submitVote}
        >
          {confirming ? 'Recording Choice...' : votedPollIds.has(poll.id) ? 'Choice Locked' : 'Submit Preferred XI'}
        </Button>
      </div>
    </div>
  );

  const renderOptionVoting = (poll: TacticalPoll) => (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => setSelectedPoll(null)} className="p-2 -ml-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-white">{poll.title}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{poll.endTime} • Fan Preference</p>
        </div>
      </div>

      <div className="space-y-4">
        {poll.options?.map((option) => {
          const isVoted = votedPollIds.has(poll.id);
          const percentage = Math.round((option.votes / poll.totalVotes) * 100);
          
          return (
            <Card 
              key={option.id}
              className={`p-6 border border-gray-800 shadow-sm relative overflow-hidden transition-all bg-darkCard ${isVoted ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
              onClick={() => !isVoted && submitVote()}
            >
              {isVoted && (
                <div 
                  className="absolute inset-y-0 left-0 bg-green-500/10 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-darkDeep rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-base font-black text-white">{option.label}</h4>
                    {isVoted && <span className="text-sm font-black text-green-500">{percentage}%</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{option.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {votedPollIds.has(poll.id) && (
        <Card className="bg-green-950/20 border border-green-500/30 p-6 text-center">
           <p className="text-sm font-black text-green-500 mb-1">Choice Submitted!</p>
           <p className="text-[10px] text-green-400 font-medium uppercase tracking-widest">Results shown are live community insights</p>
        </Card>
      )}
    </div>
  );

  if (!selectedPoll) return renderPollList();
  if (selectedPoll.category === 'lineup') return renderLineupVoting(selectedPoll);
  return renderOptionVoting(selectedPoll);
};

const PlayerNode: React.FC<{ player: Player, selected: boolean, onClick: () => void }> = ({ player, selected, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-1 transition-all active:scale-90"
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 shadow-lg transition-all ${selected ? 'bg-green-600 border-green-400 scale-110' : 'bg-darkDeep border-gray-700'}`}>
       {player.photo}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-tighter px-1 rounded-full ${selected ? 'text-green-500' : 'text-gray-400'}`}>
      {player.name}
    </span>
  </button>
);

export default VotingScreen;
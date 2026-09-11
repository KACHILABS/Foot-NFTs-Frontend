import React, { useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';

export interface RivalryPlayer {
  id: string;
  name: string;
  club: string;
  nationality: string;
  position: string;
  photo: string;
}

export interface RivalryItem {
  id: string;
  title: string;
  summary: string;
  playerAId: string;
  playerBId: string;
  creator: string;
  status: 'Live' | 'Trending' | 'Fan Pick';
  votes: {
    [playerId: string]: number;
  };
}

const SEED_PLAYERS: RivalryPlayer[] = [
  { id: 'messi', name: 'Lionel Messi', club: 'Inter Miami', nationality: 'Argentina', position: 'FWD', photo: '🦁' },
  { id: 'ronaldo', name: 'Cristiano Ronaldo', club: 'Al Nassr', nationality: 'Portugal', position: 'FWD', photo: '💫' },
  { id: 'salah', name: 'Mohamed Salah', club: 'Liverpool', nationality: 'Egypt', position: 'FWD', photo: '🌟' },
  { id: 'mbappe', name: 'Kylian Mbappé', club: 'Real Madrid', nationality: 'France', position: 'FWD', photo: '🚀' },
  { id: 'haaland', name: 'Erling Haaland', club: 'Manchester City', nationality: 'Norway', position: 'FWD', photo: '🦅' },
  { id: 'vinicius', name: 'Vinícius Júnior', club: 'Real Madrid', nationality: 'Brazil', position: 'FWD', photo: '⚡' },
  { id: 'debruyne', name: 'Kevin De Bruyne', club: 'Manchester City', nationality: 'Belgium', position: 'MID', photo: '🎯' },
  { id: 'modric', name: 'Luka Modrić', club: 'Real Madrid', nationality: 'Croatia', position: 'MID', photo: '🧠' },
  { id: 'bellingham', name: 'Jude Bellingham', club: 'Real Madrid', nationality: 'England', position: 'MID', photo: '🔥' },
  { id: 'son', name: 'Heung-min Son', club: 'Tottenham Hotspur', nationality: 'South Korea', position: 'FWD', photo: '🌊' },
];

const FEATURED_RIVALRIES: RivalryItem[] = [
  {
    id: 'messi-vs-ronaldo',
    title: 'Messi vs Ronaldo',
    summary: 'Who gets the last word in the all-time great debate?',
    playerAId: 'messi',
    playerBId: 'ronaldo',
    creator: 'Foot-Collect',
    status: 'Trending',
    votes: { messi: 64, ronaldo: 36 },
  },
  {
    id: 'salah-vs-mbappe',
    title: 'Salah vs Mbappé',
    summary: 'Which superstar owns the biggest big-game moments this season?',
    playerAId: 'salah',
    playerBId: 'mbappe',
    creator: 'Foot-Collect',
    status: 'Live',
    votes: { salah: 58, mbappe: 42 },
  },
  {
    id: 'haaland-vs-vinicius',
    title: 'Haaland vs Vinícius',
    summary: 'Who is the most dangerous finisher in world football right now?',
    playerAId: 'haaland',
    playerBId: 'vinicius',
    creator: 'Foot-Collect',
    status: 'Fan Pick',
    votes: { haaland: 52, vinicius: 48 },
  },
];

const playerById = (id: string) => SEED_PLAYERS.find((player) => player.id === id) || SEED_PLAYERS[0];

const getPercentage = (votesA: number, votesB: number) => {
  const total = votesA + votesB;
  if (!total) return 50;
  return Math.round((votesA / total) * 100);
};

const PlayerCard: React.FC<{ player: RivalryPlayer; selected?: boolean; onClick?: () => void }> = ({ player, selected = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 flex-col items-center justify-center rounded-[28px] border p-4 text-center transition-all ${selected ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-gray-800 bg-darkDeep'}`} 
  >
    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-4xl shadow-inner">
      {player.photo}
    </div>
    <p className="text-base font-black text-white">{player.name}</p>
    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">{player.position}</p>
    <p className="mt-2 text-[10px] text-gray-500">{player.club}</p>
  </button>
);

const RivalryDetailScreen: React.FC<{
  rivalry: RivalryItem;
  onBack: () => void;
  onVote: (rivalryId: string, playerId: string) => void;
  alreadyVotedFor: string | null;
}> = ({ rivalry, onBack, onVote, alreadyVotedFor }) => {
  const playerA = playerById(rivalry.playerAId);
  const playerB = playerById(rivalry.playerBId);
  const votesA = rivalry.votes[rivalry.playerAId] ?? 0;
  const votesB = rivalry.votes[rivalry.playerBId] ?? 0;
  const percentA = getPercentage(votesA, votesB);
  const percentB = 100 - percentA;

  return (
    <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Rivalry</p>
          <h2 className="text-xl font-black text-white">{rivalry.title}</h2>
        </div>
      </div>

      <Card className="bg-darkCard border border-gray-800 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-400">{rivalry.status}</span>
          <span className="text-[9px] text-gray-500">Created by {rivalry.creator}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{rivalry.summary}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <PlayerCard player={playerA} selected={alreadyVotedFor === playerA.id} onClick={() => onVote(rivalry.id, playerA.id)} />
        <PlayerCard player={playerB} selected={alreadyVotedFor === playerB.id} onClick={() => onVote(rivalry.id, playerB.id)} />
      </div>

      <Card className="border border-gray-800 bg-darkDeep p-5">
        <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          <span>Fan vote</span>
          <span>{votesA + votesB} votes</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-gray-800">
          <div className="flex h-full">
            <div className="flex items-center justify-center bg-green-500 text-[8px] font-black text-black" style={{ width: `${percentA}%` }}>
              {percentA}%
            </div>
            <div className="flex items-center justify-center bg-orange-500 text-[8px] font-black text-white" style={{ width: `${percentB}%` }}>
              {percentB}%
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm font-bold text-white">
          <span>{playerA.name}</span>
          <span>{playerB.name}</span>
        </div>
      </Card>

      <Card className="border border-gray-800 bg-darkCard p-5">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rules</p>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• One vote per user per rivalry per day.</li>
          <li>• Community-voted rivalries are curated for discussion.</li>
          <li>• Fan opinions can be used to surface future matchups and polls.</li>
        </ul>
      </Card>
    </div>
  );
};

const PlayerRivalryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [featuredRivalries, setFeaturedRivalries] = useState<RivalryItem[]>(FEATURED_RIVALRIES);
  const [selectedRivalryId, setSelectedRivalryId] = useState<string | null>(null);
  const [playerAId, setPlayerAId] = useState('messi');
  const [playerBId, setPlayerBId] = useState('ronaldo');
  const [votedToday, setVotedToday] = useState<Record<string, string>>({});

  const communityRivalries = useMemo(
    () => [
      {
        id: 'community-1',
        title: 'Salah vs De Bruyne',
        summary: 'Who drives the biggest moments in the final third?',
        playerAId: 'salah',
        playerBId: 'debruyne',
        creator: 'FanZone-42',
        status: 'Community',
        votes: { salah: 71, debruyne: 29 },
      },
      {
        id: 'community-2',
        title: 'Mbappé vs Bellingham',
        summary: 'Which superstar is the true match-winner in European football?',
        playerAId: 'mbappe',
        playerBId: 'bellingham',
        creator: 'TacticalRoom',
        status: 'Community',
        votes: { mbappe: 61, bellingham: 39 },
      },
      {
        id: 'community-3',
        title: 'Son vs Vinícius',
        summary: 'Who is the more unpredictable winger in the last 20 minutes?',
        playerAId: 'son',
        playerBId: 'vinicius',
        creator: 'City Echo',
        status: 'Community',
        votes: { son: 49, vinicius: 51 },
      },
    ] as RivalryItem[],
    []
  );

  const allRivalries = [...featuredRivalries, ...communityRivalries];
  const selectedRivalry = allRivalries.find((rivalry) => rivalry.id === selectedRivalryId) || null;

  const handleVote = (rivalryId: string, playerId: string) => {
    const voteKey = votedToday[rivalryId];
    if (voteKey) return;

    setVotedToday((prev) => ({ ...prev, [rivalryId]: playerId }));
    setFeaturedRivalries((prev) =>
      prev.map((rivalry) => {
        if (rivalry.id !== rivalryId) return rivalry;
        const nextVotes = { ...rivalry.votes };
        nextVotes[playerId] = (nextVotes[playerId] ?? 0) + 1;
        return { ...rivalry, votes: nextVotes };
      })
    );
  };

  const handleCreateCustomRivalry = () => {
    if (playerAId === playerBId) return;

    const customTitle = `${playerById(playerAId).name} vs ${playerById(playerBId).name}`;
    const newRivalry: RivalryItem = {
      id: `custom-${Date.now()}`,
      title: customTitle,
      summary: 'Fan-created head-to-head debate from the community.',
      playerAId,
      playerBId,
      creator: 'You',
      status: 'Fan Pick',
      votes: { [playerAId]: 50, [playerBId]: 50 },
    };

    setFeaturedRivalries((prev) => [newRivalry, ...prev]);
    setSelectedRivalryId(newRivalry.id);
  };

  if (selectedRivalry) {
    return (
      <RivalryDetailScreen
        rivalry={selectedRivalry}
        onBack={() => setSelectedRivalryId(null)}
        onVote={handleVote}
        alreadyVotedFor={votedToday[selectedRivalry.id] || null}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Fan Arena</p>
            <h1 className="text-2xl font-black text-white">Player Rivalry Hub</h1>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">A. Featured Rivalries</p>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-500">Curated</span>
        </div>

        <div className="space-y-4">
          {featuredRivalries.map((rivalry) => {
            const playerA = playerById(rivalry.playerAId);
            const playerB = playerById(rivalry.playerBId);
            const votesA = rivalry.votes[rivalry.playerAId] ?? 0;
            const votesB = rivalry.votes[rivalry.playerBId] ?? 0;
            const percentA = getPercentage(votesA, votesB);

            return (
              <Card key={rivalry.id} className="border border-gray-800 bg-darkCard p-4" onClick={() => setSelectedRivalryId(rivalry.id)}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-500">{rivalry.status}</span>
                  <span className="text-[9px] text-gray-500">{rivalry.creator}</span>
                </div>

                <h3 className="text-lg font-black text-white">{rivalry.title}</h3>
                <p className="mt-2 text-xs text-gray-400">{rivalry.summary}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-800">{playerA.photo}</span>
                    {playerA.name}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">VS</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    {playerB.name}
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-800">{playerB.photo}</span>
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-800">
                  <div className="flex h-full">
                    <div className="h-full rounded-l-full bg-green-500" style={{ width: `${percentA}%` }} />
                    <div className="h-full rounded-r-full bg-orange-500" style={{ width: `${100 - percentA}%` }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">B. Create Your Own Rivalry</p>
        <Card className="border border-gray-800 bg-darkCard p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <PlayerCard player={playerById(playerAId)} selected={playerAId === playerAId} onClick={() => setPlayerAId(playerAId)} />
              <PlayerCard player={playerById(playerBId)} selected={playerBId === playerBId} onClick={() => setPlayerBId(playerBId)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={playerAId}
                onChange={(event) => setPlayerAId(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-darkDeep px-3 py-3 text-sm text-white outline-none"
              >
                {SEED_PLAYERS.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>

              <select
                value={playerBId}
                onChange={(event) => setPlayerBId(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-darkDeep px-3 py-3 text-sm text-white outline-none"
              >
                {SEED_PLAYERS.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleCreateCustomRivalry} className="bg-green-600 text-black">
              Create Rivalry
            </Button>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">C. Community Rivalries</p>
        <div className="space-y-3">
          {communityRivalries.map((rivalry) => {
            const playerA = playerById(rivalry.playerAId);
            const playerB = playerById(rivalry.playerBId);
            return (
              <Card key={rivalry.id} className="border border-gray-800 bg-darkCard p-4" onClick={() => setSelectedRivalryId(rivalry.id)}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">Community</span>
                  <span className="text-[9px] text-gray-500">{rivalry.creator}</span>
                </div>
                <h3 className="mt-2 text-base font-black text-white">{rivalry.title}</h3>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                    <span>{playerA.photo}</span>
                    {playerA.name}
                  </div>
                  <span className="text-[9px] text-gray-500">VS</span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                    {playerB.name}
                    <span>{playerB.photo}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PlayerRivalryScreen;

import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

export interface CreatorPreview {
  id: string;
  name: string;
  handle: string;
  club: string;
  niche: string;
  avatar: string;
  followers: number;
  badge: string;
}

const creatorSeed: CreatorPreview[] = [
  { id: 'marcus-hale', name: 'Marcus Hale', handle: '@marcusx', club: 'Manchester United', niche: 'Tactics', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', followers: 12800, badge: 'Creator' },
  { id: 'nia-ortiz', name: 'Nia Ortiz', handle: '@nortiz', club: 'Real Madrid', niche: 'Matchday Views', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', followers: 9800, badge: 'Creator' },
  { id: 'theo-park', name: 'Theo Park', handle: '@theopark', club: 'Bayern Munich', niche: 'Analysis', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', followers: 7600, badge: 'Creator' },
  { id: 'sofia-blake', name: 'Sofia Blake', handle: '@sofiab', club: 'Barcelona', niche: 'Fan Culture', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', followers: 6400, badge: 'Creator' },
];

interface CreatorHubScreenProps {
  profile?: any | null;
  onOpenProfile?: (creatorId: string) => void;
  onOpenApplication?: () => void;
  onBack?: () => void;
}

const CreatorHubScreen: React.FC<CreatorHubScreenProps> = ({ onOpenProfile, onOpenApplication, onBack }) => {
  const [query, setQuery] = useState('');
  const [followed, setFollowed] = useState<string[]>(['marcus-hale']);

  const filteredCreators = useMemo(() => {
    return creatorSeed.filter(creator => {
      const matchQuery = `${creator.name} ${creator.club} ${creator.niche}`.toLowerCase();
      return matchQuery.includes(query.toLowerCase());
    });
  }, [query]);

  const handleFollow = (creatorId: string) => {
    setFollowed(prev => prev.includes(creatorId) ? prev.filter(id => id !== creatorId) : [...prev, creatorId]);
  };

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold">
          <span>←</span>
          <span>Back</span>
        </button>
        <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-green-400 font-black">
          {creatorSeed.length} creators
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-darkCard p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators"
          className="w-full rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredCreators.map(creator => {
          const isFollowing = followed.includes(creator.id);
          return (
            <Card key={creator.id} className="p-3 border border-gray-800 bg-darkCard">
              <div className="flex items-center gap-3">
                <button onClick={() => onOpenProfile?.(creator.id)} className="shrink-0">
                  <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                </button>

                <div className="min-w-0 flex-1">
                  <button onClick={() => onOpenProfile?.(creator.id)} className="text-left w-full">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white">{creator.name}</p>
                      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.18em] text-green-400 font-black">{creator.badge}</span>
                    </div>
                  </button>
                  <div className="text-[9px] text-gray-500 mt-0.5">
                    {creator.handle} • {creator.club}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">{creator.niche} • {creator.followers.toLocaleString()} followers</div>
                </div>

                <button
                  onClick={() => handleFollow(creator.id)}
                  className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${isFollowing ? 'bg-gray-800 text-white' : 'bg-green-600 text-black'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Button onClick={onOpenApplication} className="mt-2 rounded-2xl py-3 text-xs">Apply to become creator</Button>
    </div>
  );
};

export default CreatorHubScreen;

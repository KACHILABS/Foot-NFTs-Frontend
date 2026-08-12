import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { SearchIcon, BackIcon, VerifiedIcon } from '../src/components/Icons';

export interface CreatorPreview {
  id: string;
  name: string;
  handle: string;
  club: string;
  niche: string;
  avatar: string;
  follower_count: number;
  verified: boolean;
}

interface CreatorHubScreenProps {
  profile?: any | null;
  backendUserId?: string | null;
  onOpenProfile?: (creatorId: string, creator: CreatorPreview) => void;
  onOpenApplication?: () => void;
  onBack?: () => void;
}

const API_BASE = 'https://footnfts.up.railway.app/api';

const CreatorHubScreen: React.FC<CreatorHubScreenProps> = ({ onOpenProfile, onOpenApplication, onBack, backendUserId }) => {
  const [query, setQuery] = useState('');
  const [creators, setCreators] = useState<CreatorPreview[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/creator/top-creators`);
      const data = await res.json();
      if (data.success && data.creators) {
        setCreators(data.creators);
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      const matchQuery = `${creator.name} ${creator.club} ${creator.niche}`.toLowerCase();
      return matchQuery.includes(query.toLowerCase());
    });
  }, [query, creators]);

  const handleFollow = async (creatorId: string) => {
    if (!backendUserId) return;
    
    try {
      const res = await fetch(`${API_BASE}/creator/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: backendUserId,
          creatorId: creatorId
        })
      });

      const data = await res.json();
      if (data.success) {
        setFollowed(prev => prev.includes(creatorId) ? prev.filter(id => id !== creatorId) : [...prev, creatorId]);
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-4 pt-3">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold hover:text-white">
          <BackIcon className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-green-400 font-black">
          {creators.length} creators
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-darkCard p-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5">
          <SearchIcon className="w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators"
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-gray-400">Loading creators...</Card>
      ) : filteredCreators.length === 0 ? (
        <Card className="p-6 text-center text-gray-400">No creators found</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredCreators.map(creator => {
            const isFollowing = followed.includes(creator.id);
            return (
              <Card key={creator.id} className="p-3 border border-gray-800 bg-darkCard">
                <div className="flex items-center gap-3">
                  <button onClick={() => onOpenProfile?.(creator.id, creator)} className="shrink-0">
                    <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <button onClick={() => onOpenProfile?.(creator.id, creator)} className="text-left w-full">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white">{creator.name}</p>
                        {creator.verified && (
                          <VerifiedIcon className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </button>
                    <div className="text-[9px] text-gray-500 mt-0.5">
                      {creator.club}
                    </div>
                    <div className="text-[9px] text-gray-400 mt-1">{creator.niche} • {creator.follower_count?.toLocaleString() || 0} followers</div>
                  </div>

                  <button
                    onClick={() => handleFollow(creator.id)}
                    className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${isFollowing ? 'bg-gray-800 text-white border border-gray-700' : 'bg-green-600 text-black border border-green-600'}`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Button onClick={onOpenApplication} className="mt-2 rounded-2xl py-3 text-xs">Apply to become creator</Button>
    </div>
  );
};

export default CreatorHubScreen;

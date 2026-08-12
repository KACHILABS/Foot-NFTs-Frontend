import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

export interface CreatorProfileData {
  id: string;
  name: string;
  handle: string;
  club: string;
  niche: string;
  avatar: string;
  followers: number;
  stats: {
    posts: number;
    avgLikes: number;
    engagement: string;
  };
  bio: string;
}

interface CreatorProfileScreenProps {
  creator: CreatorProfileData;
  isFollowing?: boolean;
  onBack?: () => void;
  onToggleFollow?: () => void;
  onOpenFeed?: () => void;
  onApply?: () => void;
}

const CreatorProfileScreen: React.FC<CreatorProfileScreenProps> = ({ creator, isFollowing = false, onBack, onToggleFollow, onOpenFeed, onApply }) => {
  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold">
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <Card className="overflow-hidden border border-gray-800 bg-darkCard p-0">
        <div className="h-24 bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400"></div>
        <div className="px-4 pb-4">
          <div className="-mt-8 flex items-end justify-between gap-3">
            <img src={creator.avatar} alt={creator.name} className="w-20 h-20 rounded-2xl border-4 border-darkCard object-cover" />
            <button
              onClick={onToggleFollow}
              className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${isFollowing ? 'bg-gray-800 text-white' : 'bg-green-600 text-black'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{creator.name}</h2>
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.18em] text-green-400 font-black">Creator</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{creator.handle} • {creator.club}</p>
          </div>

          <p className="mt-3 text-sm text-gray-300 leading-6">{creator.bio}</p>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-2xl border border-gray-800 bg-darkDeep p-3 text-center">
              <p className="text-lg font-black text-white">{creator.stats.posts}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] text-gray-500">Posts</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-darkDeep p-3 text-center">
              <p className="text-lg font-black text-white">{creator.stats.avgLikes}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] text-gray-500">Avg likes</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-darkDeep p-3 text-center">
              <p className="text-lg font-black text-white">{creator.stats.engagement}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] text-gray-500">Engage</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onOpenFeed} className="py-3 text-xs rounded-2xl">View feed</Button>
        <Button onClick={onApply} variant="outline" className="py-3 text-xs rounded-2xl">Apply</Button>
      </div>

      <Card className="p-4 border border-gray-800 bg-darkCard">
        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-2">Focus</p>
        <div className="flex flex-wrap gap-2">
          {[creator.niche, 'Matchday', 'Analysis', 'Community'].map(tag => (
            <span key={tag} className="rounded-full border border-gray-700 bg-darkDeep px-2 py-1 text-[9px] text-gray-300">{tag}</span>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CreatorProfileScreen;

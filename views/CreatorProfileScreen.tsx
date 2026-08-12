import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { VerifiedIcon, BackIcon } from '../src/components/Icons';

export interface CreatorProfileData {
  id: string;
  name: string;
  handle: string;
  club: string;
  niche: string;
  avatar: string;
  followers: number;
  verified: boolean;
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
}

const CreatorProfileScreen: React.FC<CreatorProfileScreenProps> = ({ creator, isFollowing = false, onBack, onToggleFollow }) => {
  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold hover:text-white">
          <BackIcon className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Card */}
      <Card className="overflow-hidden border border-gray-800 bg-darkCard p-0">
        <div className="h-24 bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400"></div>
        <div className="px-4 pb-4">
          <div className="-mt-8 flex items-end justify-between gap-3">
            <img src={creator.avatar} alt={creator.name} className="w-20 h-20 rounded-2xl border-4 border-darkCard object-cover" />
            <button
              onClick={onToggleFollow}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${isFollowing ? 'bg-gray-800 text-white border border-gray-700' : 'bg-green-600 text-black border border-green-600'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{creator.name}</h2>
              {creator.verified && (
                <VerifiedIcon className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{creator.handle}</p>
            {creator.club && <p className="text-xs text-gray-500 mt-0.5">{creator.club}</p>}
          </div>

          {creator.bio && (
            <p className="mt-3 text-sm text-gray-300 leading-6">{creator.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-2xl border border-gray-800 bg-darkDeep p-3 text-center">
              <p className="text-lg font-black text-white">{creator.followers.toLocaleString()}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] text-gray-500">Followers</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-darkDeep p-3 text-center">
              <p className="text-lg font-black text-white">{creator.stats.posts}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] text-gray-500">Posts</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-darkDeep p-3 text-center">
              <p className="text-lg font-black text-white">{creator.stats.engagement}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] text-gray-500">Engage</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Niche Tag */}
      {creator.niche && (
        <Card className="p-3 border border-gray-800 bg-darkCard">
          <p className="text-[8px] uppercase tracking-[0.2em] text-gray-500 mb-2">Focus</p>
          <span className="inline-block rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400 font-bold">{creator.niche}</span>
        </Card>
      )}
    </div>
  );
};

export default CreatorProfileScreen;

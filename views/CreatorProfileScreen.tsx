import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { VerifiedIcon, BackIcon, HeartIcon, ChatIcon, StarIcon } from '../src/components/Icons';

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
  likes?: number;
  ftcEarned?: number;
  rating?: number;
  recentPosts?: Array<{
    id: string;
    text: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    aligns: number;
  }>;
}

interface CreatorProfileScreenProps {
  creator: CreatorProfileData;
  isFollowing?: boolean;
  onBack?: () => void;
  onToggleFollow?: () => void;
  onToggleAlign?: () => void;
}

const CreatorProfileScreen: React.FC<CreatorProfileScreenProps> = ({ creator, isFollowing = false, onBack, onToggleFollow, onToggleAlign }) => {
  const tg = (window as any).Telegram?.WebApp;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleFollow = () => {
    tg?.HapticFeedback.impactOccurred('medium');
    onToggleFollow?.();
  };

  const handleAlign = () => {
    tg?.HapticFeedback.impactOccurred('medium');
    onToggleAlign?.();
  };

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 pt-3">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold hover:text-white">
          <BackIcon className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-darkDeep border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <button className="w-9 h-9 rounded-full bg-darkDeep border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <div className="w-px h-5 bg-gray-700"></div>
          <button className="w-9 h-9 rounded-full bg-darkDeep border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4">
        <div className="flex gap-4 items-start">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-2 border-gray-700 shrink-0 bg-gray-800">
            <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-[22px] font-bold text-white leading-tight mb-2">{creator.name}</h2>
            <div className="flex gap-2 flex-wrap mb-2">
              {creator.verified && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#142433] text-[#9fd6ff] border border-[#24425e]">Verified Creator</span>
              )}
              {creator.club && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#241417] text-[#ffd7d7] border border-[#4a2323]">{creator.club}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-300 leading-relaxed">
          {creator.niche && <span>{creator.niche} • </span>}
          Creator since 2026
        </div>

        <div className="mt-2 text-[#4a5468] text-sm tracking-widest">
          {'★'.repeat(creator.rating || 5)}
        </div>

        {/* Stats Row */}
        <div className="flex gap-2.5 mt-5 mb-4">
          <Card className="flex-1 bg-darkCard border border-gray-800 rounded-2xl p-3 text-center">
            <p className="text-xs font-medium text-[#4da3ff] mb-1">Followers</p>
            <p className="text-xl font-bold text-white">{formatNumber(creator.followers)}</p>
          </Card>
          <Card className="flex-1 bg-darkCard border border-gray-800 rounded-2xl p-3 text-center">
            <p className="text-xs font-medium text-[#4da3ff] mb-1">Likes</p>
            <p className="text-xl font-bold text-white">{formatNumber(creator.likes || creator.stats.avgLikes * creator.stats.posts)}</p>
          </Card>
          <Card className="flex-1 bg-darkCard border border-gray-800 rounded-2xl p-3 text-center">
            <p className="text-xs font-medium text-[#4da3ff] mb-1">FTC Earned</p>
            <p className="text-xl font-bold text-white">{formatNumber(creator.ftcEarned || 0)}</p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={handleFollow}
            className={`flex-1 rounded-full py-3.5 text-base font-bold flex items-center justify-center gap-2 transition-all ${
              isFollowing
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'bg-[#2ecc71] text-[#0b1a10]'
            }`}
          >
            {isFollowing ? 'Following' : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Follow
              </>
            )}
          </button>
          <button
            onClick={handleAlign}
            className="flex-1 rounded-full py-3.5 text-base font-semibold border border-[#2c3648] text-white flex items-center justify-center gap-2 bg-transparent"
          >
            <StarIcon className="w-4 h-4 text-[#4da3ff]" filled={false} />
            Align
          </button>
        </div>
      </div>

      <div className="h-px bg-[#202836] mx-5"></div>

      {/* Recent Posts */}
      <div className="px-5">
        <h3 className="text-lg font-bold text-white mb-3">Recent posts</h3>

        {creator.recentPosts && creator.recentPosts.length > 0 ? (
          creator.recentPosts.map(post => (
            <Card key={post.id} className="bg-darkCard border border-gray-800 rounded-2xl p-4 mb-4">
              <p className="text-base font-semibold text-white leading-snug mb-3">{post.text}</p>

              {post.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-3 border border-gray-700">
                  <img src={post.imageUrl} alt="Post" className="w-full h-auto object-cover" />
                </div>
              )}

              <div className="flex items-center gap-5 text-sm">
                <div className={`flex items-center gap-1.5 ${post.likes > 0 ? 'text-[#ff5c5c]' : 'text-gray-500'}`}>
                  <HeartIcon className="w-4 h-4" filled={post.likes > 0} />
                  <span className="font-medium">{formatNumber(post.likes)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <ChatIcon className="w-4 h-4" />
                  <span className="font-medium">{formatNumber(post.comments)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <StarIcon className="w-4 h-4" filled={false} />
                  <span className="font-medium align-label">Align {formatNumber(post.aligns)}</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-darkCard border border-gray-800 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500">No posts yet</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreatorProfileScreen;

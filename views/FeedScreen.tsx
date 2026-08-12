import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

export interface FeedPost {
  id: string;
  creator: string;
  handle: string;
  avatar: string;
  club: string;
  time: string;
  content: string;
  likes: number;
  aligns: number;
  comments: number;
  liked: boolean;
  aligned: boolean;
}

const starterPosts: FeedPost[] = [
  {
    id: 'p1',
    creator: 'Marcus Hale',
    handle: '@marcusx',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    club: 'Manchester United',
    time: '12 min ago',
    content: 'Matchday mood before kick-off. A quick look at the line-up, the tempo we need, and the one thing this team must win in midfield today.',
    likes: 128,
    aligns: 34,
    comments: 11,
    liked: false,
    aligned: true,
  },
  {
    id: 'p2',
    creator: 'Nia Ortiz',
    handle: '@nortiz',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    club: 'Real Madrid',
    time: '1 hr ago',
    content: 'Watching the press trap from midfield. If we keep the ball on the half-turn, we create space for our wingers all night.',
    likes: 242,
    aligns: 50,
    comments: 18,
    liked: true,
    aligned: false,
  },
  {
    id: 'p3',
    creator: 'Theo Park',
    handle: '@theopark',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    club: 'Bayern Munich',
    time: '3 hr ago',
    content: 'The best attack starts with one smart pass and one vertical run. I am tracking that pattern all matchweek.',
    likes: 97,
    aligns: 22,
    comments: 9,
    liked: false,
    aligned: false,
  }
];

interface FeedScreenProps {
  profile?: any | null;
  backendUserId?: string | null;
  onOpenCreator?: (creatorId: string) => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ profile, backendUserId, onOpenCreator }) => {
  const [posts, setPosts] = useState<FeedPost[]>(starterPosts);

  const toggleReaction = (postId: string, type: 'like' | 'align') => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;

      if (type === 'like') {
        const nextLiked = !post.liked;
        return {
          ...post,
          likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)),
          liked: nextLiked,
        };
      }

      const nextAligned = !post.aligned;
      return {
        ...post,
        aligns: Math.max(0, post.aligns + (nextAligned ? 1 : -1)),
        aligned: nextAligned,
      };
    }));
  };

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">Social Feed</p>
          <h2 className="text-2xl font-black text-white">Chronological</h2>
        </div>
        <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-green-400 font-black">
          {posts.length} live
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-darkCard p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={profile?.avatar || 'https://picsum.photos/200'}
              alt="You"
              className="w-9 h-9 rounded-full object-cover border border-gray-700"
            />
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500">Your Feed</p>
              <p className="text-sm font-black text-white truncate">{profile?.displayName || 'Fan'}</p>
            </div>
          </div>
          <Button variant="primary" fullWidth={false} className="px-3 py-2 text-[9px] rounded-xl">Create</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {posts.map(post => (
          <Card key={post.id} className="p-4 border border-gray-800 bg-darkCard">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => onOpenCreator?.('marcus-hale')} className="shrink-0">
                <img src={post.avatar} alt={post.creator} className="w-11 h-11 rounded-full object-cover border border-green-500/30" />
              </button>
              <div className="min-w-0 flex-1">
                <button onClick={() => onOpenCreator?.('marcus-hale')} className="text-left">
                  <p className="text-sm font-black text-white truncate">{post.creator}</p>
                </button>
                <div className="flex items-center gap-2 text-[9px] text-gray-500">
                  <span>{post.handle}</span>
                  <span>•</span>
                  <span>{post.club}</span>
                  <span>•</span>
                  <span>{post.time}</span>
                </div>
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-200">{post.content}</p>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-800 pt-3">
              <button
                onClick={() => toggleReaction(post.id, 'like')}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${post.liked ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-300'}`}
              >
                <span>❤️</span>
                <span>{post.likes}</span>
              </button>

              <button
                onClick={() => toggleReaction(post.id, 'align')}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${post.aligned ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-300'}`}
              >
                <span>⭐</span>
                <span>{post.aligns}</span>
              </button>

              <button className="flex items-center gap-1.5 rounded-full bg-gray-800 px-2.5 py-1.5 text-[11px] font-bold text-gray-300">
                <span>💬</span>
                <span>{post.comments}</span>
              </button>

              <button className="flex items-center gap-1.5 rounded-full bg-gray-800 px-2.5 py-1.5 text-[11px] font-bold text-gray-300">
                <span>↗️</span>
                <span>Share</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedScreen;

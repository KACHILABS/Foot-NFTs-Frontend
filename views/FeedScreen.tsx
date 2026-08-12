import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { HeartIcon, StarIcon, ChatIcon, ShareIcon } from '../src/components/Icons';

export interface Post {
  post_id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  content: string;
  image_url?: string;
  like_count: number;
  align_count: number;
  comment_count: number;
  user_liked: boolean;
  user_aligned: boolean;
  created_at: string;
}

interface FeedScreenProps {
  profile?: any | null;
  backendUserId?: string | null;
  onOpenCreator?: (creatorId: string) => void;
}

const API_BASE = 'https://footnfts.up.railway.app/api';

const FeedScreen: React.FC<FeedScreenProps> = ({ profile, backendUserId, onOpenCreator }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    loadFeed();
    checkCreatorStatus();
  }, [backendUserId]);

  const checkCreatorStatus = async () => {
    if (!backendUserId) return;
    try {
      const res = await fetch(`${API_BASE}/creator/check/${backendUserId}`);
      const data = await res.json();
      setIsCreator(data.approved);
    } catch (error) {
      console.error('Creator check error:', error);
    }
  };

  const loadFeed = async () => {
    if (!backendUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/creator/feed?userId=${backendUserId}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Feed load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !backendUserId || !isCreator) return;

    setPosting(true);
    try {
      const res = await fetch(`${API_BASE}/creator/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: backendUserId,
          content: newPost,
          imageUrl: null
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewPost('');
        loadFeed();
        tg?.HapticFeedback.notificationOccurred('success');
      }
    } catch (error) {
      console.error('Post creation error:', error);
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string, liked: boolean) => {
    if (!backendUserId) return;
    try {
      await fetch(`${API_BASE}/creator/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: backendUserId, postId })
      });
      loadFeed();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const toggleAlign = async (postId: string, aligned: boolean) => {
    if (!backendUserId) return;
    try {
      await fetch(`${API_BASE}/creator/align`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: backendUserId, postId })
      });
      loadFeed();
    } catch (error) {
      console.error('Align error:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-800 bg-darkCard/80 backdrop-blur-md px-4 py-3 shrink-0">
        <h2 className="text-xl font-black text-white">Feed</h2>
        <p className="text-xs text-gray-500 mt-1">Follow creators to see their posts</p>
      </div>

      {/* Compose Tweet (Creator Only) */}
      {isCreator && (
        <div className="border-b border-gray-800 p-4">
          <div className="flex gap-3">
            <img
              src={profile?.avatar || 'https://picsum.photos/200'}
              alt="You"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?!"
                maxLength={280}
                className="w-full bg-transparent text-xl text-white outline-none resize-none placeholder-gray-500"
                rows={3}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {/* Icon buttons for media, etc */}
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || posting}
                  className="rounded-full px-6 py-2 text-sm"
                >
                  {posting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Loading feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-gray-500">No posts yet</p>
            <p className="text-xs text-gray-600">Follow creators to see their posts</p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.post_id}
              className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer active:bg-gray-900 group"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <button
                  onClick={() => onOpenCreator?.(post.creator_id)}
                  className="shrink-0 rounded-full overflow-hidden hover:opacity-80"
                >
                  <img
                    src={post.creator_avatar}
                    alt={post.creator_name}
                    className="w-12 h-12 object-cover"
                  />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onOpenCreator?.(post.creator_id)}
                    className="text-left hover:underline"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white truncate">{post.creator_name}</p>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500">{formatDate(post.created_at)}</span>
                    </div>
                  </button>

                  <p className="text-white mt-2 whitespace-pre-wrap break-words">{post.content}</p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="mt-3 rounded-2xl max-w-full border border-gray-700"
                    />
                  )}

                  {/* Actions */}
                  <div className="flex justify-between mt-3 text-gray-500 max-w-[425px] text-xs">
                    <button
                      onClick={() => toggleLike(post.post_id, post.user_liked)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors ${
                        post.user_liked ? 'text-red-500' : ''
                      }`}
                    >
                      <HeartIcon className="w-4 h-4" filled={post.user_liked} />
                      <span>{post.like_count}</span>
                    </button>

                    <button
                      onClick={() => toggleAlign(post.post_id, post.user_aligned)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-full hover:bg-amber-500/10 hover:text-amber-500 transition-colors ${
                        post.user_aligned ? 'text-amber-500' : ''
                      }`}
                    >
                      <StarIcon className="w-4 h-4" filled={post.user_aligned} />
                      <span>{post.align_count}</span>
                    </button>

                    <button className="flex items-center gap-2 py-2 px-3 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                      <ChatIcon className="w-4 h-4" />
                      <span>{post.comment_count}</span>
                    </button>

                    <button className="flex items-center gap-2 py-2 px-3 rounded-full hover:bg-green-500/10 hover:text-green-500 transition-colors">
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedScreen;


import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { HeartIcon, ChatIcon, ShareIcon, VerifiedIcon, BackIcon } from '../src/components/Icons';

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
  creator_verified?: boolean;
  creator_handle?: string;
}

interface FeedScreenProps {
  profile?: any | null;
  backendUserId?: string | null;
  onOpenCreator?: (creatorId: string, creatorData?: any) => void;
  onBack?: () => void;
}

const API_BASE = 'https://footnfts.up.railway.app/api';

const FeedScreen: React.FC<FeedScreenProps> = ({ profile, backendUserId, onOpenCreator, onBack }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        const normalized = (data.posts || []).map((post: any) => ({
          ...post,
          creator_verified: post.verified || false,
          creator_handle: post.creatorHandle || (post.creator_name ? '@' + post.creator_name.toLowerCase().replace(/\s+/g, '') : null)
        }));
        setPosts(normalized);
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
          imageUrl: imagePreview || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewPost('');
        setImagePreview(null);
        setImageFile(null);
        loadFeed();
        tg?.HapticFeedback.notificationOccurred('success');
      } else {
        tg?.showAlert?.(data.error || 'Failed to post');
      }
    } catch (error) {
      console.error('Post creation error:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-800 bg-[#0b0f1a]/90 backdrop-blur-md px-4 py-3 shrink-0">
        <h1 className="text-xl font-black text-white tracking-tight">Feed</h1>
        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Latest from creators</p>
      </div>

      {/* Compose Post (Creator Only) */}
      {isCreator && (
        <div className="px-4 pb-3">
          <div className="flex gap-3 items-start">
            <img
              src={profile?.avatar || 'https://picsum.photos/200'}
              alt="You"
              className="w-11 h-11 rounded-full object-cover border border-[#232b3d] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?!"
                maxLength={280}
                className="w-full bg-transparent text-base text-white outline-none resize-none placeholder-[#8a94a6] leading-relaxed"
                rows={2}
              />
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 object-cover border border-[#232b3d]" />
                  <button
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#141a29] rounded-full flex items-center justify-center text-[#8a94a6] text-xs border border-[#232b3d]"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <label className="w-9 h-9 rounded-full bg-[#4a90e2]/10 flex items-center justify-center text-[#4a90e2] cursor-pointer hover:bg-[#4a90e2]/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || posting}
                  className="rounded-full px-5 py-1.5 text-sm font-bold bg-[#4a90e2] text-white hover:bg-[#4a90e2]/90"
                >
                  {posting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-[14px] pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#4a90e2] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-[#141a29] flex items-center justify-center text-2xl border border-[#232b3d]">📝</div>
            <p className="text-sm font-bold text-[#8a94a6]">No posts yet</p>
            <p className="text-xs text-[#8a94a6]/60 max-w-[200px]">Follow creators to see their posts here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {posts.map(post => (
              <Card key={post.post_id} className="bg-[#141a29] border border-[#232b3d] rounded-[18px] p-4">
                {/* Post Header */}
                <div className="flex gap-2.5 items-start">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#2c3345] flex items-center justify-center overflow-hidden">
                      {post.creator_avatar ? (
                        <img src={post.creator_avatar} alt={post.creator_name} className="w-full h-full object-cover" />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#8a94a6]"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-[2px] bg-black rounded-md p-[2px_4px]">
                      <span className="w-[3px] h-[3px] rounded-full bg-white"></span>
                      <span className="w-[3px] h-[3px] rounded-full bg-white"></span>
                      <span className="w-[3px] h-[3px] rounded-full bg-white"></span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onOpenCreator?.(post.creator_id)}
                        className="text-left hover:underline"
                      >
                        <span className="font-bold text-[#f2f4f8] text-[15px]">{post.creator_name}</span>
                      </button>
                      {post.creator_verified && (
                        <VerifiedIcon className="w-3.5 h-3.5 text-[#4a90e2] shrink-0" />
                      )}
                      <span className="bg-[#3a3f4b] text-[#f2f4f8] text-[11px] font-bold px-2.5 py-[3px] rounded-full tracking-wide uppercase">Live</span>
                    </div>
                    <div className="text-[13px] text-[#8a94a6] mt-0.5 leading-snug">
                      {post.creator_handle} · Verified Creator
                    </div>
                  </div>
                </div>

                {/* Post Body */}
                <p className="text-[15px] text-[#f2f4f8] leading-[1.45] mt-3 whitespace-pre-wrap break-words">{post.content}</p>

                {/* Post Image / Tactics */}
                {post.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-[#232b3d] bg-[#05070c]">
                    <img
                      src={post.image_url}
                      alt="Post media"
                      className="w-full max-h-[400px] object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-3 text-[#8a94a6]">
                  <button
                    onClick={() => toggleLike(post.post_id, post.user_liked)}
                    className={`flex items-center gap-1.5 group transition-colors ${
                      post.user_liked ? 'text-[#e0455f]' : 'hover:text-[#e0455f]'
                    }`}
                  >
                    <HeartIcon className="w-[18px] h-[18px]" filled={post.user_liked} />
                    <span className="text-[14px] font-medium">{formatCount(post.like_count)}</span>
                  </button>

                  <button className="flex items-center gap-1.5 text-[#8a94a6] hover:text-[#4a90e2] transition-colors group">
                    <ChatIcon className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-medium">{formatCount(post.comment_count)}</span>
                  </button>

                  <button className="flex items-center gap-1.5 text-[#8a94a6] hover:text-[#4ade80] transition-colors group">
                    <ShareIcon className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-medium">{formatCount(post.align_count)}</span>
                  </button>

                  <button
                    onClick={() => toggleAlign(post.post_id, post.user_aligned)}
                    className={`flex items-center gap-1.5 ml-auto transition-colors ${
                      post.user_aligned ? 'text-[#4ade80]' : 'text-[#8a94a6] hover:text-[#4ade80]'
                    }`}
                  >
                    <span className="bg-[#1c2333] text-[#f2f4f8] text-[12px] font-semibold px-3 py-[5px] rounded-full">
                      Align {formatCount(post.align_count)}
                    </span>
                  </button>
                </div>

                {/* Footnote */}
                <p className="text-[12.5px] text-[#8a94a6] mt-2.5 leading-relaxed">
                  Visible instantly to all followers and community members
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedScreen;

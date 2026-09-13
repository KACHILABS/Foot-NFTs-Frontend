import React, { useState, useEffect } from 'react';
import { HeartIcon, ChatIcon, VerifiedIcon, PlusIcon, CloseIcon, ImageIcon, SendIcon, StarIcon } from '../src/components/Icons';

export interface Post {
  post_id: string;
  creator_id: string;
  creator_user_id?: string | null;
  creator_name: string;
  creator_avatar: string;
  creator_handle?: string | null;
  creator_followers?: number;
  creator_post_count?: number;
  content: string;
  image_url?: string;
  like_count: number;
  align_count: number;
  comment_count: number;
  user_liked: boolean;
  user_aligned: boolean;
  is_following?: boolean;
  created_at: string;
  creator_verified?: boolean;
  club?: string;
  niche?: string;
}

interface FeedScreenProps {
  profile?: any | null;
  backendUserId?: string | null;
  onOpenCreator?: (creatorId: string, creatorData?: any) => void;
  onBack?: () => void;
}

interface CommentItem {
  id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  user_handle?: string | null;
}

const API_BASE = 'https://footnfts.up.railway.app/api';

const FeedScreen: React.FC<FeedScreenProps> = ({ profile, backendUserId, onOpenCreator }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  // Composer (Facebook-style modal)
  const [showComposer, setShowComposer] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Comments modal
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const PREVIEW_LIMIT = 160;
  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };
  const [commenting, setCommenting] = useState(false);

  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    loadFeed();
    checkCreatorStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUserId]);

  const checkCreatorStatus = async () => {
    if (!backendUserId) return;
    try {
      const res = await fetch(`${API_BASE}/creator/check/${backendUserId}`);
      const data = await res.json();
      setIsCreator(!!data.approved);
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
          creator_followers: post.creator_followers || 0,
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

  const openComposer = () => {
    tg?.HapticFeedback?.selectionChanged?.();
    setShowComposer(true);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setNewPost('');
    setImagePreview(null);
    setImageFile(null);
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
          content: newPost.trim(),
          imageUrl: imagePreview || null
        })
      });
      const data = await res.json();
      if (data.success) {
        closeComposer();
        loadFeed();
        tg?.HapticFeedback?.notificationOccurred?.('success');
      } else {
        tg?.showAlert?.(data.error || 'Failed to post');
      }
    } catch (error) {
      console.error('Post creation error:', error);
    } finally {
      setPosting(false);
    }
  };
  const toggleAlign = async (postId: string, aligned: boolean) => {
    if (!backendUserId) return;
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.post_id === postId
        ? { ...p, user_aligned: !aligned, align_count: Math.max(0, p.align_count + (aligned ? -1 : 1)) }
        : p
    ));
    try {
      const res = await fetch(`${API_BASE}/creator/align`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: backendUserId, postId })
      });
      const data = await res.json();
      if (!data.success) throw new Error('Align failed');
      tg?.HapticFeedback?.impactOccurred?.('light');
    } catch (error) {
      console.error('Align error:', error);
      // Revert
      setPosts(prev => prev.map(p =>
        p.post_id === postId
          ? { ...p, user_aligned: aligned, align_count: Math.max(0, p.align_count + (aligned ? 1 : -1)) }
          : p
      ));
    }
  };

const toggleLike = async (postId: string, liked: boolean) => {
    if (!backendUserId) return;
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.post_id === postId
        ? { ...p, user_liked: !liked, like_count: Math.max(0, p.like_count + (liked ? -1 : 1)) }
        : p
    ));
    try {
      await fetch(`${API_BASE}/creator/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: backendUserId, postId })
      });
    } catch (error) {
      console.error('Like error:', error);
      // Revert
      setPosts(prev => prev.map(p =>
        p.post_id === postId
          ? { ...p, user_liked: liked, like_count: Math.max(0, p.like_count + (liked ? 1 : -1)) }
          : p
      ));
    }
  };

  const toggleFollow = async (post: Post) => {
    if (!backendUserId || !post.creator_id) return;
    const wasFollowing = !!post.is_following;
    setPosts(prev => prev.map(p =>
      p.creator_id === post.creator_id
        ? {
            ...p,
            is_following: !wasFollowing,
            creator_followers: Math.max(0, (p.creator_followers || 0) + (wasFollowing ? -1 : 1))
          }
        : p
    ));
    try {
      const res = await fetch(`${API_BASE}/creator/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: backendUserId, creatorId: post.creator_id })
      });
      const data = await res.json().catch(() => null);
      if (data?.success && typeof data.follower_count === 'number') {
        setPosts(prev => prev.map(p =>
          p.creator_id === post.creator_id
            ? { ...p, is_following: !!data.following, creator_followers: data.follower_count }
            : p
        ));
      }
      tg?.HapticFeedback?.impactOccurred?.('light');
    } catch (error) {
      console.error('Follow error:', error);
      // Revert
      setPosts(prev => prev.map(p =>
        p.creator_id === post.creator_id
          ? {
              ...p,
              is_following: wasFollowing,
              creator_followers: Math.max(0, (p.creator_followers || 0) + (wasFollowing ? 1 : -1))
            }
          : p
      ));
    }
  };

  const openCreatorProfile = (post: Post) => {
    tg?.HapticFeedback?.selectionChanged?.();
    const creatorPosts = posts
      .filter(p => p.creator_id === post.creator_id)
      .map(p => ({
        id: p.post_id,
        text: p.content,
        imageUrl: p.image_url,
        likes: p.like_count,
        comments: p.comment_count,
        aligns: p.align_count
      }));
    onOpenCreator?.(post.creator_id, {
      id: post.creator_id,
      name: post.creator_name,
      handle: post.creator_handle || (post.creator_name ? '@' + post.creator_name.toLowerCase().replace(/\s+/g, '') : ''),
      club: post.club || '',
      niche: post.niche || '',
      avatar: post.creator_avatar,
      followers: post.creator_followers || 0,
      verified: (post as any).creator_verified ?? (post as any).verified ?? false,
      is_following: !!post.is_following,
      creator_id: post.creator_id,
      creator_user_id: post.creator_user_id || null,
      stats: { posts: post.creator_post_count || creatorPosts.length, avgLikes: 0, engagement: '0%' },
      bio: '',
      recentPosts: creatorPosts
    });
  };

  const openComments = async (post: Post) => {
    tg?.HapticFeedback?.selectionChanged?.();
    setActiveCommentPost(post);
    setComments([]);
    setCommentLoading(true);
    setCommentText('');
    try {
      const res = await fetch(`${API_BASE}/creator/comments/${post.post_id}`);
      const data = await res.json();
      if (data.success) setComments(data.comments || []);
    } catch (error) {
      console.error('Comments load error:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const closeComments = () => {
    setActiveCommentPost(null);
    setComments([]);
    setCommentText('');
  };

  const submitComment = async () => {
    if (!backendUserId || !activeCommentPost || !commentText.trim()) return;
    const content = commentText.trim();
    setCommenting(true);
    try {
      const res = await fetch(`${API_BASE}/creator/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: backendUserId, postId: activeCommentPost.post_id, content })
      });
      const data = await res.json();
      if (data.success) {
        const newComment: CommentItem = {
          id: data.comment?.id || Math.random().toString(36).substring(2),
          content,
          created_at: new Date().toISOString(),
          user_name: profile?.displayName,
          user_avatar: profile?.avatar,
          user_handle: null
        };
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        setPosts(prev => prev.map(p =>
          p.post_id === activeCommentPost.post_id
            ? { ...p, comment_count: p.comment_count + 1 }
            : p
        ));
        tg?.HapticFeedback?.notificationOccurred?.('success');
      } else {
        tg?.showAlert?.(data.error || 'Failed to comment');
      }
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setCommenting(false);
    }
  };
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return count.toString();
  };

  const renderAvatar = (src: string | undefined, alt: string, outerClass: string) => (
    <div className={`${outerClass} rounded-full bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center shrink-0`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#8a94a6]">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </div>
  );

  const renderPostText = (text: string, postId: string) => {
    if (!text) return null;
    const expanded = !!expandedPosts[postId];
    if (text.length <= PREVIEW_LIMIT || expanded) {
      return (
        <p className="text-[15px] leading-[1.45] text-[#e7e9ee] whitespace-pre-wrap break-words">
          {text}
          {text.length > PREVIEW_LIMIT && (
            <button onClick={() => toggleExpanded(postId)} className="ml-1 text-[#8a94a6] hover:text-white font-semibold">
              See less
            </button>
          )}
        </p>
      );
    }
    return (
      <p className="text-[15px] leading-[1.45] text-[#e7e9ee] whitespace-pre-wrap break-words">
        {text.slice(0, PREVIEW_LIMIT)}...{' '}
        <button onClick={() => toggleExpanded(postId)} className="text-white font-bold hover:underline">
          See more
        </button>
      </p>
    );
  };

  const renderPost = (post: Post) => {
    const isOwnPost = !!backendUserId && !!post.creator_user_id && post.creator_user_id === backendUserId;
    return (
      <div key={post.post_id} className="px-4 py-3 hover:bg-white/[0.015] transition-colors">
        <div className="flex gap-3">
          {/* Avatar */}
          <button onClick={() => openCreatorProfile(post)} className="shrink-0 mt-0.5" aria-label="Open creator profile">
            {renderAvatar(post.creator_avatar, post.creator_name || 'creator', 'w-10 h-10')}
          </button>

          <div className="flex-1 min-w-0">
            {/* Author row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => openCreatorProfile(post)} className="text-left">
                <span className="text-[15px] font-bold text-white hover:underline">{post.creator_name}</span>
              </button>
              {post.creator_verified && <VerifiedIcon className="w-4 h-4 text-[#1d9bf0] shrink-0" />}
              <span className="text-[13px] text-[#5b6472] truncate">
                {post.creator_handle} · {formatDate(post.created_at)}
              </span>
              {!isOwnPost && (
                <button
                  onClick={() => toggleFollow(post)}
                  className={`ml-auto shrink-0 rounded-full px-3.5 py-1 text-[12px] font-bold transition-colors ${
                    post.is_following
                      ? 'border border-white/15 text-white bg-transparent hover:bg-white/[0.06]'
                      : 'bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]'
                  }`}
                >
                  {post.is_following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Followers + niche */}
            <div className="text-[12px] text-[#5b6472] mt-0.5 truncate">
              {formatCount(post.creator_followers || 0)} follower{post.creator_followers === 1 ? '' : 's'}{post.niche ? ` · ${post.niche}` : ''}
            </div>

            {/* Content */}
            <div className="mt-1.5">{renderPostText(post.content, post.post_id)}</div>

            {/* Media */}
            {post.image_url && (
              <div className="mt-2.5 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
                <img
                  src={post.image_url}
                  alt="Post media"
                  className="w-full max-h-[360px] object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Actions: comment + like (no download/share button) */}
            <div className="mt-2 flex items-center gap-1 max-w-[340px]">
              <button
                onClick={() => openComments(post)}
                className="flex-1 flex items-center gap-2 py-1 text-[#5b6472] hover:text-[#1d9bf0] transition-colors"
              >
                <ChatIcon className="w-[18px] h-[18px]" />
                <span className="text-[13px] font-semibold">{formatCount(post.comment_count)}</span>
              </button>
              <button
                onClick={() => toggleLike(post.post_id, post.user_liked)}
                className={`flex-1 flex items-center gap-2 py-1 transition-colors ${
                  post.user_liked ? 'text-[#f4212e]' : 'text-[#5b6472] hover:text-[#f4212e]'
                }`}
              >
                <HeartIcon className="w-[18px] h-[18px]" filled={post.user_liked} />
                <span className="text-[13px] font-semibold">{formatCount(post.like_count)}</span>
              </button>
              <button
                onClick={() => toggleAlign(post.post_id, post.user_aligned)}
                className={`flex-1 flex items-center gap-2 py-1 transition-colors ${
                  post.user_aligned ? 'text-[#4da3ff]' : 'text-[#5b6472] hover:text-[#4da3ff]'
                }`}
              >
                <StarIcon className="w-[18px] h-[18px]" filled={post.user_aligned} />
                <span className="text-[13px] font-semibold">{formatCount(post.align_count)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderComposerModal = () => {
    return (
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/70" onClick={closeComposer} />
        <div className="relative w-full sm:max-w-[520px] bg-[#151c2a] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button onClick={closeComposer} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8a94a6] hover:bg-white/10 hover:text-white" aria-label="Close composer">
              <CloseIcon className="w-5 h-5" />
            </button>
            <p className="text-[15px] font-extrabold text-white">New post</p>
            <button onClick={handleCreatePost} disabled={!newPost.trim() || posting || !isCreator} className="rounded-full px-4 py-1.5 text-[13px] font-bold bg-[#1d9bf0] text-white disabled:opacity-40">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
          <div className="p-4 max-h-[65vh] overflow-y-auto">
            <div className="flex gap-3">
              {renderAvatar(profile?.avatar, 'You', 'w-10 h-10')}
              <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's happening?" rows={4} maxLength={280} className="flex-1 bg-transparent text-[15px] text-white placeholder-[#5b6472] outline-none resize-none leading-relaxed" autoFocus />
            </div>
            {imagePreview && (
              <div className="mt-3 ml-[52px] relative rounded-2xl overflow-hidden border border-white/10">
                <img src={imagePreview} alt="Upload preview" className="w-full max-h-[240px] object-cover" />
                <button onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center" aria-label="Remove image">
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="mt-3 ml-[52px] flex items-center justify-between border-t border-white/10 pt-3">
              <label className="flex items-center gap-2 text-[#1d9bf0] text-[13px] font-bold cursor-pointer">
                <ImageIcon className="w-5 h-5" />
                <span>Add photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <span className="text-[12px] text-[#5b6472] font-semibold">{newPost.length}/280</span>
            </div>
            {!isCreator && (
              <p className="mt-3 ml-[52px] text-[12px] text-[#8a94a6] bg-white/5 border border-white/10 rounded-xl px-3 py-2">Only approved creators can post.</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderCommentsModal = () => {
    if (!activeCommentPost) return null;
    return (
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/70" onClick={closeComments} />
        <div className="relative w-full sm:max-w-[520px] bg-[#151c2a] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button onClick={closeComments} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8a94a6] hover:bg-white/10 hover:text-white" aria-label="Close comments">
              <CloseIcon className="w-5 h-5" />
            </button>
            <p className="text-[15px] font-extrabold text-white">Comments</p>
            <div className="w-8" />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {commentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] font-bold text-[#8a94a6]">No comments yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 py-3">
                    {renderAvatar(c.user_avatar, c.user_name || 'user', 'w-8 h-8')}
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-bold text-white">{c.user_name || 'Fan'}</span>
                      <p className="text-[14px] text-[#e7e9ee] mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Post your reply" maxLength={280} className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[14px] text-white outline-none" />
              <button onClick={submitComment} disabled={!commentText.trim() || commenting} className="w-9 h-9 rounded-full bg-[#1d9bf0] text-white flex items-center justify-center disabled:opacity-40" aria-label="Send comment">
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };




return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Sticky feed header */}
      <div className="border-b border-white/5 bg-[#0b0f1a]/95 backdrop-blur-md shrink-0">
        <div className="px-4 pt-2.5 pb-1">
          <h1 className="text-xl font-black text-white tracking-tight">Feed</h1>
        </div>

        {/* Thin compose row: avatar + "What's happening?" + add icon */}
        <div className="px-4 pb-2.5">
          <div className="flex items-center gap-3">
            {renderAvatar(profile?.avatar, 'You', 'w-9 h-9')}
            <button
              onClick={openComposer}
              className="flex-1 min-w-0 text-left rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] text-[#8a94a6] hover:border-[#1d9bf0]/50 hover:bg-white/10 transition-colors truncate"
            >
              What's happening?
            </button>
            <button
              onClick={openComposer}
              aria-label="Create post"
              className="w-9 h-9 shrink-0 rounded-full bg-[#1d9bf0] text-white flex items-center justify-center hover:bg-[#1a8cd8] active:scale-95 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div className="pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10">📝</div>
            <p className="text-sm font-bold text-[#8a94a6]">No posts yet</p>
            <p className="text-xs text-[#8a94a6]/60 max-w-[220px]">Follow creators to see their posts here</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {posts.map(post => renderPost(post))}
          </div>
        )}
      </div>

      {showComposer && renderComposerModal()}
      {activeCommentPost && renderCommentsModal()}
    </div>
  );
};

export default FeedScreen;
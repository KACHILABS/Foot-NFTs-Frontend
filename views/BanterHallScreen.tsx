import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';
import { CLUBS } from '../constants';

// COUNTRY HASHTAG LIST
const COUNTRY_NAMES = new Set([
  'nigeria', 'ghana', 'england', 'france', 'brazil', 'argentina', 'spain', 'germany',
  'portugal', 'italy', 'netherlands', 'belgium', 'croatia', 'senegal', 'cameroon',
  'morocco', 'egypt', 'southafrica', 'usa', 'mexico', 'colombia', 'chile', 'uruguay',
  'japan', 'southkorea', 'australia', 'iran', 'saudiarabia', 'qatar', 'turkey',
  'poland', 'sweden', 'denmark', 'switzerland', 'austria', 'scotland', 'wales',
  'ireland', 'algeria', 'tunisia', 'cotedivoire', 'mali', 'kenya', 'ethiopia',
  'angola', 'zambia', 'zimbabwe', 'tanzania', 'uganda', 'rwanda',
]);

const EMOJI_REACTIONS = ['👍', '🔥', '😂', '❤️', '👏', '💀', '🏆', '⚽'];

interface Reaction { emoji: string; user_id: string; }
interface BanterMessage {
  id: string;
  userId: string;
  senderName: string;
  senderAvatar: string | null;
  favoriteClubId: string | null;
  content: string;
  clubTag: string | null;
  votes: number;
  createdAt: string;
  isMe: boolean;
  reactions: Reaction[];
}
interface ReplyTarget { id: string; senderName: string; content: string; }
interface OnlineUser { id: string; username: string; avatar: string | null; }

interface BanterHallScreenProps {
  profile: UserProfile | null;
  onBack: () => void;
  onEarn: (amount: number, reason: string) => void;
  onBanterNotify?: (message: string, senderName: string) => void;
  backendUserId?: string | null;
}

const API_BASE = 'https://footnfts.up.railway.app/api';
const POLL_INTERVAL = 30000;
const MIN_MESSAGE_LENGTH = 15;
const LONG_PRESS_MS = 500;

// Helper to get club logo
const getClubLogo = (clubId: string | null) => {
  if (!clubId) return null;
  const club = CLUBS.find(c => c.id === clubId);
  return club?.badge || null;
};

const BanterHallScreen: React.FC<BanterHallScreenProps> = ({
  profile,
  onBack,
  onEarn,
  onBanterNotify,
  backendUserId,
}) => {
  const [messages, setMessages] = useState<BanterMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardLabel, setRewardLabel] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [votingPostIds, setVotingPostIds] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [countryEarnedToday, setCountryEarnedToday] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCount = useRef(0);
  const hasScrolledToBottom = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    if (tg) { tg.expand(); tg.disableVerticalSwipes?.(); }
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem('banter_country_tag_date') === today) setCountryEarnedToday(true);
  }, []);

  useEffect(() => { setCharCount(inputText.trim().length); }, [inputText]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/banter/feed?limit=20`);
      const data = await res.json();
      if (data.success && data.posts) {
        const formatted: BanterMessage[] = data.posts.map((post: any) => ({
          id: post.id,
          userId: post.user_id,
          senderName: (post.user?.username && post.user.username !== 'User')
            ? post.user.username : `Fan_${post.user?.telegram_id}`,
          senderAvatar: post.user?.avatar || null,
          favoriteClubId: post.user?.favorite_club_id || null,
          content: post.content,
          clubTag: post.club_tag,
          votes: post.votes_received || 0,
          createdAt: post.created_at,
          isMe: post.user_id === backendUserId,
          reactions: post.reactions || [],
        }));
        if (lastMessageCount.current > 0 && formatted.length > lastMessageCount.current) {
          formatted.slice(lastMessageCount.current).forEach((msg) => {
            if (!msg.isMe && onBanterNotify) {
              onBanterNotify(msg.content, msg.senderName);
              tg?.HapticFeedback?.impactOccurred('light');
            }
          });
        }
        lastMessageCount.current = formatted.length;
        setMessages(formatted);
      }
    } catch (e) { console.error('Failed to load messages:', e); }
    finally { setLoading(false); }
  }, [backendUserId, onBanterNotify, tg]);

  const loadOnlineUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/banter/online`);
      const data = await res.json();
      if (data.success) setOnlineUsers(data.onlineUsers || []);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadMessages();
    loadOnlineUsers();
    const mi = setInterval(loadMessages, POLL_INTERVAL);
    const oi = setInterval(loadOnlineUsers, 30000);
    return () => { clearInterval(mi); clearInterval(oi); };
  }, [loadMessages, loadOnlineUsers]);

  useEffect(() => {
    if (!loading && messages.length > 0 && !hasScrolledToBottom.current) {
      hasScrolledToBottom.current = true;
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [loading, messages]);

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  useEffect(() => {
    if (!hasScrolledToBottom.current || !isNearBottom()) return;
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, [messages, isNearBottom]);

  const formatTime = (ds: string) => {
    try {
      const d = new Date(ds.endsWith('Z') ? ds : `${ds}Z`);
      const m = Math.floor((Date.now() - d.getTime()) / 60000);
      const h = Math.floor(m / 60), day = Math.floor(h / 24);
      if (m < 1) return 'Just now';
      if (m === 1) return '1 min ago';
      if (m < 60) return `${m} mins ago`;
      if (h === 1) return '1 hr ago';
      if (h < 24) return `${h} hrs ago`;
      if (day === 1) return 'Yesterday';
      return `${day} days ago`;
    } catch { return 'Just now'; }
  };

  const parseReply = (content: string) => {
    const match = content.match(/^\[Reply to (.+?): "(.+?)"\] ([\s\S]*)$/);
    if (match) return { replyPart: `${match[1]}: ${match[2]}`, mainPart: match[3] };
    return { replyPart: null, mainPart: content };
  };

  const getProgressColor = () =>
    charCount >= MIN_MESSAGE_LENGTH ? '#22c55e' : charCount >= 10 ? '#eab308' : '#ef4444';

  const detectCountryTag = (text: string): string | null => {
    const matches = text.toLowerCase().match(/#([a-z]+)/g);
    if (!matches) return null;
    for (const m of matches) {
      const c = m.slice(1);
      if (COUNTRY_NAMES.has(c)) return c;
    }
    return null;
  };

  const addBanterTag = () => {
    if (inputText.toLowerCase().includes('#banter')) { tg?.HapticFeedback?.notificationOccurred('warning'); return; }
    setInputText(prev => prev ? `${prev} #banter` : '#banter');
    inputRef.current?.focus();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  const showToast = (amount: number, label: string) => {
    setRewardAmount(amount); setRewardLabel(label);
    setShowRewardToast(true);
    setTimeout(() => setShowRewardToast(false), 2500);
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || text.length < MIN_MESSAGE_LENGTH || sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const isBanter = text.toLowerCase().includes('#banter');
      const countryTag = detectCountryTag(text);
      const finalContent = replyTarget
        ? `[Reply to ${replyTarget.senderName}: "${replyTarget.content.slice(0, 40)}${replyTarget.content.length > 40 ? '...' : ''}"] ${text}`
        : text;

      const res = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: backendUserId, content: finalContent, clubTag: null }),
      });
      const data = await res.json();
      if (data.success) {
        setInputText(''); setCharCount(0); setReplyTarget(null);
        if (isBanter) { showToast(2, '+2 FTC for #banter!'); onEarn(2, 'banter'); tg?.HapticFeedback?.notificationOccurred('success'); }
        if (countryTag && !countryEarnedToday) {
          try {
            const ctRes = await fetch(`${API_BASE}/banter/country-tag`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ userId: backendUserId, country: countryTag }),
            });
            const ctData = await ctRes.json();
            if (ctData.success) {
              showToast(3, `+3 FTC for #${countryTag}!`);
              onEarn(3, 'country_tag');
              setCountryEarnedToday(true);
              localStorage.setItem('banter_country_tag_date', new Date().toISOString().split('T')[0]);
              tg?.HapticFeedback?.notificationOccurred('success');
            }
          } catch (_) {}
        }
        await loadMessages();
        inputRef.current?.focus();
      } else { tg?.showAlert?.(data.error || 'Failed to send'); }
    } catch (e) { tg?.showAlert?.('Network error. Please try again.'); }
    finally { setSending(false); }
  };

  const handleVote = async (postId: string, authorId: string) => {
    if (authorId === backendUserId) { tg?.showAlert?.("You can't vote on your own banter!"); return; }
    if (votingPostIds.has(postId)) return;
    setVotingPostIds(prev => new Set(prev).add(postId));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/banter/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId, voterId: backendUserId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(3, '+3 FTC for voting!'); onEarn(3, 'voting');
        tg?.HapticFeedback?.notificationOccurred('success'); loadMessages();
      } else {
        setVotingPostIds(prev => { const s = new Set(prev); s.delete(postId); return s; });
        tg?.showAlert?.(data.error || 'Failed to vote');
      }
    } catch (e) { setVotingPostIds(prev => { const s = new Set(prev); s.delete(postId); return s; }); }
  };

  const handleReact = async (postId: string, emoji: string) => {
    setEmojiPickerFor(null);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/banter/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId, userId: backendUserId, emoji }),
      });
      tg?.HapticFeedback?.impactOccurred('medium');
      loadMessages();
    } catch (_) {}
  };

  const onLongPressStart = (msgId: string) => {
    longPressTimer.current = setTimeout(() => {
      tg?.HapticFeedback?.impactOccurred('heavy');
      setEmojiPickerFor(msgId);
    }, LONG_PRESS_MS);
  };
  const onLongPressEnd = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  const handleReply = (msg: BanterMessage) => {
    setReplyTarget({ id: msg.id, senderName: msg.senderName, content: msg.content });
    inputRef.current?.focus();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  const aggregateReactions = (reactions: Reaction[]) => {
    const map: Record<string, { count: number; isMine: boolean }> = {};
    for (const r of reactions) {
      if (!map[r.emoji]) map[r.emoji] = { count: 0, isMine: false };
      map[r.emoji].count++;
      if (r.user_id === backendUserId) map[r.emoji].isMine = true;
    }
    return Object.entries(map).map(([emoji, v]) => ({ emoji, ...v }));
  };

  if (loading) return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="bh-root">
        <div className="bh-header">
          <button className="bh-back-btn" onClick={onBack}><ChevronLeft /></button>
          <div className="bh-avatar">💬</div>
          <div className="bh-header-info">
            <span className="bh-title">Banter Hall</span>
            <span className="bh-subtitle">Global Fan Chat</span>
          </div>
        </div>
        <div className="bh-loading"><div className="bh-spinner" /><p className="bh-loading-text">Loading messages...</p></div>
      </div>
    </>
  );

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="bh-root" onClick={() => emojiPickerFor && setEmojiPickerFor(null)}>

        {showRewardToast && (
          <div className="bh-toast"><span>🎉</span><span className="bh-toast-text">{rewardLabel}</span></div>
        )}

        {/* HEADER */}
        <div className="bh-header">
          <button className="bh-back-btn" onClick={onBack}><ChevronLeft /></button>
          <div className="bh-avatar">💬</div>
          <div className="bh-header-info">
            <span className="bh-title">Banter Hall</span>
            <span className="bh-subtitle">🔥 Live • {messages.length} msgs</span>
          </div>
          <div className="bh-online-stack">
            {onlineUsers.slice(0, 3).map((u, i) => (
              <div key={u.id} className="bh-mini-avatar" style={{ zIndex: 3 - i }}>
                {u.avatar ? <img src={u.avatar} alt={u.username} className="bh-mini-avatar-img" /> : <span>👤</span>}
              </div>
            ))}
            {onlineUsers.length > 3 && (
              <div className="bh-mini-avatar bh-mini-overflow">+{onlineUsers.length - 3}</div>
            )}
            {onlineUsers.length > 0 && (
              <span className="bh-online-label">{onlineUsers.length} online</span>
            )}
          </div>
        </div>

        {/* BANNER */}
        <div className="bh-banner">
          <span className="bh-banner-text">
            💡 <strong>#banter</strong> +2 FTC • <strong>#nigeria</strong> +3 FTC • Vote +3 FTC • Long-press to react
          </span>
        </div>

        {/* MESSAGES */}
        <div className="bh-messages" ref={scrollRef} onScroll={() => setShowScrollBtn(!isNearBottom())}>
          {messages.length === 0 ? (
            <div className="bh-empty">
              <div className="bh-empty-icon">💬</div>
              <p className="bh-empty-title">No banter yet!</p>
              <p className="bh-empty-sub">Be the first to start the conversation</p>
            </div>
          ) : messages.map((msg) => {
            const { replyPart, mainPart } = parseReply(msg.content);
            const aggReactions = aggregateReactions(msg.reactions);
            const isPickerOpen = emojiPickerFor === msg.id;
            const ct = detectCountryTag(mainPart);
            const clubLogo = getClubLogo(msg.favoriteClubId);
            return (
              <div key={msg.id} className={`bh-msg-row ${msg.isMe ? 'me' : 'them'}`}>
                <div className={`bh-msg-group ${msg.isMe ? 'me' : 'them'}`}>
                  {!msg.isMe && (
                    <div className="bh-sender-avatar-wrap">
                      {msg.senderAvatar
                        ? <img src={msg.senderAvatar} alt={msg.senderName} className="bh-sender-avatar-img" />
                        : <div className="bh-sender-avatar">👤</div>}
                    </div>
                  )}
                  <div className="bh-msg-col">
                    {!msg.isMe && (
                      <div className="flex items-center gap-1.5 mb-1">
                        {/* Club Logo - NEW */}
                        {clubLogo && (
                          <img 
                            src={clubLogo} 
                            className="w-4 h-4 rounded-full object-contain" 
                            alt="club"
                          />
                        )}
                        <span className="bh-sender-name">{msg.senderName}</span>
                      </div>
                    )}

                    <div
                      className={`bh-bubble ${msg.isMe ? 'me' : 'them'}`}
                      onDoubleClick={() => handleReply(msg)}
                      onTouchStart={() => onLongPressStart(msg.id)}
                      onTouchEnd={onLongPressEnd}
                      onTouchCancel={onLongPressEnd}
                      onMouseDown={() => onLongPressStart(msg.id)}
                      onMouseUp={onLongPressEnd}
                      onMouseLeave={onLongPressEnd}
                    >
                      {replyPart && (
                        <div className="bh-reply-preview">
                          <span className="bh-reply-preview-text">↩ {replyPart}</span>
                        </div>
                      )}
                      <p className="bh-bubble-text">{mainPart}</p>
                      {mainPart.toLowerCase().includes('#banter') && <span className="bh-banter-badge">🔥 #banter</span>}
                      {ct && <span className="bh-country-badge">🌍 #{ct}</span>}
                    </div>

                    {/* WhatsApp-style reactions under the message */}
                    {aggReactions.length > 0 && (
                      <div className={`bh-reactions ${msg.isMe ? 'me' : ''}`}>
                        {aggReactions.map(r => (
                          <button 
                            key={r.emoji} 
                            className={`bh-reaction-chip ${r.isMine ? 'mine' : ''}`} 
                            onClick={() => handleReact(msg.id, r.emoji)}
                            onDoubleClick={(e) => e.stopPropagation()}
                          >
                            <span className="bh-reaction-emoji">{r.emoji}</span>
                            {r.count > 1 && <span className="bh-reaction-count">{r.count}</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Emoji picker on long press */}
                    {isPickerOpen && (
                      <div className={`bh-emoji-picker ${msg.isMe ? 'me' : 'them'}`} onClick={e => e.stopPropagation()}>
                        {EMOJI_REACTIONS.map(emoji => (
                          <button key={emoji} className="bh-emoji-btn" onClick={() => handleReact(msg.id, emoji)}>{emoji}</button>
                        ))}
                      </div>
                    )}

                    <div className={`bh-meta ${msg.isMe ? 'me' : ''}`}>
                      <span className="bh-time">{formatTime(msg.createdAt)}</span>
                      <button className="bh-reply-btn" onClick={() => handleReply(msg)}>↩ Reply</button>
                      {!msg.isMe && (
                        <button className={`bh-vote-btn ${votingPostIds.has(msg.id) ? 'voted' : ''}`} onClick={() => handleVote(msg.id, msg.userId)} disabled={votingPostIds.has(msg.id)}>
                          🔥 {msg.votes > 0 && <span className="bh-votes">({msg.votes})</span>}
                          <span className="bh-vote-earn">+3</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="bh-msg-row me">
              <div className="bh-typing">
                <div className="bh-dot" style={{ animationDelay: '0s' }} />
                <div className="bh-dot" style={{ animationDelay: '0.15s' }} />
                <div className="bh-dot" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
        </div>

        {showScrollBtn && (
          <button className="bh-scroll-btn" onClick={() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setShowScrollBtn(false);
          }}>↓ Latest</button>
        )}

        {/* INPUT AREA */}
        <div className="bh-input-area">
          {replyTarget && (
            <div className="bh-reply-strip">
              <div className="bh-reply-strip-info">
                <span className="bh-reply-strip-name">↩ Replying to {replyTarget.senderName}</span>
                <span className="bh-reply-strip-content">{replyTarget.content.slice(0, 60)}{replyTarget.content.length > 60 ? '...' : ''}</span>
              </div>
              <button className="bh-reply-close" onClick={() => setReplyTarget(null)}>✕</button>
            </div>
          )}
          <div className="bh-progress-row">
            <div className="bh-progress-track">
              <div className="bh-progress-fill" style={{ width: `${Math.min((charCount / MIN_MESSAGE_LENGTH) * 100, 100)}%`, backgroundColor: getProgressColor() }} />
            </div>
            <span className="bh-progress-label" style={{ color: charCount >= MIN_MESSAGE_LENGTH ? '#4ade80' : '#6b7280' }}>{charCount}/{MIN_MESSAGE_LENGTH}</span>
          </div>
          <div className="bh-input-row">
            <div className="bh-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Say something (min ${MIN_MESSAGE_LENGTH} chars)...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !sending && charCount >= MIN_MESSAGE_LENGTH && sendMessage()}
                className="bh-input"
              />
              <button className="bh-banter-tag-btn" onClick={addBanterTag}>#banter</button>
              {inputText && <button className="bh-clear-btn" onClick={() => setInputText('')}><CloseIcon /></button>}
            </div>
            <button
              className={`bh-send-btn ${inputText.trim() && !sending && charCount >= MIN_MESSAGE_LENGTH ? 'active' : ''}`}
              onClick={sendMessage}
              disabled={!inputText.trim() || sending || charCount < MIN_MESSAGE_LENGTH}
            >
              <SendIcon active={!!(inputText.trim() && !sending && charCount >= MIN_MESSAGE_LENGTH)} />
            </button>
          </div>
          <p className="bh-input-hint">
            💡 <span style={{ color: '#4ade80' }}>#banter</span> +2 FTC • <span style={{ color: '#4ade80' }}>#nigeria</span> +3 FTC • Long-press to react
          </p>
        </div>
      </div>
    </>
  );
};

// ICONS
const ChevronLeft = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SendIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" fill="none" stroke={active ? '#fff' : '#6b7280'} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap');

  .bh-root { position:fixed; inset:0; display:flex; flex-direction:column; background:#0d0d0d; font-family:'Rajdhani',sans-serif; overflow:hidden; z-index:100; }

  .bh-header { flex-shrink:0; display:flex; align-items:center; gap:10px; padding:10px 14px; background:#111827; border-bottom:1px solid #1f2937; }
  .bh-back-btn { background:none; border:none; color:#9ca3af; cursor:pointer; padding:4px; display:flex; align-items:center; }
  .bh-avatar { width:38px; height:38px; border-radius:50%; background:#14532d; border:2px solid #22c55e; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .bh-header-info { flex:1; display:flex; flex-direction:column; }
  .bh-title { font-family:'Oxanium',sans-serif; font-weight:700; font-size:15px; color:#fff; letter-spacing:.05em; }
  .bh-subtitle { font-family:'Space Mono',monospace; font-size:9px; color:#22c55e; margin-top:1px; }

  .bh-online-stack { display:flex; align-items:center; gap:2px; }
  .bh-mini-avatar { width:22px; height:22px; border-radius:50%; background:#374151; border:1.5px solid #4b5563; display:flex; align-items:center; justify-content:center; font-size:9px; margin-left:-6px; overflow:hidden; flex-shrink:0; }
  .bh-mini-avatar:first-child { margin-left:0; }
  .bh-mini-avatar-img { width:100%; height:100%; object-fit:cover; }
  .bh-mini-overflow { background:#1f2937; color:#9ca3af; font-family:'Space Mono',monospace; font-size:8px; font-weight:700; }
  .bh-online-label { font-family:'Space Mono',monospace; font-size:8px; color:#22c55e; margin-left:6px; white-space:nowrap; }

  .bh-banner { flex-shrink:0; background:rgba(20,83,45,.22); border-bottom:1px solid rgba(34,197,94,.18); padding:5px 14px; }
  .bh-banner-text { font-family:'Space Mono',monospace; font-size:9px; color:#86efac; }

  .bh-messages { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; padding:10px 10px 6px; display:flex; flex-direction:column; gap:4px; }

  .bh-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding-top:60px; }
  .bh-empty-icon { width:68px; height:68px; border-radius:50%; background:#1f2937; display:flex; align-items:center; justify-content:center; font-size:34px; margin-bottom:12px; }
  .bh-empty-title { font-family:'Oxanium',sans-serif; color:#9ca3af; font-weight:600; font-size:14px; margin:0; }
  .bh-empty-sub { font-family:'Rajdhani',sans-serif; color:#4b5563; font-size:11px; margin:3px 0 0; }

  .bh-msg-row { display:flex; width:100%; }
  .bh-msg-row.me { justify-content:flex-end; }
  .bh-msg-row.them { justify-content:flex-start; }
  .bh-msg-group { display:flex; gap:6px; max-width:78%; }
  .bh-msg-group.me { flex-direction:row-reverse; }
  .bh-msg-group.them { flex-direction:row; }
  .bh-sender-avatar { width:26px; height:26px; border-radius:50%; background:#1f2937; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; margin-top:4px; }
  .bh-sender-avatar-wrap { width:26px; height:26px; border-radius:50%; overflow:hidden; flex-shrink:0; margin-top:4px; border:1px solid #374151; }
  .bh-sender-avatar-img { width:100%; height:100%; object-fit:cover; }
  .bh-msg-col { display:flex; flex-direction:column; position:relative; }
  .bh-sender-name { font-family:'Space Mono',monospace; font-size:9px; color:#6b7280; margin-bottom:2px; margin-left:4px; }

  /* Bubbles */
  .bh-bubble { padding:7px 11px; border-radius:14px; cursor:pointer; transition:opacity .15s; word-break:break-word; user-select:none; -webkit-user-select:none; }
  .bh-bubble:active { opacity:.75; }
  .bh-bubble.me { background:#15803d; border-radius:14px 14px 4px 14px; }
  .bh-bubble.them { background:#1f2937; border:1px solid #374151; border-radius:14px 14px 14px 4px; }
  .bh-bubble-text { font-family:'Rajdhani',sans-serif; font-size:13px; color:#f3f4f6; margin:0; line-height:1.5; }
  .bh-banter-badge { display:inline-block; font-family:'Space Mono',monospace; font-size:8px; font-weight:700; color:#facc15; margin-top:3px; }
  .bh-country-badge { display:inline-block; font-family:'Space Mono',monospace; font-size:8px; font-weight:700; color:#60a5fa; margin-top:3px; margin-left:4px; }

  .bh-reply-preview { background:rgba(0,0,0,.28); border-left:3px solid #22c55e; border-radius:6px; padding:4px 8px; margin-bottom:6px; }
  .bh-reply-preview-text { font-family:'Space Mono',monospace; font-size:9px; color:#86efac; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px; }

  .bh-emoji-picker { position:absolute; bottom:calc(100% + 6px); display:flex; gap:4px; background:#1f2937; border:1px solid #374151; border-radius:999px; padding:6px 10px; box-shadow:0 8px 24px rgba(0,0,0,.5); z-index:50; animation:bh-fadein .15s ease; }
  .bh-emoji-picker.me { right:0; }
  .bh-emoji-picker.them { left:0; }
  .bh-emoji-btn { background:none; border:none; font-size:18px; cursor:pointer; padding:2px 3px; border-radius:8px; transition:transform .1s; }
  .bh-emoji-btn:active { transform:scale(1.3); }

  .bh-reactions { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; margin-left:4px; }
  .bh-reactions.me { justify-content:flex-end; margin-right:4px; margin-left:0; }
  .bh-reaction-chip { background:#1e2937; border:1px solid #334155; border-radius:30px; padding:4px 8px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; transition:all 0.15s ease; }
  .bh-reaction-chip:hover { background:#334155; transform:scale(1.02); }
  .bh-reaction-chip.mine { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.4); }
  .bh-reaction-emoji { font-size:13px; }
  .bh-reaction-count { font-family:'Space Mono',monospace; font-size:10px; font-weight:600; color:#94a3b8; }
  .bh-reaction-chip.mine .bh-reaction-count { color:#4ade80; }

  .bh-meta { display:flex; align-items:center; gap:6px; margin-top:2px; margin-left:4px; }
  .bh-meta.me { justify-content:flex-end; margin-right:4px; margin-left:0; }
  .bh-time { font-family:'Space Mono',monospace; font-size:8px; color:#4b5563; }
  .bh-reply-btn { background:none; border:none; cursor:pointer; padding:0; font-family:'Space Mono',monospace; font-size:8px; color:#6b7280; transition:color .15s; }
  .bh-reply-btn:hover { color:#22c55e; }
  .bh-vote-btn { background:none; border:none; cursor:pointer; padding:0; font-family:'Space Mono',monospace; font-size:8px; color:#6b7280; display:flex; align-items:center; gap:2px; transition:color .15s; }
  .bh-vote-btn:hover:not(:disabled) { color:#facc15; }
  .bh-vote-btn.voted { color:#4b5563; cursor:default; }
  .bh-votes { color:#facc15; }
  .bh-vote-earn { color:#4ade80; margin-left:2px; }

  .bh-typing { background:rgba(21,128,61,.4); border-radius:14px 14px 4px 14px; padding:8px 12px; display:flex; gap:4px; align-items:center; }
  .bh-dot { width:6px; height:6px; border-radius:50%; background:#fff; animation:bh-bounce 1.2s infinite ease-in-out; }

  .bh-scroll-btn { position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:#15803d; border:none; border-radius:999px; color:#fff; font-family:'Space Mono',monospace; font-size:10px; font-weight:700; padding:6px 14px; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,.4); z-index:10; animation:bh-fadein .2s ease; white-space:nowrap; }
  .bh-scroll-btn:active { transform:translateX(-50%) scale(.95); }

  .bh-input-area { flex-shrink:0; background:#111827; border-top:1px solid #1f2937; padding:8px 12px 10px; }
  .bh-reply-strip { display:flex; align-items:center; gap:8px; background:rgba(34,197,94,.08); border-left:3px solid #22c55e; border-radius:8px; padding:6px 10px; margin-bottom:8px; }
  .bh-reply-strip-info { flex:1; display:flex; flex-direction:column; min-width:0; }
  .bh-reply-strip-name { font-family:'Space Mono',monospace; font-size:9px; color:#22c55e; font-weight:700; }
  .bh-reply-strip-content { font-family:'Rajdhani',sans-serif; font-size:11px; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bh-reply-close { background:none; border:none; color:#6b7280; cursor:pointer; font-size:12px; padding:2px 4px; flex-shrink:0; }
  .bh-reply-close:hover { color:#ef4444; }

  .bh-progress-row { display:flex; align-items:center; gap:8px; margin-bottom:7px; }
  .bh-progress-track { flex:1; height:3px; background:#1f2937; border-radius:999px; overflow:hidden; }
  .bh-progress-fill { height:100%; border-radius:999px; transition:width .3s,background-color .3s; }
  .bh-progress-label { font-family:'Space Mono',monospace; font-size:9px; font-weight:700; min-width:32px; text-align:right; }

  .bh-input-row { display:flex; align-items:center; gap:8px; }
  .bh-input-wrapper { flex:1; display:flex; align-items:center; background:#0d0d0d; border-radius:999px; border:1px solid #374151; padding:6px 10px 6px 14px; gap:6px; transition:border-color .2s; }
  .bh-input-wrapper:focus-within { border-color:#22c55e; }
  .bh-input { flex:1; background:none; border:none; outline:none; color:#f3f4f6; font-family:'Rajdhani',sans-serif; font-size:13px; }
  .bh-input::placeholder { color:#4b5563; }
  .bh-banter-tag-btn { flex-shrink:0; background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.35); border-radius:999px; color:#4ade80; font-family:'Space Mono',monospace; font-size:9px; font-weight:700; padding:3px 8px; cursor:pointer; letter-spacing:.05em; transition:background .2s; }
  .bh-banter-tag-btn:hover { background:rgba(34,197,94,.2); }
  .bh-clear-btn { background:none; border:none; color:#6b7280; cursor:pointer; display:flex; align-items:center; padding:0; }
  .bh-send-btn { width:42px; height:42px; border-radius:50%; border:none; background:#374151; display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:not-allowed; transition:background .2s,transform .1s; }
  .bh-send-btn.active { background:#16a34a; cursor:pointer; }
  .bh-send-btn.active:active { transform:scale(.92); }
  .bh-input-hint { font-family:'Space Mono',monospace; font-size:8px; color:#4b5563; text-align:center; margin:6px 0 0; }

  .bh-toast { position:absolute; top:70px; left:50%; transform:translateX(-50%); z-index:200; background:#16a34a; border-radius:999px; padding:7px 16px; display:flex; align-items:center; gap:6px; box-shadow:0 8px 32px rgba(0,0,0,.5); animation:bh-fadein .3s ease; }
  .bh-toast-text { font-family:'Oxanium',sans-serif; font-size:13px; font-weight:800; color:#000; letter-spacing:.04em; }

  .bh-loading { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; }
  .bh-spinner { width:36px; height:36px; border:3px solid #22c55e; border-top-color:transparent; border-radius:50%; animation:bh-spin .8s linear infinite; }
  .bh-loading-text { font-family:'Rajdhani',sans-serif; font-size:13px; color:#6b7280; margin:0; }

  @keyframes bh-bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
  @keyframes bh-fadein { from{opacity:0;transform:translateX(-50%) translateY(-6px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes bh-spin { to{transform:rotate(360deg)} }
`;

export default BanterHallScreen;
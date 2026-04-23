import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';

// Web3 fonts — ensure this is in your index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">

interface BanterMessage {
  id: string;
  userId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  clubTag: string | null;
  votes: number;
  createdAt: string;
  isMe: boolean;
}

interface ReplyTarget {
  id: string;
  senderName: string;
  content: string;
}

interface BanterHallScreenProps {
  profile: UserProfile | null;
  onBack: () => void;
  onEarn: (amount: number, reason: string) => void;
  onBanterNotify?: (message: string, senderName: string) => void;
  backendUserId?: string | null;
}

const API_BASE = 'https://footnfts.up.railway.app/api';
const POLL_INTERVAL = 3000;
const MIN_MESSAGE_LENGTH = 15;

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
  const [charCount, setCharCount] = useState(0);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCount = useRef(0);

  const tg = (window as any).Telegram?.WebApp;

  // ── Lock Telegram viewport so it never resizes/scrolls away ────────────────
  useEffect(() => {
    if (tg) {
      tg.expand();
      tg.disableVerticalSwipes?.();
    }
  }, [tg]);

  useEffect(() => {
    setCharCount(inputText.trim().length);
  }, [inputText]);

  const addBanterTag = () => {
    if (inputText.toLowerCase().includes('#banter')) {
      tg?.HapticFeedback?.notificationOccurred('warning');
      return;
    }
    const newText = inputText ? `${inputText} #banter` : '#banter';
    setInputText(newText);
    inputRef.current?.focus();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/banter/feed`);
      const data = await response.json();
      if (data.success && data.posts) {
        const formattedMessages: BanterMessage[] = data.posts.map((post: any) => ({
          id: post.id,
          userId: post.user_id,
          senderName: post.user?.username || `Fan_${post.user?.telegram_id}`,
          senderAvatar: 'https://picsum.photos/100',
          content: post.content,
          clubTag: post.club_tag,
          votes: post.votes_received || 0,
          createdAt: post.created_at,
          isMe: post.user_id === backendUserId,
        }));
        const sorted = formattedMessages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        if (lastMessageCount.current > 0 && sorted.length > lastMessageCount.current) {
          sorted.slice(lastMessageCount.current).forEach((msg) => {
            if (!msg.isMe && onBanterNotify) {
              onBanterNotify(msg.content, msg.senderName);
              tg?.HapticFeedback?.impactOccurred('light');
            }
          });
        }
        lastMessageCount.current = sorted.length;
        setMessages(sorted);
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  }, [backendUserId, onBanterNotify, tg]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [messages]);

  const formatTime = (dateString: string) => {
    try {
      const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
      const date = new Date(utcString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return 'Just now';
      if (diffMins === 1) return '1 min ago';
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours === 1) return '1 hr ago';
      if (diffHours < 24) return `${diffHours} hrs ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch {
      return 'Just now';
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    if (text.length < MIN_MESSAGE_LENGTH) {
      tg?.showAlert?.(`Min ${MIN_MESSAGE_LENGTH} chars. You have ${text.length}.`);
      tg?.HapticFeedback?.notificationOccurred('error');
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const isBanter = text.toLowerCase().includes('#banter');

      // Prepend reply context into message content if replying
      const finalContent = replyTarget
        ? `[Reply to ${replyTarget.senderName}: "${replyTarget.content.slice(0, 40)}${replyTarget.content.length > 40 ? '…' : ''}"] ${text}`
        : text;

      const response = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: backendUserId, content: finalContent, clubTag: null }),
      });
      const data = await response.json();
      if (data.success) {
        setInputText('');
        setCharCount(0);
        setReplyTarget(null);
        if (isBanter) {
          setRewardAmount(2);
          setShowRewardToast(true);
          onEarn(2, 'banter');
          tg?.HapticFeedback?.notificationOccurred('success');
          setTimeout(() => setShowRewardToast(false), 2000);
        }
        await loadMessages();
        inputRef.current?.focus();
      } else {
        tg?.showAlert?.(data.error || 'Failed to send message');
      }
    } catch (e) {
      console.error('Send failed:', e);
      tg?.showAlert?.('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVote = async (postId: string, authorId: string) => {
    if (authorId === backendUserId) {
      tg?.showAlert?.("You can't vote on your own banter!");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/banter/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, voterId: backendUserId }),
      });
      const data = await response.json();
      if (data.success) {
        setRewardAmount(3);
        setShowRewardToast(true);
        onEarn(3, 'voting');
        tg?.HapticFeedback?.notificationOccurred('success');
        setTimeout(() => setShowRewardToast(false), 2000);
        loadMessages();
      } else {
        tg?.showAlert?.(data.error || 'Failed to vote');
      }
    } catch (e) {
      console.error('Vote failed:', e);
    }
  };

  const handleReply = (msg: BanterMessage) => {
    setReplyTarget({ id: msg.id, senderName: msg.senderName, content: msg.content });
    inputRef.current?.focus();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  // Parse reply header embedded in message content
  const parseReplyFromContent = (content: string): { replyPart: string | null; mainPart: string } => {
    const match = content.match(/^\[Reply to (.+?): "(.+?)"\] ([\s\S]*)$/);
    if (match) {
      return { replyPart: `↩ ${match[1]}: ${match[2]}`, mainPart: match[3] };
    }
    return { replyPart: null, mainPart: content };
  };

  const getProgressColor = () => {
    if (charCount >= MIN_MESSAGE_LENGTH) return '#22c55e';
    if (charCount >= 10) return '#eab308';
    return '#ef4444';
  };

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
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
          <div className="bh-loading">
            <div className="bh-spinner" />
            <p className="bh-loading-text">Loading messages...</p>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="bh-root">

        {/* REWARD TOAST */}
        {showRewardToast && (
          <div className="bh-toast">
            <span>💰</span>
            <span className="bh-toast-text">+{rewardAmount} FTC Earned!</span>
          </div>
        )}

        {/* ── FIXED HEADER ── */}
        <div className="bh-header">
          <button className="bh-back-btn" onClick={onBack}><ChevronLeft /></button>
          <div className="bh-avatar">💬</div>
          <div className="bh-header-info">
            <span className="bh-title">Banter Hall</span>
            <span className="bh-subtitle">🔥 Live · {messages.length} msgs</span>
          </div>
          <div className="bh-avatar-stack">
            {messages.slice(-3).map((_, i) => (
              <div key={i} className="bh-mini-avatar">👤</div>
            ))}
          </div>
        </div>

        {/* ── INFO BANNER ── */}
        <div className="bh-banner">
          <span className="bh-banner-text">
            💡 Use <strong>#banter</strong> + min {MIN_MESSAGE_LENGTH} chars =&nbsp;
            <strong style={{ color: '#4ade80' }}>+2 FTC</strong>
          </span>
        </div>

        {/* ── SCROLLABLE MESSAGES ── */}
        <div className="bh-messages" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="bh-empty">
              <div className="bh-empty-icon">🔥</div>
              <p className="bh-empty-title">No banter yet!</p>
              <p className="bh-empty-sub">Be the first to start the conversation</p>
              <p className="bh-empty-sub">Use #banter to earn 2 FTC</p>
            </div>
          ) : (
            messages.map((msg) => {
              const { replyPart, mainPart } = parseReplyFromContent(msg.content);
              return (
                <div key={msg.id} className={`bh-msg-row ${msg.isMe ? 'me' : 'them'}`}>
                  <div className={`bh-msg-group ${msg.isMe ? 'me' : 'them'}`}>
                    {!msg.isMe && <div className="bh-sender-avatar">⚽</div>}
                    <div className="bh-msg-col">
                      {!msg.isMe && <span className="bh-sender-name">{msg.senderName}</span>}

                      {/* Bubble — double-tap to reply */}
                      <div
                        className={`bh-bubble ${msg.isMe ? 'me' : 'them'}`}
                        onDoubleClick={() => handleReply(msg)}
                      >
                        {replyPart && (
                          <div className="bh-reply-preview">
                            <span className="bh-reply-preview-text">{replyPart}</span>
                          </div>
                        )}
                        <p className="bh-bubble-text">{mainPart}</p>
                        {mainPart.toLowerCase().includes('#banter') && (
                          <span className="bh-banter-badge">🔥 #banter</span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className={`bh-meta ${msg.isMe ? 'me' : ''}`}>
                        <span className="bh-time">{formatTime(msg.createdAt)}</span>
                        <button className="bh-reply-btn" onClick={() => handleReply(msg)}>↩ Reply</button>
                        {!msg.isMe && (
                          <button className="bh-vote-btn" onClick={() => handleVote(msg.id, msg.userId)}>
                            🔥 Vote {msg.votes > 0 && <span className="bh-votes">({msg.votes})</span>}
                            <span className="bh-vote-earn">+3</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

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

        {/* ── FIXED INPUT AREA ── */}
        <div className="bh-input-area">

          {/* Reply strip */}
          {replyTarget && (
            <div className="bh-reply-strip">
              <div className="bh-reply-strip-info">
                <span className="bh-reply-strip-name">↩ {replyTarget.senderName}</span>
                <span className="bh-reply-strip-content">
                  {replyTarget.content.slice(0, 60)}{replyTarget.content.length > 60 ? '…' : ''}
                </span>
              </div>
              <button className="bh-reply-close" onClick={() => setReplyTarget(null)}>✕</button>
            </div>
          )}

          {/* Progress */}
          <div className="bh-progress-row">
            <div className="bh-progress-track">
              <div
                className="bh-progress-fill"
                style={{
                  width: `${Math.min((charCount / MIN_MESSAGE_LENGTH) * 100, 100)}%`,
                  backgroundColor: getProgressColor(),
                }}
              />
            </div>
            <span className="bh-progress-label" style={{ color: charCount >= MIN_MESSAGE_LENGTH ? '#4ade80' : '#6b7280' }}>
              {charCount}/{MIN_MESSAGE_LENGTH}
            </span>
          </div>

          {/* Input row */}
          <div className="bh-input-row">
            <div className="bh-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Say something (min ${MIN_MESSAGE_LENGTH} chars)...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && !sending && charCount >= MIN_MESSAGE_LENGTH && sendMessage()
                }
                className="bh-input"
                autoFocus
              />
              <button className="bh-banter-tag-btn" onClick={addBanterTag}>#banter</button>
              {inputText && (
                <button className="bh-clear-btn" onClick={() => setInputText('')}><CloseIcon /></button>
              )}
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
            💡 Tap <span style={{ color: '#4ade80', fontWeight: 700 }}>#banter</span> for +2 FTC · Double-tap or ↩ Reply · Vote for +3 FTC
          </p>
        </div>
      </div>
    </>
  );
};

// ── SVG ICONS ──────────────────────────────────────────────────────────────────
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

// ── GLOBAL CSS ─────────────────────────────────────────────────────────────────
//
// THE FIX: .bh-root uses `position: fixed; inset: 0` instead of relying on
// the parent's height. This is the ONLY reliable way to get a sticky layout
// inside Telegram Mini Apps, because Telegram wraps the WebApp in a scrollable
// iframe whose parent height is not always constrained to the viewport.
//
// With position:fixed the component owns the full screen rect itself.
// Only .bh-messages has overflow-y:auto — everything else is locked.
//
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap');

  /* ── Root: owns the full viewport ── */
  .bh-root {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: #0d0d0d;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
    z-index: 100;
  }

  /* ── Header (never moves) ── */
  .bh-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #111827;
    border-bottom: 1px solid #1f2937;
  }
  .bh-back-btn {
    background: none; border: none; color: #9ca3af;
    cursor: pointer; padding: 4px; display: flex; align-items: center;
  }
  .bh-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: #14532d; border: 2px solid #22c55e;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
  }
  .bh-header-info { flex: 1; display: flex; flex-direction: column; }
  .bh-title {
    font-family: 'Oxanium', sans-serif; font-weight: 700;
    font-size: 15px; color: #fff; letter-spacing: .05em;
  }
  .bh-subtitle {
    font-family: 'Space Mono', monospace; font-size: 9px; color: #22c55e; margin-top: 1px;
  }
  .bh-avatar-stack { display: flex; align-items: center; }
  .bh-mini-avatar {
    width: 20px; height: 20px; border-radius: 50%;
    background: #374151; border: 1px solid #4b5563;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; margin-left: -6px;
  }
  .bh-mini-avatar:first-child { margin-left: 0; }

  /* ── Banner ── */
  .bh-banner {
    flex-shrink: 0;
    background: rgba(20,83,45,.22);
    border-bottom: 1px solid rgba(34,197,94,.18);
    padding: 5px 14px;
  }
  .bh-banner-text {
    font-family: 'Space Mono', monospace; font-size: 9px; color: #86efac;
  }

  /* ── Messages — the ONLY scrollable element ── */
  .bh-messages {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding: 10px 10px 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* ── Empty state ── */
  .bh-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding-top: 60px;
  }
  .bh-empty-icon {
    width: 68px; height: 68px; border-radius: 50%;
    background: #1f2937; display: flex; align-items: center;
    justify-content: center; font-size: 34px; margin-bottom: 12px;
  }
  .bh-empty-title {
    font-family: 'Oxanium', sans-serif; color: #9ca3af;
    font-weight: 600; font-size: 14px; margin: 0;
  }
  .bh-empty-sub {
    font-family: 'Rajdhani', sans-serif; color: #4b5563;
    font-size: 11px; margin: 3px 0 0;
  }

  /* ── Message rows ── */
  .bh-msg-row { display: flex; width: 100%; }
  .bh-msg-row.me  { justify-content: flex-end; }
  .bh-msg-row.them { justify-content: flex-start; }

  .bh-msg-group { display: flex; gap: 6px; max-width: 76%; }
  .bh-msg-group.me   { flex-direction: row-reverse; }
  .bh-msg-group.them { flex-direction: row; }

  .bh-sender-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: #1f2937; display: flex; align-items: center;
    justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 4px;
  }
  .bh-msg-col { display: flex; flex-direction: column; }
  .bh-sender-name {
    font-family: 'Space Mono', monospace; font-size: 9px;
    color: #6b7280; margin-bottom: 2px; margin-left: 4px;
  }

  /* ── Bubbles ── */
  .bh-bubble {
    padding: 7px 11px; border-radius: 14px;
    cursor: pointer; transition: opacity .15s; word-break: break-word;
  }
  .bh-bubble:active { opacity: .75; }
  .bh-bubble.me   { background: #15803d; border-radius: 14px 14px 4px 14px; }
  .bh-bubble.them { background: #1f2937; border: 1px solid #374151; border-radius: 14px 14px 14px 4px; }

  .bh-bubble-text {
    font-family: 'Rajdhani', sans-serif; font-size: 13px;
    color: #f3f4f6; margin: 0; line-height: 1.5;
  }
  .bh-banter-badge {
    display: inline-block; font-family: 'Space Mono', monospace;
    font-size: 8px; font-weight: 700; color: #facc15; margin-top: 3px;
  }

  /* ── Reply quote inside bubble ── */
  .bh-reply-preview {
    background: rgba(0,0,0,.28);
    border-left: 3px solid #22c55e;
    border-radius: 6px; padding: 4px 8px; margin-bottom: 6px;
  }
  .bh-reply-preview-text {
    font-family: 'Space Mono', monospace; font-size: 9px; color: #86efac;
    display: block; white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; max-width: 220px;
  }

  /* ── Meta row ── */
  .bh-meta {
    display: flex; align-items: center; gap: 6px;
    margin-top: 2px; margin-left: 4px;
  }
  .bh-meta.me { justify-content: flex-end; margin-right: 4px; margin-left: 0; }
  .bh-time { font-family: 'Space Mono', monospace; font-size: 8px; color: #4b5563; }
  .bh-reply-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    font-family: 'Space Mono', monospace; font-size: 8px; color: #6b7280;
    transition: color .15s;
  }
  .bh-reply-btn:hover { color: #22c55e; }
  .bh-vote-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    font-family: 'Space Mono', monospace; font-size: 8px; color: #6b7280;
    display: flex; align-items: center; gap: 2px; transition: color .15s;
  }
  .bh-vote-btn:hover { color: #facc15; }
  .bh-votes { color: #facc15; }
  .bh-vote-earn { color: #4ade80; margin-left: 2px; }

  /* ── Typing indicator ── */
  .bh-typing {
    background: rgba(21,128,61,.4);
    border-radius: 14px 14px 4px 14px;
    padding: 8px 12px; display: flex; gap: 4px; align-items: center;
  }
  .bh-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #fff;
    animation: bh-bounce 1.2s infinite ease-in-out;
  }

  /* ── Input area (never moves) ── */
  .bh-input-area {
    flex-shrink: 0;
    background: #111827;
    border-top: 1px solid #1f2937;
    padding: 8px 12px 10px;
  }

  /* ── Reply strip ── */
  .bh-reply-strip {
    display: flex; align-items: center; gap: 8px;
    background: rgba(34,197,94,.08);
    border-left: 3px solid #22c55e;
    border-radius: 8px; padding: 6px 10px; margin-bottom: 8px;
  }
  .bh-reply-strip-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .bh-reply-strip-name {
    font-family: 'Space Mono', monospace; font-size: 9px; color: #22c55e; font-weight: 700;
  }
  .bh-reply-strip-content {
    font-family: 'Rajdhani', sans-serif; font-size: 11px; color: #9ca3af;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .bh-reply-close {
    background: none; border: none; color: #6b7280; cursor: pointer;
    font-size: 12px; padding: 2px 4px; flex-shrink: 0; transition: color .15s;
  }
  .bh-reply-close:hover { color: #ef4444; }

  /* ── Progress ── */
  .bh-progress-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
  .bh-progress-track {
    flex: 1; height: 3px; background: #1f2937; border-radius: 999px; overflow: hidden;
  }
  .bh-progress-fill { height: 100%; border-radius: 999px; transition: width .3s, background-color .3s; }
  .bh-progress-label {
    font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700;
    min-width: 32px; text-align: right;
  }

  /* ── Input row ── */
  .bh-input-row { display: flex; align-items: center; gap: 8px; }
  .bh-input-wrapper {
    flex: 1; display: flex; align-items: center;
    background: #0d0d0d; border-radius: 999px;
    border: 1px solid #374151; padding: 6px 10px 6px 14px; gap: 6px;
    transition: border-color .2s;
  }
  .bh-input-wrapper:focus-within { border-color: #22c55e; }
  .bh-input {
    flex: 1; background: none; border: none; outline: none;
    color: #f3f4f6; font-family: 'Rajdhani', sans-serif; font-size: 13px;
  }
  .bh-input::placeholder { color: #4b5563; }
  .bh-banter-tag-btn {
    flex-shrink: 0; background: rgba(34,197,94,.1);
    border: 1px solid rgba(34,197,94,.35); border-radius: 999px;
    color: #4ade80; font-family: 'Space Mono', monospace;
    font-size: 9px; font-weight: 700; padding: 3px 8px;
    cursor: pointer; letter-spacing: .05em; transition: background .2s;
  }
  .bh-banter-tag-btn:hover { background: rgba(34,197,94,.2); }
  .bh-clear-btn {
    background: none; border: none; color: #6b7280; cursor: pointer;
    display: flex; align-items: center; padding: 0;
  }
  .bh-send-btn {
    width: 42px; height: 42px; border-radius: 50%; border: none;
    background: #374151; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; cursor: not-allowed;
    transition: background .2s, transform .1s;
  }
  .bh-send-btn.active { background: #16a34a; cursor: pointer; }
  .bh-send-btn.active:active { transform: scale(.92); }
  .bh-input-hint {
    font-family: 'Space Mono', monospace; font-size: 8px;
    color: #4b5563; text-align: center; margin: 6px 0 0;
  }

  /* ── Toast ── */
  .bh-toast {
    position: absolute; top: 70px; left: 50%; transform: translateX(-50%);
    z-index: 200; background: #16a34a; border-radius: 999px;
    padding: 7px 16px; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,.5);
    animation: bh-fadein .3s ease;
  }
  .bh-toast-text {
    font-family: 'Oxanium', sans-serif; font-size: 13px;
    font-weight: 800; color: #000; letter-spacing: .04em;
  }

  /* ── Loading ── */
  .bh-loading {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
  }
  .bh-spinner {
    width: 34px; height: 34px; border: 4px solid #22c55e;
    border-top-color: transparent; border-radius: 50%;
    animation: bh-spin .8s linear infinite;
  }
  .bh-loading-text {
    font-family: 'Rajdhani', sans-serif; color: #6b7280; font-size: 14px; margin: 0;
  }

  /* ── Keyframes ── */
  @keyframes bh-bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40%           { transform: translateY(-5px); }
  }
  @keyframes bh-spin { to { transform: rotate(360deg); } }
  @keyframes bh-fadein {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

export default BanterHallScreen;
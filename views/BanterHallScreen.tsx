import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';

// Web3 fonts — add to your index.html or global CSS:
// <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&family=Oxanium:wght@400;500;600;700;800&display=swap" rel="stylesheet">

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCount = useRef(0);

  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    setCharCount(inputText.trim().length);
  }, [inputText]);

  const addBanterTag = () => {
    const currentText = inputText;
    const banterTag = '#banter';
    if (currentText.toLowerCase().includes('#banter')) {
      tg?.HapticFeedback.notificationOccurred('warning');
      return;
    }
    const newText = currentText ? `${currentText} ${banterTag}` : banterTag;
    setInputText(newText);
    inputRef.current?.focus();
    tg?.HapticFeedback.impactOccurred('light');
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
        const sortedMessages = formattedMessages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        if (lastMessageCount.current > 0 && sortedMessages.length > lastMessageCount.current) {
          const newMessages = sortedMessages.slice(lastMessageCount.current);
          newMessages.forEach((msg) => {
            if (!msg.isMe && onBanterNotify) {
              onBanterNotify(msg.content, msg.senderName);
              tg?.HapticFeedback.impactOccurred('light');
            }
          });
        }
        lastMessageCount.current = sortedMessages.length;
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
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
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages]);

  const formatTime = (dateString: string) => {
    try {
      const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
      const date = new Date(utcString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return 'Just now';
      if (diffMins === 1) return '1 min ago';
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
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
      tg?.showAlert?.(`Message must be at least ${MIN_MESSAGE_LENGTH} characters. Current: ${text.length}`);
      tg?.HapticFeedback.notificationOccurred('error');
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const isBanter = text.toLowerCase().includes('#banter');
      const response = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: backendUserId, content: text, clubTag: null }),
      });
      const data = await response.json();
      if (data.success) {
        setInputText('');
        setCharCount(0);
        if (isBanter) {
          setRewardAmount(2);
          setShowRewardToast(true);
          onEarn(2, 'banter');
          tg?.HapticFeedback.notificationOccurred('success');
          setTimeout(() => setShowRewardToast(false), 2000);
        }
        await loadMessages();
        inputRef.current?.focus();
      } else {
        tg?.showAlert?.(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
        tg?.HapticFeedback.notificationOccurred('success');
        setTimeout(() => setShowRewardToast(false), 2000);
        loadMessages();
      } else {
        tg?.showAlert?.(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      tg?.showAlert?.('Network error. Please try again.');
    }
  };

  const getProgressColor = () => {
    if (charCount >= MIN_MESSAGE_LENGTH) return '#22c55e';
    if (charCount >= 10) return '#eab308';
    return '#ef4444';
  };

  // ─── LOADING STATE ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}>
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={styles.headerAvatar}>💬</div>
          <div style={styles.headerInfo}>
            <span style={styles.headerTitle}>Banter Hall</span>
            <span style={styles.headerSub}>Global Fan Chat</span>
          </div>
        </div>
        <div style={styles.loadingCenter}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading messages...</p>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      {/* ── REWARD TOAST ── */}
      {showRewardToast && (
        <div style={styles.toast}>
          <span style={{ fontSize: 16 }}>💰</span>
          <span style={styles.toastText}>+{rewardAmount} FTC Earned!</span>
        </div>
      )}

      {/* ── FIXED HEADER ── */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={styles.headerAvatar}>💬</div>
        <div style={styles.headerInfo}>
          <span style={styles.headerTitle}>Banter Hall</span>
          <span style={styles.headerSub}>🔥 Live · {messages.length} messages</span>
        </div>
        <div style={styles.headerAvatarStack}>
          {messages.slice(-3).map((_, i) => (
            <div key={i} style={{ ...styles.miniAvatar, marginLeft: i > 0 ? -6 : 0 }}>👤</div>
          ))}
        </div>
      </div>

      {/* ── INFO BANNER ── */}
      <div style={styles.infoBanner}>
        <span style={styles.infoBannerText}>
          💡 Use <strong style={{ color: '#fff' }}>#banter</strong> + min {MIN_MESSAGE_LENGTH} chars ={' '}
          <strong style={{ color: '#4ade80' }}>+2 FTC</strong>
        </span>
      </div>

      {/* ── SCROLLABLE MESSAGES ── */}
      <div style={styles.messagesArea} ref={scrollRef}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔥</div>
            <p style={styles.emptyTitle}>No banter yet!</p>
            <p style={styles.emptySubtitle}>Be the first to start the conversation</p>
            <p style={styles.emptySubtitle}>Use #banter to earn 2 FTC</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ ...styles.msgRow, justifyContent: msg.isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: msg.isMe ? 'row-reverse' : 'row', gap: 6, maxWidth: '72%' }}>
                {!msg.isMe && <div style={styles.senderAvatar}>⚽</div>}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start' }}>
                  {!msg.isMe && <span style={styles.senderName}>{msg.senderName}</span>}
                  <div style={msg.isMe ? styles.bubbleMe : styles.bubbleThem}>
                    <p style={styles.bubbleText}>{msg.content}</p>
                    {msg.content.toLowerCase().includes('#banter') && (
                      <span style={styles.banterBadge}>🔥 #banter</span>
                    )}
                  </div>
                  <div style={styles.msgMeta}>
                    <span style={styles.msgTime}>{formatTime(msg.createdAt)}</span>
                    {!msg.isMe && (
                      <button onClick={() => handleVote(msg.id, msg.userId)} style={styles.voteBtn}>
                        🔥 Vote {msg.votes > 0 && <span style={{ color: '#facc15' }}>({msg.votes})</span>}
                        <span style={{ color: '#4ade80', marginLeft: 2 }}>+3</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {sending && (
          <div style={{ ...styles.msgRow, justifyContent: 'flex-end' }}>
            <div style={styles.typingBubble}>
              {[0, 0.1, 0.2].map((delay, i) => (
                <div key={i} style={{ ...styles.typingDot, animationDelay: `${delay}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FIXED INPUT AREA ── */}
      <div style={styles.inputArea}>
        {/* Progress bar */}
        <div style={styles.progressRow}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min((charCount / MIN_MESSAGE_LENGTH) * 100, 100)}%`,
                backgroundColor: getProgressColor(),
              }}
            />
          </div>
          <span style={{ ...styles.progressLabel, color: charCount >= MIN_MESSAGE_LENGTH ? '#4ade80' : '#6b7280' }}>
            {charCount}/{MIN_MESSAGE_LENGTH}
          </span>
        </div>

        {/* Input row */}
        <div style={styles.inputRow}>
          <div style={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              placeholder={`Say something (min ${MIN_MESSAGE_LENGTH} chars)...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !sending && charCount >= MIN_MESSAGE_LENGTH && sendMessage()}
              style={styles.input}
              autoFocus
            />
            <button onClick={addBanterTag} style={styles.banterTagBtn}>#banter</button>
            {inputText && (
              <button onClick={() => setInputText('')} style={styles.clearBtn}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || sending || charCount < MIN_MESSAGE_LENGTH}
            style={{
              ...styles.sendBtn,
              backgroundColor:
                inputText.trim() && !sending && charCount >= MIN_MESSAGE_LENGTH ? '#16a34a' : '#374151',
              cursor: inputText.trim() && !sending && charCount >= MIN_MESSAGE_LENGTH ? 'pointer' : 'not-allowed',
            }}
          >
            <svg width="18" height="18" fill="none" stroke={inputText.trim() && !sending && charCount >= MIN_MESSAGE_LENGTH ? '#fff' : '#6b7280'} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <p style={styles.inputHint}>
          💡 Tap <span style={{ color: '#4ade80', fontWeight: 700 }}>#banter</span> to earn 2 FTC · Vote on others to earn 3 FTC
        </p>
      </div>

      {/* ── WEB3 FONT INJECTION ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
// Layout uses a flex column with overflow hidden on root so only the messages
// div scrolls — exactly like WhatsApp.
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',          // fills parent (e.g. 100dvh on the page)
    overflow: 'hidden',       // ← key: prevents the whole page from scrolling
    backgroundColor: '#0d0d0d',
    fontFamily: "'Rajdhani', sans-serif",
    position: 'relative',
  },

  // ── Header (never scrolls) ──
  header: {
    flexShrink: 0,            // ← never shrinks
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    backgroundColor: '#111827',
    borderBottom: '1px solid #1f2937',
    zIndex: 20,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    backgroundColor: '#14532d',
    border: '2px solid #22c55e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    fontFamily: "'Oxanium', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    color: '#fff',
    letterSpacing: '0.05em',
  },
  headerSub: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: '#22c55e',
    marginTop: 1,
  },
  headerAvatarStack: {
    display: 'flex',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
  },

  // ── Info banner (never scrolls) ──
  infoBanner: {
    flexShrink: 0,
    backgroundColor: 'rgba(20, 83, 45, 0.25)',
    borderBottom: '1px solid rgba(34,197,94,0.2)',
    padding: '5px 16px',
  },
  infoBannerText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: '#86efac',
  },

  // ── Messages (scrolls) ──
  messagesArea: {
    flex: 1,                  // ← takes all remaining space
    overflowY: 'auto',        // ← only this div scrolls
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  // ── Empty state ──
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    backgroundColor: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: "'Oxanium', sans-serif",
    color: '#9ca3af',
    fontWeight: 600,
    fontSize: 15,
    margin: 0,
  },
  emptySubtitle: {
    fontFamily: "'Rajdhani', sans-serif",
    color: '#4b5563',
    fontSize: 12,
    margin: '3px 0 0',
  },

  // ── Message bubbles ──
  msgRow: {
    display: 'flex',
    width: '100%',
  },
  senderAvatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    flexShrink: 0,
    marginTop: 4,
  },
  senderName: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
    marginLeft: 4,
  },
  bubbleMe: {
    backgroundColor: '#15803d',
    borderRadius: '14px 14px 4px 14px',
    padding: '8px 12px',
    maxWidth: '100%',
  },
  bubbleThem: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '14px 14px 14px 4px',
    padding: '8px 12px',
    maxWidth: '100%',
  },
  bubbleText: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    color: '#f3f4f6',
    margin: 0,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  banterBadge: {
    display: 'inline-block',
    fontFamily: "'Space Mono', monospace",
    fontSize: 8,
    fontWeight: 700,
    color: '#facc15',
    marginTop: 4,
  },
  msgMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginLeft: 4,
  },
  msgTime: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 8,
    color: '#4b5563',
  },
  voteBtn: {
    background: 'none',
    border: 'none',
    fontFamily: "'Space Mono', monospace",
    fontSize: 8,
    color: '#6b7280',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },

  // ── Typing indicator ──
  typingBubble: {
    backgroundColor: 'rgba(21,128,61,0.45)',
    borderRadius: '14px 14px 4px 14px',
    padding: '8px 12px',
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: '50%',
    animation: 'bounce 1.2s infinite ease-in-out',
  },

  // ── Input area (never scrolls) ──
  inputArea: {
    flexShrink: 0,            // ← never scrolls away
    backgroundColor: '#111827',
    borderTop: '1px solid #1f2937',
    padding: '10px 14px 12px',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: '#1f2937',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 0.3s, background-color 0.3s',
  },
  progressLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    fontWeight: 700,
    minWidth: 32,
    textAlign: 'right',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    borderRadius: 999,
    border: '1px solid #374151',
    padding: '6px 10px 6px 14px',
    gap: 6,
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#f3f4f6',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
  },
  banterTagBtn: {
    flexShrink: 0,
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: 999,
    color: '#4ade80',
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    fontWeight: 700,
    padding: '3px 8px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.2s',
  },
  inputHint: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 8,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 0,
  },

  // ── Toast ──
  toast: {
    position: 'fixed',
    top: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
    backgroundColor: '#16a34a',
    borderRadius: 999,
    padding: '7px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeInDown 0.3s ease',
  },
  toastText: {
    fontFamily: "'Oxanium', sans-serif",
    fontSize: 13,
    fontWeight: 800,
    color: '#000',
    letterSpacing: '0.04em',
  },

  // ── Loading ──
  loadingCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '4px solid #22c55e',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontFamily: "'Rajdhani', sans-serif",
    color: '#6b7280',
    fontSize: 14,
    margin: 0,
  },
};

export default BanterHallScreen;
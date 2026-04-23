import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';

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
  backendUserId 
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
          isMe: post.user_id === backendUserId
        }));
        
        const sortedMessages = formattedMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        if (lastMessageCount.current > 0 && sortedMessages.length > lastMessageCount.current) {
          const newMessages = sortedMessages.slice(lastMessageCount.current);
          newMessages.forEach(msg => {
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: backendUserId,
          content: text,
          clubTag: null
        })
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: postId,
          voterId: backendUserId
        })
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

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-darkBg">
        <div className="bg-darkCard px-4 py-4 flex items-center gap-3 border-b border-gray-800">
          <button onClick={onBack} className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Banter Hall</h2>
            <p className="text-xs text-green-500">Global Fan Chat</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-darkBg">
      {showRewardToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-green-600 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
            <span className="text-lg">💰</span>
            <span className="text-sm font-black text-black">+{rewardAmount} FTC Earned!</span>
          </div>
        </div>
      )}

      {/* STICKY HEADER - Fixed on scroll with proper CSS classes */}
      <div className="sticky top-0 z-20 bg-darkCard shadow-md">
        {/* Main Header */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-800 bg-darkCard">
          <button onClick={onBack} className="text-gray-400 active:scale-95 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Banter Hall</h2>
            <p className="text-xs text-green-500">🔥 Live • {messages.length} messages</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-sm">💬</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-green-950/30 border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
          <p className="text-[10px] text-green-400">
            💡 Use <span className="font-bold text-white">#banter</span> + min {MIN_MESSAGE_LENGTH} chars = +2 FTC
          </p>
          <div className="flex -space-x-2">
            {messages.slice(-3).map((msg, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-[8px]">
                👤
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <span className="text-4xl">🔥</span>
            </div>
            <p className="text-gray-400 font-medium">No banter yet!</p>
            <p className="text-xs text-gray-600 mt-2">Be the first to start the conversation</p>
            <p className="text-xs text-gray-600 mt-1">Use #banter to earn 2 FTC</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'} gap-1.5`}>
                {!msg.isMe && (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-[10px]">⚽</span>
                  </div>
                )}
                
                <div>
                  {!msg.isMe && (
                    <p className="text-[10px] font-semibold text-gray-400 mb-0.5 ml-1">{msg.senderName}</p>
                  )}
                  <div
                    className={`relative px-3 py-1.5 rounded-xl text-[13px] ${
                      msg.isMe
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-darkCard text-gray-200 rounded-bl-none border border-gray-700'
                    }`}
                  >
                    <p className="break-words leading-relaxed">{msg.content}</p>
                    {msg.content.toLowerCase().includes('#banter') && (
                      <span className="inline-block text-[8px] font-bold text-yellow-400 mt-0.5">
                        🔥 #banter
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 ml-1">
                    <span className="text-[8px] text-gray-600">{formatTime(msg.createdAt)}</span>
                    {!msg.isMe && (
                      <button 
                        onClick={() => handleVote(msg.id, msg.userId)}
                        className="text-[8px] text-gray-500 hover:text-yellow-500 transition-colors flex items-center gap-0.5"
                      >
                        🔥 Vote {msg.votes > 0 && <span className="text-yellow-500">({msg.votes})</span>}
                        <span className="text-green-500">+3</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {sending && (
          <div className="flex justify-end">
            <div className="bg-green-600/50 px-3 py-1.5 rounded-xl rounded-br-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-darkCard px-4 py-3 border-t border-gray-800">
        <div className="mb-2 px-1 flex items-center justify-between gap-3">
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300" 
              style={{ 
                width: `${Math.min((charCount / MIN_MESSAGE_LENGTH) * 100, 100)}%`, 
                backgroundColor: getProgressColor() 
              }}
            />
          </div>
          <span 
            className="text-[9px] font-black tabular-nums transition-colors duration-300"
            style={{ color: charCount >= MIN_MESSAGE_LENGTH ? '#22c55e' : '#6b7280' }}
          >
            {charCount}/{MIN_MESSAGE_LENGTH}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-darkDeep rounded-full px-4 py-2 flex items-center border border-gray-700 focus-within:border-green-500 transition-colors">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Say something (min ${MIN_MESSAGE_LENGTH} chars)...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !sending && charCount >= MIN_MESSAGE_LENGTH && sendMessage()}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
              autoFocus
            />
            
            {/* #banter button INSIDE input */}
            <button
              onClick={addBanterTag}
              className="ml-2 px-2 py-0.5 rounded-full bg-green-600/20 border border-green-500/50 text-green-500 text-[10px] font-bold uppercase tracking-wider hover:bg-green-600/30 transition-all active:scale-95 whitespace-nowrap"
              title="Add #banter tag"
            >
              #banter
            </button>
            
            {inputText && (
              <button 
                onClick={() => setInputText('')}
                className="text-gray-500 hover:text-gray-400 ml-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || sending || charCount < MIN_MESSAGE_LENGTH}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() && !sending && charCount >= MIN_MESSAGE_LENGTH
                ? 'bg-green-600 text-black active:scale-95'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-[8px] text-gray-600">
            💡 Tap <span className="text-green-500 font-bold">#banter</span> to earn 2 FTC • Vote on others' posts to earn 3 FTC
          </span>
        </div>
      </div>
    </div>
  );
};

export default BanterHallScreen;
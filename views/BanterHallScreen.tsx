import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { ChatMessage, UserProfile } from '../types';

interface BanterHallScreenProps {
  profile: UserProfile | null;
  onBack: () => void;
  onEarn: (amount: number) => void;
  onBanterNotify?: (message: string, mentionedClub: string) => void;
  backendUserId?: string | null;
}

// Club name keywords to detect mentions
const CLUB_KEYWORDS: Record<string, string[]> = {
  'Barcelona': ['barca', 'barcelona', 'blaugrana', 'fcb', 'cule'],
  'Manchester United': ['united', 'mufc', 'man utd', 'red devils', 'manchester united'],
  'Real Madrid': ['madrid', 'real madrid', 'merengue', 'los blancos', 'hala madrid'],
  'Liverpool': ['liverpool', 'lfc', 'reds', 'kop', 'anfield'],
  'Manchester City': ['city', 'man city', 'mcfc', 'cityzens'],
  'Arsenal': ['arsenal', 'gunners', 'afc', 'gooners'],
  'Chelsea': ['chelsea', 'cfc', 'blues', 'pensioners'],
  'Tottenham': ['spurs', 'tottenham', 'thfc', 'lilywhites'],
  'Bayern Munich': ['bayern', 'fcb', 'bavarians'],
  'Juventus': ['juventus', 'juve', 'bianconeri'],
  'AC Milan': ['milan', 'ac milan', 'rossoneri'],
  'Inter Milan': ['inter', 'inter milan', 'nerazzurri'],
  'PSG': ['psg', 'paris', 'saint-germain'],
  'Ajax': ['ajax', 'amsterdammers'],
  'Atletico Madrid': ['atletico', 'atleti', 'colchoneros'],
};

const API_BASE = 'https://footnfts.up.railway.app/api';

function detectMentionedClubs(text: string): string[] {
  const lower = text.toLowerCase();
  const mentioned: string[] = [];
  for (const [club, keywords] of Object.entries(CLUB_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      mentioned.push(club);
    }
  }
  return [...new Set(mentioned)];
}

const MIN_MESSAGE_LENGTH = 15;

const BanterHallScreen: React.FC<BanterHallScreenProps> = ({ 
  profile, 
  onBack, 
  onEarn, 
  onBanterNotify,
  backendUserId 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [banterLevel, setBanterLevel] = useState(65);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tg = (window as any).Telegram?.WebApp;

  // Load messages from backend on mount
  useEffect(() => {
    loadMessages();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/banter/feed`);
      const data = await response.json();
      
      if (data.success && data.posts) {
        // Convert backend posts to chat message format
        const formattedMessages: ChatMessage[] = data.posts.map((post: any) => ({
          id: post.id,
          sender: post.user?.username || `Fan_${post.user?.telegram_id}`,
          avatar: 'https://picsum.photos/100',
          text: post.content,
          time: new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: post.user_id === backendUserId,
          badge: post.club_tag || 'Fan'
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessageToBackend = async (content: string, clubTag: string | null = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: backendUserId,
          content: content,
          clubTag: clubTag
        })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (validationError && value.trim().length >= MIN_MESSAGE_LENGTH) {
      setValidationError('');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputText.trim();

    if (!text) return;

    if (text.length < MIN_MESSAGE_LENGTH) {
      setValidationError(`Message must be at least ${MIN_MESSAGE_LENGTH} characters to send.`);
      tg?.HapticFeedback.notificationOccurred('error');
      return;
    }

    // Detect if this is a banter message (contains #banter)
    const isBanterMessage = text.toLowerCase().includes('#banter');
    const clubTag = isBanterMessage ? detectMentionedClubs(text)[0] || null : null;
    
    // Send to backend
    const success = await sendMessageToBackend(text, clubTag);
    
    if (success) {
      // Add to local messages
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: profile?.displayName || 'Me',
        avatar: profile?.avatar || 'https://picsum.photos/100',
        text: inputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        badge: clubTag || 'You'
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setValidationError('');

      if (isBanterMessage) {
        // Award FTC for banter
        onEarn(2);
        setShowRewardToast(true);
        setBanterLevel(prev => Math.min(100, prev + 5));
        setTimeout(() => setShowRewardToast(false), 2000);

        // Detect mentioned clubs and fire notifications
        const mentionedClubs = detectMentionedClubs(text);
        if (mentionedClubs.length > 0 && onBanterNotify) {
          mentionedClubs.forEach(club => {
            onBanterNotify(text, club);
          });
        } else if (onBanterNotify) {
          onBanterNotify(text, 'all');
        }

        tg?.HapticFeedback.notificationOccurred('success');
      }
      
      // Reload messages to get updated list
      setTimeout(loadMessages, 1000);
    } else {
      tg?.showAlert?.('Failed to send message. Please try again.');
    }
  };

  const handleVote = async (postId: string) => {
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
        // Award 3 FTC to the voter
        onEarn(3);
        
        // Reload messages to update vote counts
        loadMessages();
        
        tg?.HapticFeedback.notificationOccurred('success');
        tg?.showAlert?.('+3 FTC for voting!');
      } else {
        tg?.showAlert?.(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      tg?.showAlert?.('Network error. Please try again.');
    }
  };

  const charCount = inputText.trim().length;
  const charProgress = Math.min((charCount / MIN_MESSAGE_LENGTH) * 100, 100);
  const progressColor = charCount >= MIN_MESSAGE_LENGTH ? '#16a34a' : charCount >= 10 ? '#ca8a04' : '#ef4444';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-darkBg">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading banter hall...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-darkBg animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-darkCard/80 backdrop-blur-md px-4 pt-6 pb-4 border-b border-gray-800 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-black text-white leading-tight flex items-center gap-2">
            Banter Hall
            <span className="text-[10px] bg-green-600 px-2 py-0.5 rounded-full animate-pulse text-black">LIVE</span>
          </h2>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Global Fan Showdown</p>
        </div>
        <div className="flex items-center gap-2 bg-darkDeep px-3 py-1.5 rounded-full border border-gray-800">
          <span className="text-xs">🔥</span>
          <span className="text-[10px] font-black text-green-500">{banterLevel}% Heat</span>
        </div>
      </div>

      {/* Reward Toast */}
      {showRewardToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <div className="bg-green-600 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-green-500">
            <span className="text-lg">💰</span>
            <span className="text-xs font-black text-black uppercase tracking-widest">+2 FTC Banter Bonus</span>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-green-950/20 border-b border-green-500/30 px-4 py-3 flex items-center justify-between">
        <p className="text-[10px] font-bold text-green-500 uppercase tracking-tight">
          Use <span className="text-white font-black">#banter</span> + min {MIN_MESSAGE_LENGTH} chars to earn FTC!
        </p>
        <div className="flex -space-x-2">
          {messages.slice(0, 3).map((msg, i) => (
            <img key={i} src={msg.avatar} className="w-5 h-5 rounded-full border border-gray-800" alt="Active User" />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-scrollbar bg-transparent" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="text-5xl mb-4">🔥</span>
            <p className="text-gray-400 font-medium">No banter yet!</p>
            <p className="text-xs text-gray-600 mt-2">Be the first to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              <img src={msg.avatar} className="w-8 h-8 rounded-xl object-cover shrink-0 shadow-lg border border-gray-800" alt="Avatar" />
              <div className={`flex flex-col ${msg.isMe ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  {!msg.isMe && <span className="text-[10px] font-black text-gray-300">{msg.sender}</span>}
                  {msg.badge && (
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${msg.isMe ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400'}`}>
                      {msg.badge}
                    </span>
                  )}
                  <span className="text-[8px] text-gray-600 font-bold">{msg.time}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm font-medium ${
                    msg.isMe
                      ? 'bg-green-600 text-black rounded-tr-none shadow-xl'
                      : 'bg-darkCard text-gray-200 rounded-tl-none border border-gray-800'
                  }`}
                >
                  {msg.text.split(' ').map((word, i) =>
                    word.toLowerCase() === '#banter'
                      ? <span key={i} className="text-yellow-400 font-black italic">{word} </span>
                      : word + ' '
                  )}
                </div>
                {!msg.isMe && (
                  <button 
                    onClick={() => handleVote(msg.id)}
                    className="text-[8px] text-gray-500 hover:text-green-500 mt-1 transition-colors"
                  >
                    🔥 Vote (+3 FTC for you)
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-darkCard border-t border-gray-800">
        {validationError && (
          <div className="mb-2 px-3 py-2 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="text-[10px] font-bold text-red-400">{validationError}</span>
          </div>
        )}

        <div className="mb-2 px-1 flex items-center justify-between gap-3">
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${charProgress}%`, backgroundColor: progressColor }} />
          </div>
          <span className="text-[9px] font-black tabular-nums transition-colors duration-300" style={{ color: charCount >= MIN_MESSAGE_LENGTH ? '#16a34a' : '#6b7280' }}>
            {charCount}/{MIN_MESSAGE_LENGTH}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-darkDeep rounded-2xl border border-gray-800 px-4 py-1 flex items-center focus-within:border-green-500/50 transition-colors">
            <input
              type="text"
              placeholder="Say something real... (#banter)"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && charCount >= MIN_MESSAGE_LENGTH && handleSendMessage(e as any)}
              className="w-full bg-transparent py-3 text-sm font-medium outline-none text-white placeholder:text-gray-500"
            />
            <button
              onClick={() => handleInputChange(inputText + (inputText.endsWith(' ') ? '' : ' ') + '#banter')}
              className="bg-gray-800 hover:bg-gray-700 text-green-500 font-black text-[8px] uppercase tracking-widest px-2 py-1 rounded-md transition-all ml-2 shrink-0"
            >
              + #banter
            </button>
          </div>

          <button
            onClick={() => charCount >= MIN_MESSAGE_LENGTH && handleSendMessage()}
            disabled={charCount < MIN_MESSAGE_LENGTH}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all duration-200 ${
              charCount >= MIN_MESSAGE_LENGTH
                ? 'bg-green-600 text-black opacity-100 scale-100'
                : 'bg-gray-800 text-gray-600 opacity-40 scale-90 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {!charCount && (
          <p className="text-[9px] text-gray-600 mt-1.5 px-1">
            {MIN_MESSAGE_LENGTH - charCount} more character{MIN_MESSAGE_LENGTH - charCount !== 1 ? 's' : ''} needed to unlock send
          </p>
        )}
      </div>
    </div>
  );
};

export default BanterHallScreen;
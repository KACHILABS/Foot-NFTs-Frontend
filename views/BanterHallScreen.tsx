import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
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
const POLL_INTERVAL = 3000; // 3 seconds for real-time feel

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
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tg = (window as any).Telegram?.WebApp;

  // Load messages from backend
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
        
        // Check for new messages
        if (formattedMessages.length > 0) {
          const newestId = formattedMessages[0].id;
          if (lastMessageId && newestId !== lastMessageId && !formattedMessages[0].isMe) {
            // New message from someone else - trigger notification
            const newMsg = formattedMessages[0];
            if (onBanterNotify) {
              onBanterNotify(newMsg.content, newMsg.senderName);
            }
            // Vibrate on new message
            tg?.HapticFeedback.impactOccurred('light');
          }
          setLastMessageId(newestId);
        }
        
        setMessages(formattedMessages.reverse()); // Reverse for chronological order
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [backendUserId, lastMessageId, onBanterNotify, tg]);

  // Poll for new messages
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to backend
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    
    try {
      const token = localStorage.getItem('token');
      const isBanter = text.toLowerCase().includes('#banter');
      const clubTag = isBanter ? extractClubTag(text) : null;
      
      const response = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: backendUserId,
          content: text,
          clubTag: clubTag
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear input
        setInputText('');
        
        // Award FTC for banter messages
        if (isBanter) {
          onEarn(2, 'banter');
          tg?.HapticFeedback.notificationOccurred('success');
          
          // Show quick feedback
          if (tg?.showPopup) {
            tg.showPopup({
              title: '🔥 Banter Bonus!',
              message: '+2 FTC earned for your banter!',
              buttons: [{ type: 'ok' }]
            });
          }
        }
        
        // Reload messages
        await loadMessages();
        
        // Focus back on input
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

  const extractClubTag = (text: string): string | null => {
    const clubs = ['Barcelona', 'Real Madrid', 'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea', 'Manchester City', 'Bayern Munich', 'PSG', 'Juventus', 'AC Milan', 'Inter Milan'];
    for (const club of clubs) {
      if (text.toLowerCase().includes(club.toLowerCase())) {
        return club;
      }
    }
    return null;
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
        onEarn(3, 'voting');
        tg?.HapticFeedback.notificationOccurred('success');
        
        // Reload messages to update vote count
        loadMessages();
      } else {
        tg?.showAlert?.(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      tg?.showAlert?.('Network error. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a]">
        <div className="bg-[#1a1a1a] px-4 py-4 flex items-center gap-3 border-b border-gray-800">
          <button onClick={onBack} className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Banter Hall</h2>
            <p className="text-xs text-gray-500">Global Fan Chat</p>
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
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header - Facebook Messenger Style */}
      <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-gray-800 sticky top-0 z-20">
        <button onClick={onBack} className="text-blue-500 font-medium">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Banter Hall</h2>
          <p className="text-xs text-green-500">{messages.length} participants • LIVE</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
          <span className="text-sm">🔥</span>
        </div>
      </div>

      {/* Messages Area - Facebook Messenger Style */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-gray-400 font-medium">No messages yet</p>
            <p className="text-xs text-gray-600 mt-2">Be the first to start the conversation!</p>
            <p className="text-xs text-gray-600 mt-1">Use #banter to earn 2 FTC</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[75%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                {/* Avatar */}
                {!msg.isMe && (
                  <img 
                    src={msg.senderAvatar} 
                    className="w-8 h-8 rounded-full object-cover mt-1" 
                    alt={msg.senderName}
                  />
                )}
                
                {/* Message Bubble */}
                <div>
                  {!msg.isMe && (
                    <p className="text-xs font-semibold text-gray-400 mb-1 ml-1">{msg.senderName}</p>
                  )}
                  <div
                    className={`relative px-4 py-2 rounded-2xl ${
                      msg.isMe
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-[#1a1a1a] text-gray-200 rounded-bl-none border border-gray-800'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    {msg.clubTag && (
                      <span className="inline-block text-[9px] font-bold text-green-500 mt-1">
                        #{msg.clubTag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-1">
                    <span className="text-[9px] text-gray-600">{formatTime(msg.createdAt)}</span>
                    {!msg.isMe && (
                      <button 
                        onClick={() => handleVote(msg.id, msg.userId)}
                        className="text-[9px] text-gray-500 hover:text-yellow-500 transition-colors flex items-center gap-1"
                      >
                        🔥 {msg.votes > 0 && <span className="text-yellow-500">{msg.votes}</span>}
                        <span>Vote</span>
                      </button>
                    )}
                    {msg.isMe && msg.content.toLowerCase().includes('#banter') && (
                      <span className="text-[9px] text-green-500">+2 FTC earned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-end">
            <div className="bg-blue-600/50 px-4 py-2 rounded-2xl rounded-br-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Facebook Messenger Style */}
      <div className="bg-[#1a1a1a] px-3 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#2a2a2a] rounded-full px-4 py-2 flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Say something..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !sending && inputText.trim() && sendMessage()}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
              autoFocus
            />
            {inputText.trim() && (
              <button 
                onClick={() => setInputText('')}
                className="text-gray-500 hover:text-gray-400 ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() && !sending
                ? 'bg-blue-600 text-white active:scale-95'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        
        {/* Tip Banner */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-[8px] text-gray-600">💡 Use</span>
          <span className="text-[8px] font-bold text-yellow-500">#banter</span>
          <span className="text-[8px] text-gray-600">to earn 2 FTC per message</span>
        </div>
      </div>
    </div>
  );
};

export default BanterHallScreen;
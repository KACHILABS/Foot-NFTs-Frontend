import React, { useState, useEffect, useRef, useCallback } from 'react';
import FanRankBadge from '../components/FanRankBadge';
import Card from '../components/Card';
import { Club, UserProfile } from '../types';

const API_BASE = 'https://footnfts.up.railway.app/api';
const POLL_INTERVAL = 4000;

interface ChatRoomScreenProps {
  club: Club;
  profile: UserProfile | null;
  onBack: () => void;
  onRecordActivity: () => void;
  backendUserId?: string | null;
}

type FanZoneTab = 'match' | 'terrace' | 'tactics' | 'hq';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  avatar: string | null;
}

interface LiveMatch {
  status: string;
  isLive: boolean;
  isFinished: boolean;
  minute: number | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  competition: string;
  ourTeam: string;
  opponent: string;
  ourScore: number | null;
  theirScore: number | null;
  isHome: boolean;
  utcDate: string;
}

interface TacticsPoll {
  id: string;
  title: string;
  description: string;
  category: string;
  ends_at: string;
  total_votes: number;
  options: { id: string; label: string; icon: string; description: string; votes: number }[];
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  club, profile, onBack, onRecordActivity, backendUserId,
}) => {
  const [activeTab, setActiveTab] = useState<FanZoneTab>('terrace');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);

  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);

  const [tactics, setTactics] = useState<TacticsPoll[]>([]);
  const [loadingTactics, setLoadingTactics] = useState(true);
  const [votedPollIds, setVotedPollIds] = useState<Set<string>>(new Set());
  const [pendingVote, setPendingVote] = useState<{ pollId: string; optionId: string } | null>(null);
  const [submittingVote, setSubmittingVote] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMsgCount = useRef(0);
  const tg = (window as any).Telegram?.WebApp;

  // ── Chat polling ─────────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/fanzone/messages/${club.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (lastMsgCount.current > 0 && data.messages.length > lastMsgCount.current) {
          tg?.HapticFeedback?.impactOccurred('light');
        }
        lastMsgCount.current = data.messages.length;
      }
    } catch (_) {}
    setLoadingChat(false);
  }, [club.id]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab !== 'terrace') return;
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages, activeTab]);

  // ── Matchday ─────────────────────────────────────────────────────────────────
  const fetchMatchday = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/fanzone/matchday/${club.id}`);
      const data = await res.json();
      if (data.success && data.match) setLiveMatch(data.match);
      else setLiveMatch(null);
    } catch (_) {}
    setLoadingMatch(false);
  }, [club.id]);

  useEffect(() => {
    fetchMatchday();
    const interval = setInterval(fetchMatchday, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchMatchday]);

  // ── Tactics ──────────────────────────────────────────────────────────────────
  const fetchTactics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/fanzone/tactics/${club.id}`);
      const data = await res.json();
      if (data.success) setTactics(data.polls || []);
    } catch (_) {}
    setLoadingTactics(false);
  }, [club.id]);

  useEffect(() => {
    fetchTactics();
    const interval = setInterval(fetchTactics, 15000);
    return () => clearInterval(interval);
  }, [fetchTactics]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending || !backendUserId) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/fanzone/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ clubId: club.id, userId: backendUserId, content: text }),
      });
      const data = await res.json();
      if (data.success) {
        setInputText('');
        await fetchMessages();
        onRecordActivity();
        tg?.HapticFeedback?.notificationOccurred('success');
      }
    } catch (_) {}
    setSending(false);
  };

  // ── Submit tactics vote ───────────────────────────────────────────────────────
  const submitTacticsVote = async () => {
    if (!pendingVote || !backendUserId || submittingVote) return;
    setSubmittingVote(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/fanzone/tactics/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pollId: pendingVote.pollId, optionId: pendingVote.optionId, userId: backendUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setVotedPollIds(prev => new Set(prev).add(pendingVote.pollId));
        setPendingVote(null);
        await fetchTactics();
        tg?.HapticFeedback?.notificationOccurred('success');
      } else {
        tg?.showAlert?.(data.error || 'Vote failed');
      }
    } catch (_) {}
    setSubmittingVote(false);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
      const diff = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return d.toLocaleDateString();
    } catch { return ''; }
  };

  // ── Render: Matchday ─────────────────────────────────────────────────────────
  const renderMatch = () => {
    if (loadingMatch) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!liveMatch) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-6xl">📅</span>
          <p className="text-white font-black text-lg">No match today</p>
          <p className="text-gray-400 text-sm">Check back on matchday for live updates</p>
        </div>
      );
    }

    const statusLabel = liveMatch.isLive
      ? liveMatch.minute ? `${liveMatch.minute}'` : 'LIVE'
      : liveMatch.isFinished ? 'FT'
      : liveMatch.status === 'HALF_TIME' ? 'HT'
      : new Date(liveMatch.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Scoreboard */}
        <Card className="bg-darkDeep border border-gray-800 overflow-hidden p-0">
          <div className={`px-4 py-1.5 flex justify-between items-center ${liveMatch.isLive ? 'bg-green-600' : 'bg-gray-800'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-black">
              {liveMatch.isLive && <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
              {liveMatch.isLive ? 'Live' : liveMatch.isFinished ? 'Full Time' : 'Upcoming'} · {liveMatch.competition}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${liveMatch.isLive ? 'text-black' : 'text-gray-300'}`}>
              {statusLabel}
            </span>
          </div>
          <div className="p-6 flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <img src={club.badge} className="w-14 h-14 object-contain" alt={liveMatch.homeTeam} />
              <p className="text-xs font-black text-white text-center max-w-[80px] leading-tight">{liveMatch.homeTeam}</p>
            </div>
            <div className="text-center">
              {(liveMatch.homeScore != null && liveMatch.awayScore != null) ? (
                <p className="text-5xl font-black text-white">{liveMatch.homeScore} – {liveMatch.awayScore}</p>
              ) : (
                <p className="text-2xl font-black text-gray-400">vs</p>
              )}
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">
                {liveMatch.isLive ? '● Live' : liveMatch.isFinished ? 'Final Score' : 'Kickoff'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-60">
              <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-2xl">🛡️</div>
              <p className="text-xs font-black text-white text-center max-w-[80px] leading-tight">{liveMatch.awayTeam}</p>
            </div>
          </div>
        </Card>

        {/* Match info */}
        <Card className="bg-darkCard border border-gray-800 p-4 space-y-2">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Match Info</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Competition</span>
            <span className="text-white font-bold">{liveMatch.competition}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Venue</span>
            <span className="text-white font-bold">{liveMatch.isHome ? 'Home' : 'Away'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className={`font-bold ${liveMatch.isLive ? 'text-green-500' : 'text-gray-300'}`}>{liveMatch.status}</span>
          </div>
        </Card>
      </div>
    );
  };

  // ── Render: Terrace (live chat) ───────────────────────────────────────────────
  const renderTerrace = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" ref={scrollRef}>
        {loadingChat ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl">🗣️</span>
            <p className="text-white font-black">No messages yet</p>
            <p className="text-gray-400 text-sm">Be the first to shout from the terrace!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.userId === backendUserId;
            return (
              <div key={msg.id} className={`flex gap-2 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-gray-700">
                  {msg.avatar ? (
                    <img src={msg.avatar} alt={msg.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-sm">⚽</div>
                  )}
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    {!isMe && <span className="text-[10px] font-black text-white">{msg.username}</span>}
                    <span className="text-[8px] text-gray-500">{formatTime(msg.createdAt)}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-2xl text-sm font-medium leading-snug ${
                    isMe
                      ? 'bg-green-600 text-black rounded-tr-none'
                      : 'bg-darkCard text-gray-200 border border-gray-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 bg-darkCard border-t border-gray-800 flex items-center gap-2 pb-6">
        <div className="flex-1 bg-darkDeep rounded-2xl border border-gray-800 px-4 flex items-center">
          <input
            type="text"
            placeholder="Shout from the terrace..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            className="w-full bg-transparent py-3 text-sm outline-none text-white placeholder:text-gray-500"
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || sending}
          className="w-11 h-11 bg-green-600 text-black rounded-2xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );

  // ── Render: Tactics (live polls) ─────────────────────────────────────────────
  const renderTactics = () => {
    if (loadingTactics) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (tactics.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-6xl">📋</span>
          <p className="text-white font-black text-lg">No active polls</p>
          <p className="text-gray-400 text-sm">Tactical polls will appear here when the manager opens them</p>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-24">
        {tactics.map(poll => {
          const isVoted = votedPollIds.has(poll.id);
          const isPending = pendingVote?.pollId === poll.id;
          const totalVotes = poll.total_votes || poll.options.reduce((s, o) => s + o.votes, 0) || 1;

          return (
            <Card key={poll.id} className="bg-darkCard border border-gray-800 p-5 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-950/30 text-orange-500">
                  {poll.category}
                </span>
                <span className="text-[9px] text-gray-500 font-bold">
                  {poll.total_votes.toLocaleString()} votes
                </span>
              </div>
              <h3 className="text-base font-black text-white">{poll.title}</h3>
              <p className="text-xs text-gray-400">{poll.description}</p>

              <div className="space-y-2">
                {poll.options.map(opt => {
                  const pct = Math.round((opt.votes / totalVotes) * 100);
                  const isSelected = pendingVote?.optionId === opt.id && isPending;
                  return (
                    <button
                      key={opt.id}
                      disabled={isVoted}
                      onClick={() => !isVoted && setPendingVote({ pollId: poll.id, optionId: opt.id })}
                      className={`w-full relative h-14 rounded-2xl border transition-all overflow-hidden text-left ${
                        isVoted ? 'cursor-default border-gray-800' :
                        isSelected ? 'border-green-500 bg-green-950/20' :
                        'border-gray-800 bg-darkDeep active:scale-[0.98]'
                      }`}
                    >
                      {isVoted && (
                        <div className="absolute inset-y-0 left-0 bg-green-500/10 transition-all duration-700" style={{ width: `${pct}%` }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{opt.icon}</span>
                          <span className={`text-sm font-black ${isSelected ? 'text-green-400' : 'text-gray-200'}`}>{opt.label}</span>
                        </div>
                        {isVoted && <span className="text-xs font-black text-green-500">{pct}%</span>}
                        {!isVoted && isSelected && <span className="text-[9px] font-black text-green-500 uppercase">Selected</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!isVoted && isPending && (
                <button
                  onClick={submitTacticsVote}
                  disabled={submittingVote}
                  className="w-full bg-green-600 text-black py-3 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingVote ? 'Submitting...' : 'Confirm Vote · +15 FTC'}
                </button>
              )}

              {isVoted && (
                <p className="text-[10px] text-green-500 font-black uppercase text-center tracking-widest">✓ Vote recorded</p>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  // ── Render: Club HQ ───────────────────────────────────────────────────────────
  const renderHQ = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
      <Card className="bg-darkDeep border border-gray-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-600 opacity-10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-darkCard rounded-2xl p-3 mb-3 border border-gray-800">
            <img src={club.badge} className="w-full h-full object-contain" alt={club.name} />
          </div>
          <h2 className="text-xl font-black text-white mb-1">{club.name} HQ</h2>
          <p className="text-green-500 font-bold text-[10px] uppercase tracking-widest mb-4">Institutional Hub</p>
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-center"><p className="text-xl font-black text-white">{club.trophies.league}</p><p className="text-[8px] uppercase tracking-widest text-gray-500">Leagues</p></div>
            <div className="text-center"><p className="text-xl font-black text-white">{club.trophies.continental}</p><p className="text-[8px] uppercase tracking-widest text-gray-500">Europe</p></div>
            <div className="text-center"><p className="text-xl font-black text-white">{club.trophies.domestic}</p><p className="text-[8px] uppercase tracking-widest text-gray-500">Cups</p></div>
          </div>
        </div>
      </Card>
      <Card className="p-0 overflow-hidden border border-gray-800 divide-y divide-gray-800 bg-darkCard">
        {[
          { label: 'Founded', value: club.foundedYear, icon: '📅' },
          { label: 'Coach', value: club.coach.name, icon: '👔' },
          { label: 'Value Range', value: club.valueRange, icon: '💎' },
          { label: 'Philosophy', value: club.coach.philosophy, icon: '🧠' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3"><span className="text-xl">{item.icon}</span><span className="text-xs font-bold text-gray-400">{item.label}</span></div>
            <span className="text-xs font-black text-white">{item.value}</span>
          </div>
        ))}
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-darkBg overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-darkCard px-4 pt-10 pb-0 border-b border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 mb-4 px-1">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-95 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 bg-darkDeep rounded-xl p-1.5 flex items-center justify-center">
            <img src={club.badge} className="w-full h-full object-contain" alt="Club" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-black text-white uppercase tracking-tight">{club.name} Fan Zone</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Live · Digital Stadium</p>
            </div>
          </div>
          {/* Online avatars */}
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-gray-800 flex items-center justify-center text-[9px]">⚽</div>
            ))}
            <div className="w-6 h-6 rounded-full bg-green-600 border border-gray-800 flex items-center justify-center text-[7px] font-black text-black">+</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-2 overflow-x-auto no-scrollbar">
          {([
            { id: 'match', label: 'Matchday', icon: '⚽' },
            { id: 'terrace', label: 'Terrace', icon: '🗣️' },
            { id: 'tactics', label: 'Tactics', icon: '📋' },
            { id: 'hq', label: 'Club HQ', icon: '🏢' },
          ] as { id: FanZoneTab; label: string; icon: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0 ${
                activeTab === tab.id ? 'text-green-500' : 'text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-green-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'match' && renderMatch()}
        {activeTab === 'terrace' && renderTerrace()}
        {activeTab === 'tactics' && renderTactics()}
        {activeTab === 'hq' && renderHQ()}
      </div>
    </div>
  );
};

export default ChatRoomScreen;

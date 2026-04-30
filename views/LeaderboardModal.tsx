import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

interface LeaderboardUser {
  rank: number;
  id: string;
  telegramId: string;
  username: string;
  ftcBalance: number;
  avatar?: string;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string | null;
  apiBase: string;
}

const RANK_BADGE: Record<number, { emoji: string; color: string }> = {
  1: { emoji: '🥇', color: '#FFD700' },
  2: { emoji: '🥈', color: '#C0C0C0' },
  3: { emoji: '🥉', color: '#CD7F32' },
};

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  apiBase,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userFTC, setUserFTC] = useState<number>(0);

  useEffect(() => {
    if (isOpen) fetchLeaderboard();
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/leaderboard`);
      const data = await response.json();

      if (data.success && data.leaderboard) {
        // Also fetch avatars from users table via profile endpoint
        const enriched: LeaderboardUser[] = data.leaderboard.map((u: any) => ({
          rank: u.rank,
          id: u.id,
          telegramId: u.telegramId,
          // Fix: never show raw "User" — always fall back to Fan_<id>
          username: u.username && u.username !== 'User' ? u.username : `Fan_${u.telegramId}`,
          ftcBalance: u.ftcBalance || 0,
          avatar: u.avatar || null,
        }));
        setLeaderboard(enriched);

        if (currentUserId) {
          const me = enriched.find(u => u.id === currentUserId);
          if (me) {
            setUserRank(me.rank);
            setUserFTC(me.ftcBalance);
          } else {
            // Not in top 100 — fetch from profile
            const telegramId = localStorage.getItem('telegramId');
            const token = localStorage.getItem('token');
            if (telegramId && token) {
              try {
                const profileRes = await fetch(`${apiBase}/user/profile?telegramId=${telegramId}`, {
                  headers: { 'Authorization': `Bearer ${token}` },
                });
                const profileData = await profileRes.json();
                if (profileData.success) {
                  if (profileData.profile?.globalRank != null) setUserRank(profileData.profile.globalRank);
                  setUserFTC(profileData.profile?.ftcBalance || 0);
                }
              } catch (_) {}
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Header */}
      <div className="shrink-0 bg-darkCard/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">🏆 Leaderboard</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">Top fans by FTC balance</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Your rank banner */}
      {userRank != null && (
        <div className="shrink-0 bg-green-600/10 border-b border-green-500/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center text-xl">👑</div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Your Rank</p>
                <p className="text-xl font-black text-white">#{userRank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Your FTC</p>
              <p className="text-xl font-black text-green-500">{userFTC}</p>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable list — takes all remaining height */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🏆</span>
            <p className="text-gray-400">No users yet</p>
            <p className="text-xs text-gray-600 mt-2">Be the first to earn FTC!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {leaderboard.map(user => {
              const badge = RANK_BADGE[user.rank];
              const isMe = user.id === currentUserId;
              return (
                <div
                  key={user.id}
                  className={`px-4 py-3 flex items-center gap-3 ${isMe ? 'bg-green-600/5 border-l-4 border-l-green-500' : ''}`}
                >
                  {/* Position badge */}
                  <div className="w-10 shrink-0 flex items-center justify-center">
                    {badge ? (
                      <span className="text-2xl">{badge.emoji}</span>
                    ) : (
                      <span
                        className="text-xs font-black px-1.5 py-0.5 rounded-full border"
                        style={{ color: '#6b7280', borderColor: '#374151' }}
                      >
                        #{user.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar with rank ring */}
                  <div className="relative shrink-0">
                    <div
                      className="w-11 h-11 rounded-xl overflow-hidden border-2"
                      style={{ borderColor: badge ? badge.color : isMe ? '#22c55e' : '#374151' }}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-lg">
                          ⚽
                        </div>
                      )}
                    </div>
                    {/* Small rank number overlay for top 3 */}
                    {badge && (
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-black"
                        style={{ background: badge.color }}
                      >
                        {user.rank}
                      </div>
                    )}
                  </div>

                  {/* Name + telegram id */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">
                      {user.username}
                      {isMe && (
                        <span className="ml-2 text-[9px] bg-green-600 text-black px-2 py-0.5 rounded-full font-black">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-[9px] text-gray-500 font-mono truncate">
                      @{user.telegramId}
                    </p>
                  </div>

                  {/* FTC */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-green-500">{user.ftcBalance.toLocaleString()}</p>
                    <p className="text-[8px] text-gray-500 uppercase">FTC</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Close button pinned to bottom */}
      <div className="shrink-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <Button onClick={onClose} variant="secondary" className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardModal;

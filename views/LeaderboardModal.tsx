import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

interface LeaderboardUser {
  rank: number;
  id: string;
  telegramId: string;
  username: string;
  ftcBalance: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string | null;
  apiBase: string;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUserId,
  apiBase 
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/leaderboard`);
      const data = await response.json();
      
      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
        
        // Find current user's rank
        if (currentUserId) {
          const user = data.leaderboard.find((u: LeaderboardUser) => u.id === currentUserId);
          if (user) {
            setUserRank(user.rank);
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
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-darkCard/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center justify-between">
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

      {/* User's Rank Banner */}
      {userRank && (
        <div className="bg-green-600/10 border-b border-green-500/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                <span className="text-xl">👑</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Your Rank</p>
                <p className="text-xl font-black text-white">#{userRank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Your FTC</p>
              <p className="text-xl font-black text-green-500">
                {leaderboard.find(u => u.id === currentUserId)?.ftcBalance || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="overflow-y-auto h-full pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <div className="divide-y divide-gray-800">
            {leaderboard.map((user) => (
              <div 
                key={user.id}
                className={`px-4 py-3 flex items-center gap-4 ${
                  user.id === currentUserId ? 'bg-green-600/5 border-l-4 border-l-green-500' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  {user.rank === 1 && <span className="text-2xl">🥇</span>}
                  {user.rank === 2 && <span className="text-2xl">🥈</span>}
                  {user.rank === 3 && <span className="text-2xl">🥉</span>}
                  {user.rank > 3 && (
                    <span className="text-lg font-black text-gray-500">#{user.rank}</span>
                  )}
                </div>

                {/* Avatar placeholder */}
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden">
                  <span className="text-xl">⚽</span>
                </div>

                {/* User info */}
                <div className="flex-1">
                  <p className="font-bold text-white">
                    {user.username}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-[10px] bg-green-600 text-black px-2 py-0.5 rounded-full font-black">
                        YOU
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {user.telegramId}
                  </p>
                </div>

                {/* FTC Balance */}
                <div className="text-right">
                  <p className="text-xl font-black text-green-500">{user.ftcBalance}</p>
                  <p className="text-[8px] text-gray-500 uppercase">FTC</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
        <Button onClick={onClose} variant="secondary" className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardModal;
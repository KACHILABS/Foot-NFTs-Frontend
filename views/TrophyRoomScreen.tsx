import React, { useState, useEffect } from 'react';

const API_BASE = 'https://footnfts.up.railway.app/api';

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: string;
  category: string;
  earned: boolean;
  earnedAt?: string;
}

interface TrophyRoomScreenProps {
  onBack: () => void;
  backendUserId?: string | null;
}

const RARITY_STYLES: Record<string, string> = {
  common: 'border-gray-600 bg-gray-800/60 text-gray-400',
  rare: 'border-blue-500 bg-blue-950/40 text-blue-400',
  epic: 'border-purple-500 bg-purple-950/40 text-purple-400',
  legendary: 'border-yellow-500 bg-yellow-950/40 text-yellow-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  jersey: 'Jersey',
  banter: 'Banter',
  earnings: 'Earnings',
  referral: 'Referral',
  trivia: 'Trivia',
  general: 'General',
};

const RARITY_ORDER: Record<string, number> = {
  legendary: 0,
  epic: 1,
  rare: 2,
  common: 3,
};

const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ onBack, backendUserId }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (backendUserId) {
      loadBadges();
    } else {
      setBadges([]);
      setLoading(false);
    }
  }, [backendUserId]);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/badges/user/${backendUserId}`);
      const data = await res.json();
      console.log('Badges data:', data);

      if (data.success) {
        const badgeList = Array.isArray(data.badges)
          ? data.badges
          : data.badges?.all && Array.isArray(data.badges.all)
            ? data.badges.all
            : [];

        const normalized = badgeList.map((badge: Badge) => ({
          ...badge,
          rarity: badge.rarity || 'common',
          category: badge.category || 'general',
          earned: Boolean(badge.earned),
        }));

        normalized.sort((a, b) => (RARITY_ORDER[a.rarity] || 3) - (RARITY_ORDER[b.rarity] || 3));
        setBadges(normalized);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error('Failed to load badges:', error);
      setBadges([]);
    }
    setLoading(false);
  };

  const filteredBadges = activeCategory === 'all'
    ? badges
    : badges.filter(b => b.category === activeCategory);

  const earnedBadges = filteredBadges.filter(b => b.earned);
  const lockedBadges = filteredBadges.filter(b => !b.earned);
  const totalBadges = badges.length;
  const earnedCount = badges.filter(b => b.earned).length;
  const progress = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;

  const categories = ['all', 'jersey', 'banter', 'earnings', 'referral', 'trivia'];

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-darkBg flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your trophies...</p>
        </div>
      </div>
    );
  }

  if (!backendUserId) {
    return (
      <div className="fixed inset-0 bg-darkBg flex items-center justify-center z-50 px-4">
        <div className="max-w-md text-center bg-darkCard border border-gray-800 rounded-3xl p-8">
          <h2 className="text-xl font-black text-white mb-2">Trophy Room</h2>
          <p className="text-gray-400">No user selected. Please return to the dashboard.</p>
          <button onClick={onBack} className="mt-6 bg-green-600 text-black px-5 py-3 rounded-2xl font-bold">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-darkBg flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="shrink-0 bg-darkCard border-b border-gray-800 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-95 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-white">Trophy Room</h2>
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
              {earnedCount}/{totalBadges} Badges Earned
            </p>
          </div>
        </div>
        <div className="space-y-1.5 mt-3">
          <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
            <span>Collection Progress</span>
            <span className="text-green-500">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-green-600 text-black'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-3 px-1">
              Earned ({earnedBadges.length})
            </p>
            <div className="grid grid-cols-3 gap-3">
              {earnedBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 ${RARITY_STYLES[badge.rarity] || RARITY_STYLES.common} active:scale-95 transition-all`}
                >
                  <div className="text-3xl">{badge.emoji}</div>
                  <p className="text-[9px] font-black text-white text-center leading-tight">{badge.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 px-1">
              Locked ({lockedBadges.length})
            </p>
            <div className="grid grid-cols-3 gap-3">
              {lockedBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-800 bg-gray-900/40 opacity-60 active:scale-95 transition-all`}
                >
                  <div className="text-3xl grayscale">{badge.emoji}</div>
                  <p className="text-[9px] font-black text-gray-500 text-center leading-tight">{badge.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {badges.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="text-6xl mb-4">Trophy Room</div>
            <p className="text-gray-400 text-center">No badges yet</p>
            <p className="text-gray-500 text-sm text-center">Start earning badges by using the app.</p>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full max-w-sm bg-darkCard rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className={`w-20 h-20 rounded-3xl border-2 ${RARITY_STYLES[selectedBadge.rarity] || RARITY_STYLES.common} flex items-center justify-center text-5xl ${!selectedBadge.earned ? 'grayscale opacity-50' : ''}`}>
                {selectedBadge.emoji}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{selectedBadge.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                  {selectedBadge.rarity?.toUpperCase() || 'COMMON'} · {CATEGORY_LABELS[selectedBadge.category] || selectedBadge.category || 'General'}
                </p>
              </div>
              <p className="text-sm text-gray-400">{selectedBadge.description}</p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm bg-darkDeep rounded-xl px-4 py-3">
                <span className="text-gray-400">Status</span>
                <span className={selectedBadge.earned ? 'text-green-500 font-bold' : 'text-gray-500 font-bold'}>
                  {selectedBadge.earned ? '✅ Earned' : '🔒 Locked'}
                </span>
              </div>
              {selectedBadge.earnedAt && (
                <div className="flex justify-between text-sm bg-darkDeep rounded-xl px-4 py-3">
                  <span className="text-gray-400">Earned</span>
                  <span className="text-white font-bold">{formatDate(selectedBadge.earnedAt)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full bg-gray-800 text-white py-3 rounded-2xl font-black text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrophyRoomScreen;
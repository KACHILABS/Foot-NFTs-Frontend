import React, { useState, useEffect } from 'react';

const API_BASE = 'https://footnfts.up.railway.app/api';

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  ftcReward: number;
  category: string;
  earnedAt?: string;
}

interface TrophyRoomScreenProps {
  onBack: () => void;
  backendUserId?: string | null;
}

const RARITY_STYLE: Record<string, { border: string; bg: string; text: string; label: string }> = {
  common:    { border: 'border-gray-600',    bg: 'bg-gray-800/60',        text: 'text-gray-400',   label: 'Common'    },
  rare:      { border: 'border-blue-500',    bg: 'bg-blue-950/40',        text: 'text-blue-400',   label: 'Rare'      },
  epic:      { border: 'border-purple-500',  bg: 'bg-purple-950/40',      text: 'text-purple-400', label: 'Epic'      },
  legendary: { border: 'border-yellow-500',  bg: 'bg-yellow-950/40',      text: 'text-yellow-400', label: 'Legendary' },
};

const CATEGORY_ICONS: Record<string, string> = {
  jersey: '👕', banter: '🔥', earnings: '💰', referral: '🤝', trivia: '🧠', special: '🏅',
};

const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ onBack, backendUserId }) => {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (backendUserId) {
      // Auto-award any eligible badges the user hasn't received yet
      fetch(`${API_BASE}/badges/check-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: backendUserId }),
      }).catch(() => {});
    }
    loadBadges();
  }, [backendUserId]);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const [defsRes, earnedRes] = await Promise.all([
        fetch(`${API_BASE}/badges/definitions`),
        backendUserId
          ? fetch(`${API_BASE}/badges/user/${backendUserId}`)
          : Promise.resolve({ json: async () => ({ badges: [] }) } as any),
      ]);
      const defs = await defsRes.json();
      const earned = await earnedRes.json();

      if (defs.success) setAllBadges(defs.badges);
      if (earned.success) setEarnedBadges(earned.badges);
    } catch (err) {
      console.error('Failed to load badges:', err);
    }
    setLoading(false);
  };

  const earnedIds = new Set(earnedBadges.map(b => b.id));
  const categories = ['all', ...Array.from(new Set(allBadges.map(b => b.category)))];

  const filtered = allBadges.filter(b =>
    activeCategory === 'all' || b.category === activeCategory
  );

  const earnedCount = earnedBadges.length;
  const totalCount = allBadges.length;
  const progress = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-darkBg flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="shrink-0 bg-darkCard border-b border-gray-800 px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-95 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">🏆 Trophy Room</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              {earnedCount}/{totalCount} Badges Earned
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
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
              {cat === 'all' ? '⚡ All' : `${CATEGORY_ICONS[cat] || '🏅'} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Earned section */}
            {earnedBadges.filter(b => activeCategory === 'all' || b.category === activeCategory).length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-3 px-1">
                  ✓ Earned ({earnedBadges.filter(b => activeCategory === 'all' || b.category === activeCategory).length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {earnedBadges
                    .filter(b => activeCategory === 'all' || b.category === activeCategory)
                    .map(badge => {
                      const style = RARITY_STYLE[badge.rarity];
                      return (
                        <button
                          key={badge.id}
                          onClick={() => setSelectedBadge(badge)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 ${style.border} ${style.bg} active:scale-95 transition-all`}
                        >
                          <div className="text-3xl">{badge.emoji}</div>
                          <p className="text-[9px] font-black text-white text-center leading-tight">{badge.name}</p>
                          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${style.text} bg-black/30`}>
                            {style.label}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Locked section */}
            {filtered.filter(b => !earnedIds.has(b.id)).length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 px-1">
                  🔒 Locked ({filtered.filter(b => !earnedIds.has(b.id)).length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {filtered
                    .filter(b => !earnedIds.has(b.id))
                    .map(badge => (
                      <button
                        key={badge.id}
                        onClick={() => setSelectedBadge(badge)}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-800 bg-gray-900/40 active:scale-95 transition-all opacity-60"
                      >
                        <div className="text-3xl grayscale">{badge.emoji}</div>
                        <p className="text-[9px] font-black text-gray-500 text-center leading-tight">{badge.name}</p>
                        <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full text-gray-600 bg-black/30">
                          {RARITY_STYLE[badge.rarity]?.label}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Badge detail modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full max-w-sm bg-darkCard rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const isEarned = earnedIds.has(selectedBadge.id);
              const style = RARITY_STYLE[selectedBadge.rarity];
              const earnedData = earnedBadges.find(b => b.id === selectedBadge.id);
              return (
                <>
                  <div className="flex flex-col items-center text-center gap-3 mb-6">
                    <div className={`w-20 h-20 rounded-3xl border-2 ${style.border} ${style.bg} flex items-center justify-center text-5xl ${!isEarned ? 'grayscale opacity-50' : ''}`}>
                      {selectedBadge.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{selectedBadge.name}</h3>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>
                        {style.label} · {CATEGORY_ICONS[selectedBadge.category]} {selectedBadge.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{selectedBadge.description}</p>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm bg-darkDeep rounded-xl px-4 py-3">
                      <span className="text-gray-400">FTC Reward</span>
                      <span className="text-green-500 font-black">+{selectedBadge.ftcReward} FTC</span>
                    </div>
                    {isEarned && earnedData?.earnedAt && (
                      <div className="flex justify-between text-sm bg-darkDeep rounded-xl px-4 py-3">
                        <span className="text-gray-400">Earned</span>
                        <span className="text-white font-bold">{formatDate(earnedData.earnedAt)}</span>
                      </div>
                    )}
                    {!isEarned && (
                      <div className="flex justify-between text-sm bg-darkDeep rounded-xl px-4 py-3">
                        <span className="text-gray-400">Status</span>
                        <span className="text-gray-500 font-bold">🔒 Not yet earned</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="w-full bg-gray-800 text-white py-3 rounded-2xl font-black text-sm"
                  >
                    Close
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrophyRoomScreen;

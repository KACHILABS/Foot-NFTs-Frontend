import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Club, UserProfile } from '../types';

const API_BASE = 'https://footnfts.up.railway.app/api';

interface JerseyDayScreenProps {
  club: Club;
  profile: UserProfile | null;
  onBack: () => void;
  onCheckIn: (amount: number) => void;
  userId?: string | null;
}

const JerseyDayScreen: React.FC<JerseyDayScreenProps> = ({ club, profile, onBack, onCheckIn, userId }) => {
  const [selectedKit, setSelectedKit] = useState<'home' | 'away' | 'third'>('home');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [jerseyImages, setJerseyImages] = useState({
    home: '',
    away: '',
    third: ''
  });
  const [matchInfo, setMatchInfo] = useState<{
    hasMatch: boolean;
    matchType: string | null;
    opponent: string | null;
    competition: string | null;
  }>({ hasMatch: false, matchType: null, opponent: null, competition: null });
  
  const [availability, setAvailability] = useState({
    homeAvailable: false,
    awayAvailable: false,
    thirdAvailable: true,
    homeReward: 0,
    awayReward: 0,
    thirdReward: 5
  });

  const kits = [
    { id: 'home' as const, name: 'Home Kit', icon: '🏠', matchRequired: 'Home Match Day' },
    { id: 'away' as const, name: 'Away Kit', icon: '✈️', matchRequired: 'Away Match Day' },
    { id: 'third' as const, name: 'Third Kit', icon: '🎽', matchRequired: 'Available Every Day' },
  ];

  useEffect(() => {
    if (club?.id && userId) {
      loadData();
      loadJerseyImages();
    } else if (club?.id) {
      setLoading(false);
    }
  }, [club?.id, userId]);

  const loadJerseyImages = async () => {
    try {
      const res = await fetch(`${API_BASE}/jersey/images/${club.id}`);
      const data = await res.json();
      if (data.success) {
        setJerseyImages(data.images);
      }
    } catch (error) {
      console.error('Error loading jersey images:', error);
    }
  };

  const loadData = async () => {
    try {
      const matchRes = await fetch(`${API_BASE}/jersey/match/today/${club.id}`);
      const matchData = await matchRes.json();
      
      if (matchData.success && matchData.hasMatch) {
        setMatchInfo(matchData);
      }
      
      const availRes = await fetch(`${API_BASE}/jersey/available/${club.id}`);
      const availData = await availRes.json();
      
      if (availData.success) {
        setAvailability(availData);
        
        if (availData.homeAvailable) {
          setSelectedKit('home');
        } else if (availData.awayAvailable) {
          setSelectedKit('away');
        } else {
          setSelectedKit('third');
        }
      }
      
      if (userId) {
        const statusRes = await fetch(`${API_BASE}/jersey/check-status?userId=${userId}`);
        const statusData = await statusRes.json();
        
        if (statusData.success) {
          setHasCheckedIn(statusData.hasCheckedIn);
        }
      }
      
    } catch (error) {
      console.error('Error loading Jersey Day data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInSubmit = async () => {
    if (hasCheckedIn || checkingIn || !userId) return;
    
    if (selectedKit === 'home' && !availability.homeAvailable) {
      alert('Home kit is only available on home match days!');
      return;
    }
    if (selectedKit === 'away' && !availability.awayAvailable) {
      alert('Away kit is only available on away match days!');
      return;
    }
    
    setCheckingIn(true);
    
    try {
      const response = await fetch(`${API_BASE}/jersey/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          clubId: club.id,
          kitType: selectedKit
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHasCheckedIn(true);
        onCheckIn(data.reward);
      } else {
        alert(data.error || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Network error. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const getRewardForKit = (kitType: string) => {
    if (kitType === 'home') return availability.homeReward;
    if (kitType === 'away') return availability.awayReward;
    return availability.thirdReward;
  };

  const isKitAvailable = (kitType: string) => {
    if (kitType === 'home') return availability.homeAvailable;
    if (kitType === 'away') return availability.awayAvailable;
    return availability.thirdAvailable;
  };

  const selectedKitData = kits.find(k => k.id === selectedKit);
  const rewardAmount = getRewardForKit(selectedKit);
  const kitAvailable = isKitAvailable(selectedKit);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-darkBg">
        <div className="bg-darkCard px-6 pt-12 pb-6 border-b border-gray-800">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading match schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-darkBg animate-in slide-in-from-right-10 duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-darkCard px-6 pt-12 pb-6 border-b border-gray-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">Jersey Day</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rep your Colors • Match Day</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-green-950/30 rounded-2xl flex items-center justify-center text-2xl">
          👕
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {/* Match Day Banner */}
        {matchInfo.hasMatch && (
          <Card className="border border-green-500/30 shadow-xl bg-green-950/20 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 opacity-10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-2">⚽ MATCH DAY</p>
              <h3 className="text-xl font-black mb-1">{club.name} vs {matchInfo.opponent}</h3>
              <p className="text-xs text-gray-400">{matchInfo.competition} • {matchInfo.matchType === 'home' ? '🏠 Home' : '✈️ Away'}</p>
              <p className="text-xs text-green-500 mt-3 font-bold">Rep your {matchInfo.matchType} kit for +15 FTC!</p>
            </div>
          </Card>
        )}

        {/* Status Card */}
        <Card className="border border-gray-800 shadow-xl bg-darkDeep text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-2">Today's Objective</p>
            <h3 className="text-2xl font-black mb-2">Wear the {club.name} Colors</h3>
            <p className="text-sm text-gray-400 leading-relaxed pr-8">
              {matchInfo.hasMatch 
                ? `Match day vs ${matchInfo.opponent}! Rep your ${matchInfo.matchType} kit for 15 FTC.`
                : `No match today. Rep your third kit for 5 FTC.`
              }
            </p>
          </div>
        </Card>

        {/* Kit Selection */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] px-1">Select Your Kit</p>
          <div className="grid grid-cols-3 gap-4">
            {kits.map((kit) => {
              const available = isKitAvailable(kit.id);
              const reward = getRewardForKit(kit.id);
              const isSelected = selectedKit === kit.id;
              const kitImage = jerseyImages[kit.id];
              
              return (
                <button 
                  key={kit.id}
                  onClick={() => available && !hasCheckedIn && setSelectedKit(kit.id)}
                  disabled={!available || hasCheckedIn}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-[2rem] border-2 transition-all duration-300 ${
                    isSelected && !hasCheckedIn
                      ? 'border-green-500 bg-darkCard shadow-lg shadow-green-500/20 scale-105' 
                      : 'border-gray-800 bg-darkCard/50'
                  } ${!available ? 'opacity-50' : ''}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center shadow-inner border border-gray-700 overflow-hidden p-2">
                    {kitImage ? (
                      <img src={kitImage} alt={kit.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-3xl">{kit.icon}</div>
                    )}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-tight ${isSelected && !hasCheckedIn ? 'text-white' : 'text-gray-500'}`}>
                    {kit.name}
                  </p>
                  {reward > 0 && (
                    <p className="text-[8px] text-green-500 font-bold">+{reward} FTC</p>
                  )}
                  {!available && (
                    <p className="text-[6px] text-gray-500 text-center">{kit.matchRequired}</p>
                  )}
                  {isSelected && !hasCheckedIn && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white border-2 border-gray-800">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Preview */}
        <div className="flex justify-center py-4">
          <div className="relative w-48 h-64">
            <div className="absolute inset-0 bg-green-600/10 blur-2xl rounded-full scale-110"></div>
            <Card className={`h-full border border-gray-800 shadow-2xl flex flex-col items-center justify-center p-6 bg-darkCard rounded-[3rem] relative z-10`}>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-10">
                <img src={club.badge} className="w-24 h-24 grayscale" alt="club-watermark" />
              </div>
              <div className="w-32 h-32 mb-4 flex items-center justify-center">
                {jerseyImages[selectedKit] ? (
                  <img 
                    src={jerseyImages[selectedKit]} 
                    alt={selectedKitData?.name} 
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="text-7xl">{selectedKitData?.icon}</div>
                )}
              </div>
              <p className="text-sm font-black text-white">{club.name}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">2024/25 Season</p>
              {rewardAmount > 0 && !hasCheckedIn && (
                <p className="text-[10px] text-green-500 font-bold mt-2">+{rewardAmount} FTC</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-6 bg-darkCard border-t border-gray-800">
        {!hasCheckedIn ? (
          <Button 
            onClick={handleCheckInSubmit} 
            className="py-5 w-full"
            disabled={!kitAvailable || checkingIn}
          >
            {checkingIn 
              ? 'Checking in...' 
              : kitAvailable 
                ? `Rep ${selectedKitData?.name} & Earn +${rewardAmount} FTC`
                : 'Kit Not Available Today'}
          </Button>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <Card className="bg-green-950/20 border border-green-500/30 p-5 flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-green-500 leading-none">Checked In Successfully!</p>
                <p className="text-[10px] font-bold text-green-400 uppercase mt-1 tracking-widest">
                  +{rewardAmount} FTC Reward Claimed
                </p>
              </div>
            </Card>
            <Button variant="secondary" onClick={onBack} className="py-4 w-full">
              Return to Arena
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JerseyDayScreen;
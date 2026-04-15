import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import FanRankBadge from '../components/FanRankBadge';
import { UserProfile, WalletState, OnboardingState, Club, Transaction } from '../types';
import { CLUBS } from '../constants';
import MarketplaceScreen from './MarketplaceScreen';
import ClubProfileScreen from './ClubProfileScreen';
import ChatRoomScreen from './ChatRoomScreen';
import BanterHallScreen from './BanterHallScreen';
import JerseyDayScreen from './JerseyDayScreen';
import TriviaScreen from './TriviaScreen';
import VotingScreen from './VotingScreen';
import ChatLobbyScreen from './ChatLobbyScreen';
import FanPodScreen from './FanPodScreen';
import HopeCampaignScreen from './HopeCampaignScreen';

// ===== API FUNCTIONS =====
const API_BASE = 'https://footnfts.up.railway.app/api';

const api = {
  leaderboard: {
    getTop: async () => {
      const res = await fetch(`${API_BASE}/leaderboard`);
      return res.json();
    }
  },
  user: {
    getProfile: async (telegramId: number) => {
      const res = await fetch(`${API_BASE}/user/profile?telegramId=${telegramId}`);
      return res.json();
    },
    updateDisplayName: async (userId: string, newName: string) => {
      const res = await fetch(`${API_BASE}/user/displayname`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, displayName: newName })
      });
      return res.json();
    }
  },
  highlights: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/highlights`);
      return res.json();
    }
  },
  trivia: {
    getQuestion: async () => {
      const res = await fetch(`${API_BASE}/trivia/question`);
      return res.json();
    }
  },
  banter: {
    getFeed: async () => {
      const res = await fetch(`${API_BASE}/banter/feed`);
      return res.json();
    }
  }
};

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'banter' | 'earnings' | 'referral' | 'welcome';
  time: string;
  read: boolean;
  actionData?: any;
}

interface DashboardScreenProps {
  profile: UserProfile | null;
  wallet: WalletState | null;
  onboarding: OnboardingState;
  backendUserId?: string | null;
  onChangeClub: () => void;
  onUpdateProfile: (newName?: string) => void;
  onUpdateWallet?: (update: Partial<WalletState>) => void;
  onTriviaComplete?: () => void;
  onRecordActivity: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  wallet,
  onboarding,
  backendUserId,
  onChangeClub,
  onUpdateProfile,
  onUpdateWallet,
  onTriviaComplete,
  onRecordActivity
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [inChat, setInChat] = useState(false);
  const [selectedChatClub, setSelectedChatClub] = useState<Club | null>(null);
  const [inBanterHall, setInBanterHall] = useState(false);
  const [inJerseyDay, setInJerseyDay] = useState(false);
  const [inTrivia, setInTrivia] = useState(false);
  const [inFanPod, setInFanPod] = useState(false);
  const [inHopeCampaign, setInHopeCampaign] = useState(false);

  const [navigationHistory, setNavigationHistory] = useState<string[]>(['home']);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.displayName || '');
  
  // Data states
  const [userFTCBalance, setUserFTCBalance] = useState<number>(wallet?.balanceFTC || 0);
  const [userRank, setUserRank] = useState<number>(12500);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  
  // Notification System
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showBanterAlert, setShowBanterAlert] = useState<NotificationItem | null>(null);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tg = (window as any).Telegram?.WebApp;
  const club = CLUBS.find(c => c.id === profile?.favoriteClubId);

  const features = [
    { id: 'banter', name: 'Banter Hall', icon: '🔥', description: 'Global fan showdown', comingSoon: false, locked: false },
    { id: 'jersey', name: 'Jersey Day', icon: '👕', description: 'Rep your colors daily', comingSoon: false, locked: false },
    { id: 'trivia', name: 'Trivia IQ', icon: '⚽', description: 'Test your knowledge', comingSoon: false, locked: false },
    { id: 'fanpod', name: 'Fan Pod', icon: '📹', description: 'Share your fan story', comingSoon: true, locked: true },
    { id: 'hope', name: 'Hope Campaign', icon: '🕊️', description: 'Football for a cause', comingSoon: true, locked: true },
  ];

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!backendUserId) return;
      try {
        const res = await api.leaderboard.getTop();
        if (res.success) {
          setLeaderboardData(res.leaderboard || []);
          const userIndex = res.leaderboard?.findIndex((u: any) => u.id === backendUserId);
          if (userIndex !== undefined && userIndex !== -1) {
            setUserRank(userIndex + 1);
          }
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      }
    };
    loadLeaderboard();
  }, [backendUserId]);

  // Update balance when wallet changes
  useEffect(() => {
    if (wallet?.balanceFTC !== undefined) {
      setUserFTCBalance(wallet.balanceFTC);
    }
  }, [wallet?.balanceFTC]);

  // Check for welcome bonus
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome_bonus');
    if (!hasSeenWelcome && (wallet?.balanceFTC === 0 || !wallet?.balanceFTC)) {
      setShowWelcomeBonus(true);
    }
  }, [wallet?.balanceFTC]);

  // ===== NOTIFICATION SYSTEM =====
  
  // Add a notification
  const addNotification = (title: string, message: string, type: NotificationItem['type'], actionData?: any) => {
    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      actionData
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show popup for important notifications
    if (type === 'banter' || type === 'referral') {
      tg?.showPopup?.({
        title: title,
        message: message,
        buttons: [{ id: 'ok', type: 'default', text: 'View' }]
      }, () => {
        if (type === 'banter') setInBanterHall(true);
        if (type === 'referral') setActiveTab('profile');
      });
      
      // Also show floating alert
      setShowBanterAlert(newNotification);
      if (alertTimer.current) clearTimeout(alertTimer.current);
      alertTimer.current = setTimeout(() => setShowBanterAlert(null), 5000);
    }
  };

  // Handle banter notification from BanterHall
  const handleBanterNotify = (message: string, mentionedClub: string) => {
    const userClubName = club?.name || '';
    const isRelevant = mentionedClub === 'all' || mentionedClub.toLowerCase() === userClubName.toLowerCase();
    if (!isRelevant) return;
    
    addNotification(
      '🔥 Banter Alert!',
      `Someone mentioned ${mentionedClub === 'all' ? 'your club' : mentionedClub}: "${message.slice(0, 60)}${message.length > 60 ? '…' : ''}"`,
      'banter',
      { message, mentionedClub }
    );
  };

  // Handle earnings notification
  const notifyEarnings = (amount: number, reason: string) => {
    addNotification(
      '🎉 FTC Earned!',
      `You earned ${amount} FTC for ${reason}!`,
      'earnings'
    );
  };

  // Handle referral notification
  const notifyReferral = (referrerName: string) => {
    addNotification(
      '👥 Referral Bonus!',
      `${referrerName} used your referral code! +15 FTC earned.`,
      'referral'
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ===== EARNING FUNCTION =====
  const handleEarnFTC = async (amount: number, reason: string = 'activity') => {
    tg?.HapticFeedback.notificationOccurred('success');
    if (onUpdateWallet && wallet) {
      const newBalance = (wallet.balanceFTC || 0) + amount;
      onUpdateWallet({ balanceFTC: newBalance });
      setUserFTCBalance(newBalance);
      notifyEarnings(amount, reason);
    }
    onRecordActivity();
    
    // Refresh leaderboard
    const res = await api.leaderboard.getTop();
    if (res.success) {
      setLeaderboardData(res.leaderboard || []);
      const userIndex = res.leaderboard?.findIndex((u: any) => u.id === backendUserId);
      if (userIndex !== undefined && userIndex !== -1) {
        setUserRank(userIndex + 1);
      }
    }
  };

  // ===== EDIT PROFILE =====
  const handleSaveProfile = async () => {
    if (editName.trim() && editName !== profile?.displayName) {
      // Update local state
      onUpdateProfile(editName.trim());
      if (profile) profile.displayName = editName.trim();
      
      // Also update backend if possible
      if (backendUserId) {
        try {
          await api.user.updateDisplayName(backendUserId, editName.trim());
        } catch (error) {
          console.error('Failed to update name on backend:', error);
        }
      }
      
      addNotification('✅ Profile Updated', `Your display name is now "${editName.trim()}"`, 'earnings');
    }
    setShowEditProfile(false);
    tg?.HapticFeedback.selectionChanged();
  };

  // ===== NAVIGATION =====
  const navigateTo = (screen: string) => {
    setActiveTab(screen);
    setShowNotifications(false);
    setShowMarketplace(false);
    setNavigationHistory(prev => [...prev, screen]);
    tg?.HapticFeedback.selectionChanged();
  };

  const goBack = () => {
    tg?.HapticFeedback.impactOccurred('light');
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousScreen = newHistory[newHistory.length - 1];
      setActiveTab(previousScreen);
      setNavigationHistory(newHistory);
    }
    setShowNotifications(false);
    setShowMarketplace(false);
    setInChat(false);
    setInBanterHall(false);
    setInJerseyDay(false);
    setInTrivia(false);
    setInFanPod(false);
    setInHopeCampaign(false);
  };

  // Telegram back button handler
  useEffect(() => {
    if (!tg) return;
    const isOverlayVisible = showNotifications || showMarketplace || inChat || inBanterHall || inJerseyDay || inTrivia || inFanPod || inHopeCampaign;
    const isNotHome = navigationHistory.length > 1;
    if (isOverlayVisible || isNotHome) {
      tg.BackButton.show();
      const handleBack = () => {
        tg.HapticFeedback.impactOccurred('light');
        if (isOverlayVisible) {
          setShowNotifications(false);
          setShowMarketplace(false);
          setInChat(false);
          setInBanterHall(false);
          setInJerseyDay(false);
          setInTrivia(false);
          setInFanPod(false);
          setInHopeCampaign(false);
        } else if (navigationHistory.length > 1) {
          const newHistory = [...navigationHistory];
          newHistory.pop();
          const previousScreen = newHistory[newHistory.length - 1];
          setActiveTab(previousScreen);
          setNavigationHistory(newHistory);
        }
      };
      tg.BackButton.onClick(handleBack);
      return () => tg.BackButton.offClick(handleBack);
    } else {
      tg.BackButton.hide();
    }
  }, [showNotifications, showMarketplace, inChat, inBanterHall, inJerseyDay, inTrivia, inFanPod, inHopeCampaign, navigationHistory, tg]);

  useEffect(() => {
    if (!isOverlayVisible && activeTab === 'home' && navigationHistory[navigationHistory.length - 1] !== 'home') {
      setNavigationHistory(['home']);
    }
  }, [activeTab, showNotifications, showMarketplace, inChat, inBanterHall, inJerseyDay, inTrivia, inFanPod, inHopeCampaign]);

  const handleClaimWelcomeBonus = () => {
    handleEarnFTC(50, 'onboarding bonus');
    setShowWelcomeBonus(false);
    localStorage.setItem('has_seen_welcome_bonus', 'true');
  };

  const fanLevel = Math.floor((userFTCBalance || 0) / 10) + 1;
  const badgeTitle = fanLevel > 10 ? 'Ultra Fan' : fanLevel > 5 ? 'Loyal Supporter' : 'New Signing';

  const handleFeatureClick = (feature: typeof features[0]) => {
    if (feature.comingSoon || feature.locked) {
      tg?.HapticFeedback.impactOccurred('light');
      tg?.showAlert(`${feature.name} is coming soon!`);
      return;
    }
    tg?.HapticFeedback.impactOccurred('medium');
    if (feature.id === 'banter') setInBanterHall(true);
    if (feature.id === 'jersey') setInJerseyDay(true);
    if (feature.id === 'trivia') setInTrivia(true);
  };

  const isOverlayVisible = showNotifications || showMarketplace || inChat || inBanterHall || inJerseyDay || inTrivia || inFanPod || inHopeCampaign;

  // ===== RENDER NOTIFICATIONS PANEL =====
  const renderNotificationsPanel = () => (
    <div className="flex flex-col gap-4 pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Notifications</p>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="text-[10px] text-green-500 font-black uppercase tracking-widest">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <span className="text-4xl opacity-30">🔔</span>
          <p className="text-sm font-black text-gray-500">No notifications yet</p>
          <p className="text-[10px] text-gray-600 max-w-[180px]">When you earn FTC or get mentioned, you'll see it here.</p>
        </div>
      ) : (
        notifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => {
              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
              if (notif.type === 'banter') {
                setShowNotifications(false);
                setInBanterHall(true);
              }
              if (notif.type === 'referral') {
                setShowNotifications(false);
                setActiveTab('profile');
              }
            }}
            className={`bg-darkCard rounded-2xl p-4 flex items-start gap-3 border cursor-pointer active:scale-[0.98] transition-all ${
              notif.read ? 'border-gray-800' : 'border-green-500/40 shadow-[0_0_12px_rgba(22,163,74,0.1)]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center text-xl shrink-0">
              {notif.type === 'banter' ? '🔥' : notif.type === 'referral' ? '👥' : '🎉'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[10px] font-black text-white">{notif.title}</p>
                <span className="text-[8px] text-gray-500 font-bold shrink-0">{notif.time}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{notif.message}</p>
              {!notif.read && (
                <span className="inline-block text-[7px] font-black uppercase bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-md mt-1">
                  New
                </span>
              )}
            </div>
            {!notif.read && <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1 animate-pulse" />}
          </div>
        ))
      )}
    </div>
  );

  // ===== RENDER WALLET =====
  const renderWallet = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6 pb-24">
      <Card className="bg-green-600 text-black p-8 relative overflow-hidden flex flex-col items-center text-center shadow-xl border-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80 mb-2">Total Balance</p>
        <h2 className="text-5xl font-black mb-6 tracking-tighter">{userFTCBalance} <span className="text-xl opacity-60">FTC</span></h2>
        <div className="w-full bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 group active:scale-95 transition-transform cursor-pointer" onClick={() => { tg?.HapticFeedback.selectionChanged(); navigator.clipboard.writeText(wallet?.address || ''); }}>
          <div className="flex justify-between items-center mb-1"><span className="text-[8px] font-black uppercase text-white/60">TON Wallet Address</span><span className="text-[8px] font-black uppercase text-black/80 flex items-center gap-1"><span className="w-1 h-1 bg-black rounded-full animate-pulse"></span>Verified</span></div>
          <div className="flex items-center justify-between gap-2"><div className="font-mono text-xs truncate opacity-90">{wallet?.address || 'EQA_...8x92'}</div><svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative group"><Button disabled variant="secondary" className="py-4 text-[10px] font-black uppercase tracking-widest border border-gray-800 opacity-60 grayscale bg-darkCard">Deposit TON</Button><div className="absolute -top-2 left-1/2 -translate-x-1/2"><span className="bg-gray-800 text-gray-500 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-gray-700 shadow-sm">Soon</span></div></div>
        <div className="relative group"><Button disabled variant="secondary" className="py-4 text-[10px] font-black uppercase tracking-widest border border-gray-800 opacity-60 grayscale bg-darkCard">Swap FTC</Button><div className="absolute -top-2 left-1/2 -translate-x-1/2"><span className="bg-gray-800 text-gray-500 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-gray-700 shadow-sm">Soon</span></div></div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1"><p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Leaderboard Top 5</p><button className="text-[10px] text-green-500 font-black uppercase tracking-widest" onClick={() => tg?.HapticFeedback.selectionChanged()}>View All</button></div>
        <div className="flex flex-col gap-3">
          {leaderboardData.slice(0, 5).map((user, idx) => (
            <div key={user.id} className="bg-darkCard rounded-2xl p-4 flex items-center justify-between border border-gray-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg font-black text-white">#{idx + 1}</div>
                <div><p className="text-sm font-black text-white leading-tight">{user.username || `Fan_${user.telegram_id}`}</p><p className="text-[9px] text-gray-400 font-bold uppercase">{user.ftc_balance} FTC</p></div>
              </div>
              {user.id === backendUserId && <span className="text-[8px] bg-green-600 text-black px-2 py-1 rounded-full font-black">YOU</span>}
            </div>
          ))}
          {leaderboardData.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No users yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );

  // ===== RENDER HOME =====
  const renderHome = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-600 text-black border-none p-5 relative overflow-hidden shadow-lg active:scale-95 transition-transform cursor-pointer" onClick={() => { tg?.HapticFeedback.selectionChanged(); navigateTo('wallet'); }}>
          <p className="text-[10px] uppercase opacity-80 font-black tracking-widest mb-1">FTC Balance</p>
          <p className="text-3xl font-black">{userFTCBalance} <span className="text-xs font-bold opacity-60">FTC</span></p>
        </Card>
        <Card className="p-5 border-gray-800 shadow-sm bg-darkCard">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Global Rank</p>
          <p className="text-3xl font-black text-white">#{userRank.toLocaleString()}</p>
        </Card>
      </div>
      <Card className="bg-darkDeep text-white border border-gray-800 p-6 flex items-center justify-between relative overflow-hidden shadow-2xl transition-all">
        <div className="absolute top-0 right-0 p-2 z-20"><span className="inline-block bg-orange-600 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">COMING SOON</span></div>
        <div className="relative z-10 flex-1"><h3 className="text-lg font-black mb-1 leading-tight tracking-tight">Physical × Digital<br />Jersey Pairing</h3><p className="text-[10px] text-gray-400 font-medium max-w-[140px] leading-relaxed">Wear it in real life. Own it on the blockchain.</p></div>
        <div className="relative z-10 flex items-center gap-2"><div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10">👕</div></div>
      </Card>
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Current Affiliation</p>
        <Card className="flex items-center gap-4 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer bg-darkCard border-gray-800" onClick={() => { tg?.HapticFeedback.selectionChanged(); navigateTo('club'); }}>
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center p-2">
            {club?.badge ? <img src={club.badge} className="w-full h-full object-contain" alt="Club" /> : <div className="w-full h-full rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl">{profile?.favoriteClubName?.charAt(0) || profile?.favoriteClubId?.charAt(0) || 'FC'}</div>}
          </div>
          <div className="flex-1"><p className="text-xl font-black text-white leading-tight">{club?.name || profile?.favoriteClubName || profile?.favoriteClubId}</p><div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] bg-orange-950 text-orange-400 font-black px-2 py-0.5 rounded-md uppercase">Lvl {fanLevel}</span><FanRankBadge rank={profile?.fanRank} /></div></div>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </Card>
      </div>
      <div className="flex flex-col gap-4 pb-10">
        <h2 className="text-lg font-black text-white tracking-tight">Fan Arena</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map(f => (
            <div key={f.id} onClick={() => handleFeatureClick(f)} className={`bg-darkCard rounded-[2.5rem] p-5 border border-gray-800 shadow-sm flex flex-col items-center gap-2 active:scale-[0.98] transition-all cursor-pointer text-center group ${f.comingSoon ? 'opacity-80' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl mb-1 transition-transform ${f.comingSoon ? 'grayscale' : 'group-hover:scale-110'}`}>{f.icon}</div>
              <p className="font-black text-white text-sm tracking-tight">{f.name}</p>
              <p className="text-[9px] text-gray-400 font-medium leading-none mt-0.5 line-clamp-1">{f.description}</p>
              <div className="mt-auto w-full pt-2">
                {f.comingSoon ? <div className="bg-gray-800 text-gray-500 rounded-xl py-2 px-3 flex items-center justify-center border border-gray-700"><span className="text-[8px] font-black uppercase tracking-widest">Coming Soon</span></div> : <div className="bg-green-600 text-black rounded-xl py-2 px-3 flex items-center justify-center shadow-md font-black"><span className="text-[8px] font-black uppercase tracking-widest">Access Now</span></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Screen routing
  if (inTrivia && club) return <TriviaScreen club={club} onboarding={onboarding} onBack={() => setInTrivia(false)} onEarn={handleEarnFTC} onComplete={onTriviaComplete} />;
  if (inJerseyDay && club) return <JerseyDayScreen club={club} profile={profile} onBack={() => setInJerseyDay(false)} onCheckIn={handleEarnFTC} />;
  if (inBanterHall) return <BanterHallScreen profile={profile} onBack={() => setInBanterHall(false)} onEarn={handleEarnFTC} onBanterNotify={handleBanterNotify} />;
  if (inFanPod) return <FanPodScreen profile={profile} onBack={() => setInFanPod(false)} onEarn={handleEarnFTC} />;
  if (inHopeCampaign) return <HopeCampaignScreen onBack={() => setInHopeCampaign(false)} onEarn={handleEarnFTC} />;
  if (inChat && selectedChatClub) return <ChatRoomScreen club={selectedChatClub} profile={profile} onBack={() => setInChat(false)} onRecordActivity={onRecordActivity} />;

  return (
    <div className="h-screen flex flex-col overflow-hidden transition-colors duration-300 bg-transparent">
      {/* Floating Alert */}
      {showBanterAlert && (
        <div className="fixed top-4 left-4 right-4 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-darkCard border border-green-500/40 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-xl">{showBanterAlert.type === 'banter' ? '🔥' : '🎉'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-0.5">{showBanterAlert.title}</p>
              <p className="text-xs text-white font-bold leading-snug line-clamp-2">{showBanterAlert.message}</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setShowBanterAlert(null);
                  if (showBanterAlert.type === 'banter') setInBanterHall(true);
                  if (showBanterAlert.type === 'referral') setActiveTab('profile');
                }}
                className="bg-green-600 text-black text-[8px] font-black uppercase px-2.5 py-1.5 rounded-lg tracking-widest"
              >
                View
              </button>
              <button onClick={() => setShowBanterAlert(null)} className="text-gray-500 text-[8px] font-black uppercase px-2.5 py-1.5 rounded-lg tracking-widest">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Bonus Popup */}
      {showWelcomeBonus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-darkCard rounded-2xl p-6 max-w-sm w-full border border-green-500/30 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Welcome to the Pitch! 🎉</h2>
              <p className="text-gray-400 text-sm mb-4">You've joined the Founding Council</p>
              <div className="bg-darkDeep rounded-xl p-4 mb-6 border border-green-500/30">
                <div className="flex items-center justify-center gap-3"><span className="text-2xl">🎁</span><span className="text-xl font-black text-green-500">+50 FTC</span></div>
                <p className="text-xs text-gray-500 mt-1">Onboarding Bonus</p>
              </div>
              <button onClick={handleClaimWelcomeBonus} className="w-full bg-green-600 text-black py-3 rounded-xl font-black hover:bg-green-500 transition-all active:scale-95">Claim Bonus</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-darkCard rounded-2xl p-6 max-w-sm w-full border border-green-500/30 animate-in zoom-in duration-300">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-600/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-white">Edit Profile</h2>
              <p className="text-xs text-gray-400">Update your display name</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Display Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-3 rounded-xl bg-darkDeep border border-gray-800 text-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="Enter your name" autoFocus />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-black hover:bg-gray-700 transition-all">Cancel</button>
              <button onClick={handleSaveProfile} className="flex-1 bg-green-600 text-black py-3 rounded-xl font-black hover:bg-green-500 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-darkCard/80 backdrop-blur-md shadow-sm flex items-center justify-between border-b border-gray-800 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative cursor-pointer active:scale-95 transition-transform shrink-0" onClick={() => { tg?.HapticFeedback.selectionChanged(); navigateTo('profile'); }}>
            <img src={profile?.avatar} className="w-10 h-10 rounded-2xl shadow-md border-2 border-gray-700 object-cover" alt="Profile" />
            <div className="absolute -bottom-1 -right-1"><div className="w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-700"><span className="text-[6px]">{features[Math.floor(onboarding.activityCount % features.length)].icon}</span></div></div>
          </div>
          {(!showNotifications && !showMarketplace) && (
            <div className="animate-in fade-in duration-300 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap"><p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">Fan Status</p><FanRankBadge rank={profile?.fanRank} /></div>
              <p className="font-bold text-white leading-tight truncate max-w-[150px]">{profile?.displayName}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => { tg?.HapticFeedback.selectionChanged(); setShowNotifications(!showNotifications); setShowMarketplace(false); if (!showNotifications) markAllNotificationsRead(); }} className={`w-9 h-9 flex items-center justify-center rounded-xl relative active:scale-95 transition-all ${showNotifications ? 'bg-green-600 text-black' : 'bg-gray-800/50 text-gray-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unreadCount > 0 && !showNotifications && (<span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] font-black text-black px-1 animate-bounce">{unreadCount > 9 ? '9+' : unreadCount}</span>)}
          </button>
          <button onClick={() => { tg?.HapticFeedback.selectionChanged(); setShowMarketplace(!showMarketplace); setShowNotifications(false); }} className={`w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition-all ${showMarketplace ? 'bg-green-600 text-black' : 'bg-gray-800/50 text-gray-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M4 7h16M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 11v4m6-4v4" /></svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar bg-transparent">
        {showMarketplace ? <MarketplaceScreen onNotify={() => { tg?.HapticFeedback.notificationOccurred('success'); alert("Interest recorded!"); }} onBack={() => setShowMarketplace(false)} /> : showNotifications ? renderNotificationsPanel() : (
          <>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'profile' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
                <Card className="flex flex-col items-center text-center pt-8 pb-8 relative overflow-hidden bg-darkCard border-gray-800">
                  <div className="absolute top-0 inset-x-0 h-1 bg-green-600 opacity-50"></div>
                  <img src={profile?.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-gray-800 shadow-xl mb-4 object-cover" />
                  <h2 className="text-2xl font-black text-white leading-tight break-words max-w-full px-2">{profile?.displayName}</h2>
                  <div className="mt-1 flex items-center justify-center gap-2"><FanRankBadge rank={profile?.fanRank} size="sm" /><p className="text-green-500 font-bold uppercase text-[10px] tracking-widest">{badgeTitle}</p></div>
                  <div className="flex gap-2 mt-8 w-full"><Button variant="outline" className="flex-1 py-3 text-xs" onClick={() => setShowEditProfile(true)}>Edit Profile</Button><Button variant="outline" className="flex-1 py-3 text-xs" onClick={() => tg?.HapticFeedback.selectionChanged()}>Share Card</Button></div>
                </Card>
                <div className="flex flex-col gap-3"><p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] px-1">Referral Program</p><Card className="bg-darkCard border border-gray-800 p-5"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg></div><div><p className="text-sm font-black text-white">Invite Friends</p><p className="text-[9px] text-gray-500">Earn 5 FTC per referral</p></div></div><div className="text-right"><p className="text-2xl font-black text-green-500">{onboarding.referralCount}</p><p className="text-[8px] text-gray-500 uppercase tracking-wider">Referrals</p></div></div><div className="bg-darkDeep rounded-xl p-3 mb-4 border border-gray-800"><div className="flex items-center justify-between gap-2"><code className="text-xs font-mono text-green-500 truncate">{onboarding.referralCode}</code><button onClick={() => { navigator.clipboard.writeText(onboarding.referralCode); tg?.HapticFeedback.selectionChanged(); tg?.showAlert('Referral code copied!'); }} className="text-[10px] font-black text-green-500 hover:text-green-400 transition-colors">Copy</button></div></div><div className="bg-darkDeep rounded-xl p-3 mb-4 border border-gray-800"><div className="flex items-center justify-between gap-2"><code className="text-[10px] font-mono text-gray-400 truncate">t.me/footnfts_app?ref={onboarding.referralCode}</code><button onClick={() => { const link = `https://t.me/footnfts_app?ref=${onboarding.referralCode}`; navigator.clipboard.writeText(link); tg?.HapticFeedback.selectionChanged(); tg?.showAlert('Referral link copied!'); }} className="text-[10px] font-black text-green-500 hover:text-green-400 transition-colors">Copy Link</button></div></div><div className="grid grid-cols-2 gap-3"><button onClick={() => { const text = `Join me on FOOT NFTs! Use my referral code: ${onboarding.referralCode}`; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://t.me/footnfts_app?ref=' + onboarding.referralCode)}`, '_blank'); }} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-wider hover:bg-blue-500/20 transition-all"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.6-1.38-.97-2.23-1.56-.99-.69-.35-1.07.22-1.69.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.07-.06-.18-.04-.26-.02-.11.02-1.87 1.19-5.28 3.49-.5.34-.95.51-1.36.5-.45-.01-1.31-.25-1.95-.46-.78-.25-1.4-.38-1.35-.81.03-.22.33-.45.9-.68 3.56-1.55 5.93-2.57 7.12-3.06 3.39-1.39 4.09-1.63 4.55-1.64.1 0 .33.02.48.15.12.1.16.25.17.37-.01.09-.02.24-.05.39z"/></svg>X (Twitter)</button><button onClick={() => { const text = `Join me on FOOT NFTs! Use my referral code: ${onboarding.referralCode}`; window.open(`https://wa.me/?text=${encodeURIComponent(text + ' https://t.me/footnfts_app?ref=' + onboarding.referralCode)}`, '_blank'); }} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-wider hover:bg-green-500/20 transition-all"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>WhatsApp</button></div><div className="mt-4 pt-3 border-t border-gray-800"><div className="flex justify-between text-[9px] text-gray-500 mb-1"><span>Next reward at 5 referrals</span><span>{onboarding.referralCount}/5</span></div><div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((onboarding.referralCount / 5) * 100, 100)}%` }}></div></div>{onboarding.referralCount >= 5 && <p className="text-[8px] text-green-500 mt-2 text-center font-bold">🎉 Bonus unlocked! +25 FTC</p>}</div></Card></div>
                <div className="flex flex-col gap-3"><p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] px-1">Social Stats</p><div className="grid grid-cols-2 gap-4"><Card className="p-4 bg-darkCard border-gray-800"><p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Influence</p><p className="text-xl font-black text-white">{(onboarding.activityCount * 12).toLocaleString()}</p></Card><Card className="p-4 bg-darkCard border-gray-800"><p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Rank</p><p className="text-xl font-black text-white">#{(12500 - onboarding.activityCount).toLocaleString()}</p></Card></div></div>
              </div>
            )}
            {activeTab === 'club' && (club ? <ClubProfileScreen club={club} profile={profile} onSwitch={onChangeClub} onEnterChat={() => { setSelectedChatClub(club); setInChat(true); }} /> : <div className="p-10 text-center"><Button onClick={onChangeClub}>Join a Club</Button></div>)}
            {activeTab === 'chat' && <ChatLobbyScreen onJoinChat={(selected) => { setSelectedChatClub(selected); setInChat(true); }} onEnterGlobalHall={() => { setInBanterHall(true); }} />}
            {activeTab === 'voting' && <VotingScreen club={club!} onEarn={handleEarnFTC} />}
            {activeTab === 'wallet' && renderWallet()}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-darkCard/80 backdrop-blur-xl border-t border-gray-800 px-4 py-3 flex justify-between items-center z-40 shrink-0 pb-8">
        {[
          { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'club', label: 'Club', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { id: 'voting', label: 'Voting', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
          { id: 'chat', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
          { id: 'wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
        ].map(tab => (<button key={tab.id} onClick={() => navigateTo(tab.id)} className={`flex flex-col items-center gap-1 transition-all relative px-2 ${activeTab === tab.id ? 'text-green-500' : 'text-gray-600'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg><span className={`text-[7px] font-black uppercase tracking-widest transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span></button>))}
      </div>
    </div>
  );
};

export default DashboardScreen;
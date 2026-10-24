import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveClubBadge } from '../src/utils/clubBadge';
import { getAuthToken, setAuthSession } from '../src/utils/versionControl';

const API_BASE = 'https://footnfts.up.railway.app/api';
type MatchFilter = 'upcoming' | 'live' | 'past';
type Section = 'matches' | 'picks' | 'rewards';
type Screen = 'matches' | 'pick' | 'scratch' | 'result';
type Pick = 'home' | 'draw' | 'away';
type RewardType = 'ftc' | 'jersey' | 'sports_gear';

interface Team {
  id?: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

interface Match {
  id: string;
  utcDate: string;
  status: string;
  competition?: { name?: string; emblem?: string } | null;
  homeTeam: Team;
  awayTeam: Team;
  score?: { fullTime?: { home: number | null; away: number | null } } | null;
}

interface Prediction {
  id: string;
  matchId: string;
  kickoffAt: string;
  match: Match;
  pick: Pick;
  result: Pick | null;
  status: 'pending' | 'correct' | 'incorrect' | 'expired';
  rewardType: RewardType | null;
  rewardName: string | null;
  rewardAmount: number | null;
  rewardAvailable: boolean;
  rewardRevealed: boolean;
  rewardClaimed: boolean;
  rewardDeliveryStatus: string;
  rewardAwardedAt: string | null;
  createdAt: string;
}

interface TelegramWindow extends Window {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
}

const matchFilterFor = (status: string): MatchFilter => {
  const normalized = status.toUpperCase();
  if (['IN_PLAY', 'PAUSED', 'HALF_TIME', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(normalized)) return 'live';
  if (['FINISHED', 'POST', 'CANCELLED', 'POSTPONED', 'AWARDED', 'SUSPENDED'].includes(normalized)) return 'past';
  return 'upcoming';
};

const matchDate = (date: string) => new Date(date).toLocaleString([], {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});

const addDays = (date: Date, days: number) => {
  const target = new Date(date);
  target.setUTCDate(target.getUTCDate() + days);
  return target.toISOString().slice(0, 10);
};

const loadCalendarMatches = async (): Promise<Match[]> => {
  const today = new Date();
  const params = new URLSearchParams({
    dateFrom: addDays(today, -2),
    dateTo: addDays(today, 7),
    limit: '90',
  });
  const response = await fetch(`${API_BASE}/fanzone/calendar?${params.toString()}`);
  const data = await response.json();
  if (!response.ok || data?.success === false) {
    throw new Error(data?.error || 'Football Calendar fixtures could not be loaded.');
  }
  return (data.matches || [])
    .filter((match: Match) => match.homeTeam?.name && match.awayTeam?.name)
    .map((match: Match) => ({ ...match, id: String(match.id) }));
};

const pickName = (pick: Pick, match: Match) => ({
  home: match.homeTeam.shortName || match.homeTeam.name,
  draw: 'Draw',
  away: match.awayTeam.shortName || match.awayTeam.name,
}[pick]);

const predictionRequest = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const send = (token: string | null) => {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}/predictions${path}`, { ...init, headers });
  };

  let response = await send(getAuthToken() || localStorage.getItem('token'));
  if (response.status === 401) {
    const initData = (window as TelegramWindow).Telegram?.WebApp?.initData;
    if (initData) {
      const sessionResponse = await fetch(`${API_BASE}/auth/telegram/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });
      const session = await sessionResponse.json();
      if (sessionResponse.ok && session.success && session.token && session.user?.id) {
        setAuthSession(session.token, session.user.id);
        response = await send(session.token);
      }
    }
  }

  const data = await response.json();
  if (!response.ok || data?.success === false) {
    if (response.status === 401) throw new Error('Your session expired. Reopen the Mini App and try again.');
    throw new Error(data?.error || 'Predictions could not be loaded. Please try again.');
  }
  return data as T;
};

const COIN_GRADIENT_ID = 'predictions-coin-gold';

const CoinIcon: React.FC<{ size?: 'large' | 'medium' | 'small' }> = ({ size = 'large' }) => (
  <svg className={`pred-coin pred-coin-${size}`} viewBox="0 0 120 120" role="img" aria-label="FTC reward coin">
    <defs>
      <linearGradient id={COIN_GRADIENT_ID} x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#fff2a5" />
        <stop offset="38%" stopColor="#f0c64e" />
        <stop offset="72%" stopColor="#d9981d" />
        <stop offset="100%" stopColor="#87540b" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="rgba(232,184,48,.2)" />
    <circle cx="60" cy="60" r="48" fill="#70470c" stroke="#f3d26d" strokeWidth="5" />
    <circle cx="60" cy="60" r="39" fill={`url(#${COIN_GRADIENT_ID})`} stroke="#fff0a0" strokeWidth="2" />
    <circle cx="60" cy="60" r="33" fill="none" stroke="#93600f" strokeOpacity=".7" strokeWidth="1.5" />
    <text x="60" y="67" textAnchor="middle" fill="#80510d" fontSize="19" fontWeight="900" fontFamily="Arial, sans-serif">FTC</text>
    <text x="60" y="99" textAnchor="middle" fill="#70470c" fontSize="7" fontWeight="800" letterSpacing="1.5" fontFamily="Arial, sans-serif">FOOT-COLLECT</text>
  </svg>
);

const BallIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="#e8f2ed" stroke="#22e07a" strokeWidth="2" />
    <path d="m16 10 5 3.6-1.9 5.8h-6.2L11 13.6 16 10Zm0 0V2m5 11.6 7-2.3m-8.9 8.1 4.3 6.7m-12.8-6.7-4.3 6.7M11 13.6l-7-2.3" stroke="#174238" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const TeamCrest: React.FC<{ team: Team; tone?: 'home' | 'away'; size?: 'normal' | 'large' }> = ({
  team,
  tone = 'home',
  size = 'normal',
}) => {
  const badge = resolveClubBadge(team);
  const [failedBadge, setFailedBadge] = useState<string | null>(null);
  const initials = (team.shortName || team.name)
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  return (
    <span className={`pred-crest pred-crest-${size} pred-crest-${tone}`} role="img" aria-label={`${team.name} crest`}>
      {badge && failedBadge !== badge
        ? <img src={badge} alt="" loading="lazy" onError={() => setFailedBadge(badge)} />
        : <span aria-hidden="true">{initials}</span>}
    </span>
  );
};

const RewardArtwork: React.FC<{ type: RewardType; className?: string }> = ({ type, className = '' }) => {
  if (type === 'ftc') return <CoinIcon size="medium" />;
  if (type === 'jersey') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" role="img" aria-label="Football jersey">
        <path d="m31 18 13-7h12l13 7 19 13-12 17-10-7v47H24V41l-10 7L2 31l19-13 10 0Z" fill="#12a65e" stroke="#7dffb2" strokeWidth="3" strokeLinejoin="round" />
        <path d="m39 14 11 12 11-12M37 47h26M37 56h26" stroke="#d9ffe7" strokeWidth="4" strokeLinecap="round" />
        <text x="50" y="76" textAnchor="middle" fill="white" fontSize="16" fontWeight="900">FTC</text>
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" role="img" aria-label="Football sports gear">
      <circle cx="50" cy="50" r="37" fill="#e9f3ed" stroke="#22e07a" strokeWidth="5" />
      <path d="m50 36 12 9-5 14H43l-5-14 12-9Zm0 0V13m12 32 23-8M57 59l14 22M43 59 29 81M38 45l-23-8" stroke="#174238" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
};

const PredictionsScreen: React.FC<{
  userId?: string | null;
  onBack: () => void;
  onRewardClaimed?: (amount: number, balance: number) => void;
}> = ({ userId, onBack, onRewardClaimed }) => {
  const [filter, setFilter] = useState<MatchFilter>('upcoming');
  const [section, setSection] = useState<Section>('matches');
  const [screen, setScreen] = useState<Screen>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [rewardWeights, setRewardWeights] = useState<Record<string, number>>({});
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [rewardFilter, setRewardFilter] = useState<'All' | RewardType>('All');
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    streetAddress: '',
    cityRegion: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [fixtureResult, rulesResult, predictionResult] = await Promise.allSettled([
      loadCalendarMatches(),
      predictionRequest<{ weights: Record<string, number> }>('/reward-rules'),
      userId
        ? predictionRequest<{ predictions: Prediction[] }>(`/mine/${encodeURIComponent(userId)}`)
        : Promise.resolve({ predictions: [] as Prediction[] }),
    ]);

    if (fixtureResult.status === 'fulfilled') setMatches(fixtureResult.value);
    else setError(fixtureResult.reason instanceof Error ? fixtureResult.reason.message : 'Fixtures could not be loaded.');
    if (rulesResult.status === 'fulfilled') setRewardWeights(rulesResult.value.weights);
    else setError(current => current || (rulesResult.reason instanceof Error ? rulesResult.reason.message : 'Reward rules could not be loaded.'));
    if (predictionResult.status === 'fulfilled') setPredictions(predictionResult.value.predictions);
    else setError(current => current || (predictionResult.reason instanceof Error ? predictionResult.reason.message : 'Your predictions could not be loaded.'));
    if (!userId) setError(current => current || 'Sign in to submit picks and claim rewards.');
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
    const refreshTimer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(refreshTimer);
  }, [load]);

  const visibleMatches = useMemo(
    () => matches.filter(match => matchFilterFor(match.status) === filter),
    [matches, filter],
  );

  const openPrediction = (match: Match) => {
    setSelectedMatch(match);
    setSelectedPick(null);
    setScreen('pick');
  };

  const submitPick = async () => {
    if (!userId || !selectedMatch || !selectedPick) return;
    setBusy(true);
    setError('');
    try {
      await predictionRequest('/submit', {
        method: 'POST',
        body: JSON.stringify({ userId, matchId: selectedMatch.id, pick: selectedPick }),
      });
      setSelectedMatch(null);
      setSelectedPick(null);
      setScreen('matches');
      setSection('picks');
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Your prediction could not be submitted.');
    } finally {
      setBusy(false);
    }
  };

  const openReward = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setRevealed(prediction.rewardRevealed);
    setShowDeliveryForm(false);
    setScreen('scratch');
  };

  const revealReward = async () => {
    if (!userId || !selectedPrediction || busy) return;
    setBusy(true);
    setError('');
    try {
      const data = await predictionRequest<{
        rewardAmount: number | null;
        rewardType: RewardType;
        rewardName: string;
      }>(`/${selectedPrediction.id}/reveal`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      const updated = {
        ...selectedPrediction,
        rewardAmount: data.rewardAmount,
        rewardType: data.rewardType,
        rewardName: data.rewardName,
        rewardRevealed: true,
      };
      setSelectedPrediction(updated);
      setPredictions(current => current.map(item => item.id === updated.id ? updated : item));
      setRevealed(true);
    } catch (revealError) {
      setError(revealError instanceof Error ? revealError.message : 'Your reward is not available to reveal yet.');
    } finally {
      setBusy(false);
    }
  };

  const claimReward = async () => {
    if (!userId || !selectedPrediction || busy) return;
    if (selectedPrediction.rewardType !== 'ftc') {
      setShowDeliveryForm(true);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await predictionRequest<{
        amount: number | null;
        balance: number | null;
        rewardType: RewardType;
        rewardName: string;
        deliveryStatus: string;
        alreadyClaimed: boolean;
      }>(`/${selectedPrediction.id}/claim`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      const updated = {
        ...selectedPrediction,
        rewardClaimed: true,
        rewardDeliveryStatus: data.deliveryStatus,
      };
      setSelectedPrediction(updated);
      setPredictions(current => current.map(item => item.id === updated.id ? updated : item));
      if (data.rewardType === 'ftc' && data.amount != null && data.balance != null) {
        onRewardClaimed?.(data.amount, data.balance);
      }
      setScreen('result');
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : 'Your reward could not be claimed.');
    } finally {
      setBusy(false);
    }
  };

  const submitDeliveryDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !selectedPrediction || busy) return;
    setBusy(true);
    setError('');
    try {
      const data = await predictionRequest<{
        rewardType: RewardType;
        rewardName: string;
        deliveryStatus: string;
      }>(`/${selectedPrediction.id}/delivery`, {
        method: 'POST',
        body: JSON.stringify({ userId, ...deliveryDetails }),
      });
      const updated = {
        ...selectedPrediction,
        rewardClaimed: true,
        rewardDeliveryStatus: data.deliveryStatus,
      };
      setSelectedPrediction(updated);
      setPredictions(current => current.map(item => item.id === updated.id ? updated : item));
      setDeliveryDetails({
        fullName: '',
        phone: '',
        email: '',
        streetAddress: '',
        cityRegion: '',
        country: '',
      });
      setShowDeliveryForm(false);
      setScreen('result');
    } catch (deliveryError) {
      setError(deliveryError instanceof Error ? deliveryError.message : 'Delivery details could not be submitted.');
    } finally {
      setBusy(false);
    }
  };

  const predictionForMatch = (matchId: string) => predictions.find(item => item.matchId === matchId);
  const rewardHistory = predictions.filter(item => item.status === 'correct');

  return (
    <div className="-mx-6 -my-6 min-h-full bg-[#06141a] text-[#f2f7f4]">
      <style>{`
        .predictions-page {
          --pred-bg: #0b0f15;
          --pred-panel: #0b1219;
          --pred-card: #0f172a;
          --pred-line: #263342;
          --pred-green: #22e07a;
          --pred-green-deep: #0f7a45;
          --pred-muted: #9ca3af;
          --pred-gold: #e8b830;
          min-height: 100%;
          color: #f2f7f4;
          background: radial-gradient(ellipse at 50% -8%, #14231f 0%, #0b0f15 48%, #080c12 100%);
          font-family: Inter, "Segoe UI", system-ui, sans-serif;
        }
        .predictions-page button { font: inherit; }
        .pred-inner { width: min(100%, 820px); margin: 0 auto; padding: 20px clamp(14px, 4vw, 30px) 36px; }
        .pred-page-top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:22px; }
        .pred-back { display:inline-flex; align-items:center; gap:8px; padding:9px 13px; border:1px solid #1d4a3f; border-radius:10px; background:#0b2226; color:#cfe2da; cursor:pointer; font-size:13px!important; font-weight:700!important; }
        .pred-page-caption { color:var(--pred-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.13em; }
        .pred-play-mode { display:flex; align-items:center; gap:7px; border:1px solid rgba(34,224,122,.25); border-radius:999px; background:rgba(34,224,122,.07); color:#a8f2c6; padding:7px 12px; font-size:10px; font-weight:850; letter-spacing:.05em; text-transform:uppercase; white-space:nowrap; }
        .pred-hero { position:relative; overflow:hidden; display:flex; align-items:center; min-height:164px; padding:22px clamp(18px,4vw,30px); border:1px solid rgba(34,224,122,.3); border-radius:18px; background:#10241f; box-shadow:0 16px 46px rgba(0,0,0,.24); }
        .pred-hero:before { content:""; position:absolute; inset:0; z-index:1; background:linear-gradient(90deg,rgba(3,14,12,.88) 0%,rgba(3,14,12,.67) 48%,rgba(3,14,12,.22) 100%),linear-gradient(0deg,rgba(3,14,12,.35),transparent 70%); pointer-events:none; }
        .pred-hero-image { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 76%; }
        .pred-hero-copy { position:relative; z-index:2; }
        .pred-hero-kicker { display:flex; align-items:center; gap:8px; color:#9effc7; font-size:10px; letter-spacing:.15em; font-weight:900; text-transform:uppercase; }
        .pred-hero h1 { margin:9px 0 4px; color:#f4fff9; font-size:clamp(25px,5vw,37px); line-height:1; letter-spacing:.02em; font-weight:950; }
        .pred-hero p { margin:0; color:#bfddd0; font-size:13px; }
        .pred-overline { margin:25px 0 11px; display:flex; justify-content:space-between; align-items:end; gap:12px; }
        .pred-overline h2 { margin:0; font-size:18px; font-weight:850; }
        .pred-overline p { margin:4px 0 0; color:var(--pred-muted); font-size:12px; }
        .pred-section-tabs { display:flex; flex-wrap:wrap; gap:5px; padding:4px; border:1px solid rgba(255,255,255,.07); border-radius:12px; background:rgba(7,30,32,.85); }
        .pred-section-tab { border:0; border-radius:9px; background:transparent; color:#8fa7a0; padding:9px 15px; cursor:pointer; font-size:12px!important; font-weight:800!important; }
        .pred-section-tab.active { background:var(--pred-green); color:#032a14; }
        .pred-filter-tabs { display:flex; gap:8px; margin:15px 0; }
        .pred-filter { min-width:84px; padding:8px 14px; border:1px solid #25473f; border-radius:999px; background:#0b2226; color:#afc4bb; cursor:pointer; font-size:12px!important; font-weight:750!important; }
        .pred-filter.active { border-color:var(--pred-green); background:rgba(15,122,69,.65); color:#d9ffe8; box-shadow:inset 0 0 0 1px rgba(34,224,122,.14); }
        .pred-match-list { display:grid; grid-template-columns:1fr; gap:9px; }
        .pred-match-card { position:relative; overflow:hidden; min-width:0; padding:14px; border:1px solid rgba(148,163,184,.16); border-radius:13px; background:linear-gradient(145deg,rgba(15,23,42,.98),rgba(11,18,25,.98)); box-shadow:0 8px 24px rgba(0,0,0,.13); }
        .pred-match-card:before { content:""; position:absolute; top:0; left:16px; right:16px; height:1px; background:linear-gradient(90deg,transparent,rgba(34,224,122,.4),transparent); }
        .pred-match-meta { display:flex; justify-content:space-between; align-items:center; gap:10px; color:#a9c0b5; font-size:10px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
        .pred-live-dot { width:6px; height:6px; display:inline-block; margin-right:5px; border-radius:50%; background:#ff5261; box-shadow:0 0 8px #ff5261; }
        .pred-teams { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); align-items:center; gap:8px; margin:16px 0 14px; }
        .pred-team { min-width:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; text-align:center; }
        .pred-team.away { text-align:center; }
        .pred-team-name { display:block; max-width:100%; overflow:hidden; color:#f2f7f4; font-size:12px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
        .pred-vs { color:#78968a; font-size:9px; font-weight:900; letter-spacing:.08em; }
        .pred-crest { width:54px; height:54px; padding:7px; flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.15); border-radius:50%; background:rgba(255,255,255,.07); box-shadow:0 5px 15px rgba(0,0,0,.2); }
        .pred-crest-large { width:68px; height:68px; padding:9px; }
        .pred-crest img { display:block; width:100%; height:100%; object-fit:contain; }
        .pred-crest-home { background:radial-gradient(circle at 35% 30%,rgba(34,224,122,.22),rgba(7,24,26,.9)); }
        .pred-crest-away { background:radial-gradient(circle at 35% 30%,rgba(232,184,48,.17),rgba(7,24,26,.9)); }
        .pred-crest > span { color:#d4f1e2; font-size:9px; font-weight:900; }
        .pred-match-footer { display:flex; justify-content:space-between; align-items:center; gap:10px; padding-top:11px; border-top:1px solid rgba(255,255,255,.07); }
        .pred-kickoff { color:#a9c0b5; font-size:11px; }
        .pred-score { color:#f2d36e; font-size:13px; font-weight:900; }
        .pred-button { display:inline-flex; justify-content:center; align-items:center; gap:7px; border:0; border-radius:9px; background:var(--pred-green); color:#032a14; padding:9px 15px; cursor:pointer; font-size:11px!important; font-weight:900!important; transition:transform .16s ease,filter .16s ease; }
        .pred-button:hover { transform:translateY(-1px); filter:brightness(1.05); }
        .pred-button.secondary { border:1px solid #2f6a63; background:#0b2226; color:#e5f2ec; }
        .pred-button.full { width:100%; min-height:44px; font-size:13px!important; }
        .pred-button:disabled { cursor:not-allowed; opacity:.48; transform:none; }
        .pred-refresh { border:0; background:transparent; color:#9effc7; cursor:pointer; font-size:11px!important; font-weight:850!important; }
        .pred-empty { grid-column:1/-1; padding:40px 20px; border:1px dashed rgba(143,167,160,.28); border-radius:15px; color:#a9c0b5; text-align:center; }
        .pred-detail { max-width:650px; margin:0 auto; }
        .pred-back-link { margin-bottom:15px; padding:0; border:0; background:transparent; color:#a9f3c9; cursor:pointer; font-size:12px!important; font-weight:800!important; }
        .pred-detail-card { padding:clamp(18px,4vw,30px); border:1px solid rgba(83,142,116,.25); border-radius:18px; background:linear-gradient(145deg,rgba(16,42,44,.98),rgba(8,23,29,.98)); }
        .pred-detail-teams { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:10px; text-align:center; }
        .pred-detail-team { display:flex; flex-direction:column; align-items:center; gap:10px; font-size:13px; font-weight:850; }
        .pred-choice-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; margin:23px 0 13px; }
        .pred-choice { min-width:0; min-height:100px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; padding:9px 5px; border:1px solid #374151; border-radius:11px; background:#0f172a; color:#e8f2ed; cursor:pointer; font-size:10px!important; font-weight:850!important; }
        .pred-choice.active { border:2px solid var(--pred-green); background:rgba(6,78,45,.38); box-shadow:0 0 14px rgba(34,224,122,.1); color:#c8ffdd; }
        .pred-choice-mark { width:22px; height:22px; display:grid; place-items:center; border-radius:50%; background:rgba(34,224,122,.12); color:#9effc7; font-size:10px; font-weight:900; }
        .pred-choice .pred-crest { width:44px; height:44px; padding:5px; }
        .pred-note { margin:12px 0 0; color:#8fa7a0; font-size:11px; text-align:center; line-height:1.6; }
        .pred-mock-note { width:fit-content; margin:0 auto 16px; border:1px solid rgba(232,184,48,.22); border-radius:999px; background:rgba(232,184,48,.07); color:#dfc778; padding:6px 11px; font-size:10px; font-weight:750; }
        .pred-scratch-page { max-width:560px; margin:0 auto; min-height:460px; display:flex; flex-direction:column; justify-content:center; gap:18px; padding:clamp(20px,5vw,44px); border:1px solid rgba(232,184,48,.2); border-radius:20px; background:radial-gradient(circle at 50% 38%,rgba(53,70,28,.55),rgba(8,20,26,.97) 70%); }
        .pred-scratch-title { text-align:center; }
        .pred-scratch-title h2 { margin:0; color:#f4fff9; font-size:clamp(21px,4vw,29px); font-weight:950; letter-spacing:.02em; }
        .pred-scratch-title p { margin:7px 0 0; color:#c0d2ca; font-size:13px; }
        .pred-scratch-card { position:relative; min-height:245px; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; border:4px solid var(--pred-gold); border-radius:17px; background:repeating-linear-gradient(115deg,#1b1b14 0 14px,#2b2a16 14px 18px); box-shadow:0 0 30px rgba(232,184,48,.2),inset 0 0 18px rgba(255,255,255,.04); }
        .pred-scratch-card:before { content:""; position:absolute; inset:8px; border:1px solid rgba(255,228,142,.24); border-radius:9px; pointer-events:none; }
        .pred-scratch-brand { color:var(--pred-gold); font-size:19px; font-weight:950; letter-spacing:.08em; }
        .pred-scratch-caption { color:#e8d9a0; font-size:10px; font-weight:850; letter-spacing:.2em; text-transform:uppercase; }
        .pred-coin { display:block; }
        .pred-coin-large { width:clamp(90px,24vw,126px); height:auto; }
        .pred-coin-medium { width:clamp(78px,20vw,104px); height:auto; }
        .pred-coin-small { width:26px; height:26px; }
        .pred-tap-hint { display:flex; justify-content:center; align-items:center; gap:8px; color:#e8d9a0; font-size:12px; font-weight:700; text-align:center; }
        .pred-tap-coin { display:grid; place-items:center; align-self:center; padding:0; border:0; border-radius:50%; background:transparent; cursor:pointer; filter:drop-shadow(0 0 16px rgba(232,184,48,.38)); animation:pred-coin-pulse 1.8s ease-in-out infinite; }
        .pred-tap-coin:hover { animation-play-state:paused; transform:scale(1.06); }
        .pred-tap-coin:focus-visible { outline:3px solid #22e07a; outline-offset:5px; }
        .pred-tap-coin:disabled { cursor:wait; animation-play-state:paused; opacity:.7; }
        @keyframes pred-coin-pulse { 0%,100% { transform:translateY(0) rotate(-3deg); } 50% { transform:translateY(-5px) rotate(3deg); } }
        .pred-reward-reveal { padding:20px; border:2px solid #22e07a; border-radius:15px; background:linear-gradient(#0e5a36,#0b3a2a); text-align:center; animation:pred-reveal-in .35s ease-out both; }
        @keyframes pred-reveal-in { from { opacity:0; transform:translateY(8px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .pred-reward-reveal h3 { margin:8px 0 2px; font-size:21px; font-weight:950; }
        .pred-reward-reveal p { margin:0; color:#c5dfd2; font-size:12px; }
        .pred-reward-actions { display:grid; gap:9px; }
        .pred-delivery-form { display:grid; gap:12px; }
        .pred-delivery-form h3 { margin:0; color:#f2f7f4; font-size:19px; font-weight:900; }
        .pred-delivery-form p { margin:0 0 3px; color:#a9c0b5; font-size:12px; line-height:1.55; }
        .pred-delivery-field { display:grid; gap:5px; color:#c8d9d1; font-size:11px; font-weight:750; }
        .pred-delivery-field input { width:100%; min-width:0; border:1px solid #2a5a54; border-radius:9px; background:#081a1f; color:#f2f7f4; padding:11px 12px; font:inherit; font-size:13px; outline:none; }
        .pred-delivery-field input:focus { border-color:#22e07a; box-shadow:0 0 0 2px rgba(34,224,122,.13); }
        .pred-privacy-note { padding:10px 11px; border:1px solid rgba(232,184,48,.18); border-radius:9px; background:rgba(232,184,48,.05); color:#cbbd8a!important; font-size:10px!important; }
        .pred-result { max-width:560px; margin:0 auto; padding:32px 20px; border:1px solid rgba(232,184,48,.2); border-radius:20px; background:radial-gradient(circle at 50% 30%,rgba(65,77,27,.55),rgba(8,20,26,.98) 68%); text-align:center; }
        .pred-result h2 { margin:0; color:#f5d678; font-size:25px; font-weight:950; }
        .pred-result p { margin:5px 0; color:#d6e6de; font-size:12px; }
        .pred-reward-list { display:grid; gap:10px; }
        .pred-reward-item { display:flex; align-items:center; gap:12px; min-width:0; padding:13px 15px; border:1px solid #1b3b3b; border-radius:12px; background:var(--pred-card); }
        .pred-reward-title { flex:1; font-size:12px; font-weight:850; }
        .pred-reward-title small { display:block; margin-top:4px; color:#8fa7a0; font-size:10px; font-weight:500; }
        .pred-tag { border:1px solid var(--pred-green); border-radius:5px; background:#0f7a45; color:#bfffd8; padding:4px 8px; font-size:9px; font-weight:850; text-transform:uppercase; }
        .pred-tag.processing { border-color:#3cc; background:#0b4d6b; color:#bff; }
        @media(max-width:700px) { .pred-inner { padding-top:14px; } .pred-hero { min-height:150px; } .pred-overline { align-items:start; flex-direction:column; } .pred-section-tabs { width:100%; } .pred-section-tab { flex:1; } }
        @media(max-width:420px) { .pred-page-top { margin-bottom:16px; } .pred-page-caption { font-size:9px; letter-spacing:.08em; } .pred-page-top > .pred-page-caption { display:none; } .pred-play-mode { padding:7px 8px; font-size:8px; } .pred-section-tab { padding:9px 8px; } .pred-match-card { padding:13px; } .pred-teams { gap:5px; } .pred-team { gap:6px; } .pred-team-name { font-size:11px; } .pred-crest { width:48px; height:48px; padding:6px; } .pred-crest-large { width:62px; height:62px; } .pred-choice .pred-crest { width:40px; height:40px; } .pred-filter { min-width:0; flex:1; } .pred-scratch-page { min-height:0; padding:18px 14px; } .pred-scratch-card { min-height:200px; } .pred-reward-item { gap:8px; padding:11px; } .pred-tag { font-size:8px; padding:4px 6px; } }
      `}</style>

      <main className="predictions-page">
        <div className="pred-inner">
          <div className="pred-page-top">
            <button className="pred-back" type="button" onClick={onBack} aria-label="Back to home">
              <span aria-hidden="true">‹</span> Home
            </button>
            <span className="pred-page-caption">Match Centre</span>
            <span className="pred-play-mode"><BallIcon className="h-4 w-4" /> Free-to-play picks</span>
          </div>

          <section className="pred-hero">
            <img className="pred-hero-image" src="/predictions-stadium.png" alt="" />
            <div className="pred-hero-copy">
              <div className="pred-hero-kicker"><BallIcon className="h-5 w-5" /> Predict · Win · Collect</div>
              <h1>Predictions</h1>
              <p>Back your football knowledge. Earn FTC.</p>
            </div>
          </section>

          <div className="pred-overline">
            <div>
              <h2>
                {screen === 'pick' ? 'Make your prediction'
                  : screen === 'scratch' ? 'Your reward'
                    : screen === 'result' ? 'Reward status'
                      : section === 'matches' ? 'Fixtures'
                        : section === 'picks' ? 'My Picks' : 'My Rewards'}
              </h2>
              <p>
                {screen === 'matches' && section === 'matches'
                  ? 'Choose a fixture and make your call before kick-off.'
                  : 'Correct predictions unlock a reward selected from the available reward pool.'}
              </p>
            </div>
            <nav className="pred-section-tabs" aria-label="Predictions sections" hidden={screen !== 'matches'}>
              <button type="button" className={`pred-section-tab ${section === 'matches' ? 'active' : ''}`} onClick={() => setSection('matches')}>Matches</button>
              <button type="button" className={`pred-section-tab ${section === 'picks' ? 'active' : ''}`} onClick={() => setSection('picks')}>My Picks</button>
              <button type="button" className={`pred-section-tab ${section === 'rewards' ? 'active' : ''}`} onClick={() => setSection('rewards')}>My Rewards</button>
            </nav>
          </div>

          {error && <div role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">{error}</div>}

          {screen === 'matches' && section === 'matches' && (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="pred-page-caption">
                  {matches.length ? `${matches.length} fixtures · Football Data` : 'Football fixtures'}
                </span>
                <button type="button" className="pred-refresh" onClick={() => void load()} disabled={loading}>
                  {loading ? 'Refreshing…' : 'Refresh fixtures'}
                </button>
              </div>
              <div className="pred-filter-tabs" role="tablist" aria-label="Match status">
                {(['upcoming', 'live', 'past'] as MatchFilter[]).map(option => (
                  <button key={option} type="button" role="tab" aria-selected={filter === option}
                    className={`pred-filter ${filter === option ? 'active' : ''}`} onClick={() => setFilter(option)}>
                    {option === 'upcoming' ? 'Upcoming' : option === 'live' ? 'Live' : 'Past'}
                  </button>
                ))}
              </div>

              {loading && !matches.length ? (
                <div className="pred-empty">Loading live football fixtures…</div>
              ) : <div className="pred-match-list">
                {visibleMatches.length ? visibleMatches.map(match => {
                  const existing = predictionForMatch(match.id);
                  const resultStatus = matchFilterFor(match.status);
                  const homeScore = match.score?.fullTime?.home;
                  const awayScore = match.score?.fullTime?.away;
                  const hasScore = homeScore != null && awayScore != null;
                  return (
                  <article className="pred-match-card" key={match.id}>
                    <div className="pred-match-meta">
                      <span>{match.competition?.name || 'Football'}</span>
                      {resultStatus === 'live' && <span><i className="pred-live-dot" />LIVE</span>}
                    </div>
                    <div className="pred-teams">
                      <div className="pred-team">
                        <TeamCrest team={match.homeTeam} />
                        <span className="pred-team-name">{match.homeTeam.shortName || match.homeTeam.name}</span>
                      </div>
                      <span className={hasScore ? 'pred-score' : 'pred-vs'}>
                        {hasScore ? `${homeScore} – ${awayScore}` : 'VS'}
                      </span>
                      <div className="pred-team away">
                        <TeamCrest team={match.awayTeam} tone="away" />
                        <span className="pred-team-name">{match.awayTeam.shortName || match.awayTeam.name}</span>
                      </div>
                    </div>
                    <div className="pred-match-footer">
                      <span className="pred-kickoff">{matchDate(match.utcDate)}</span>
                      {resultStatus === 'upcoming' && !existing
                        ? <button className="pred-button" type="button" onClick={() => openPrediction(match)}>Predict <span aria-hidden="true">›</span></button>
                        : existing
                          ? <span className="pred-tag">{existing.status === 'correct' ? 'Correct pick' : existing.status === 'incorrect' ? 'Missed' : 'Pick submitted'}</span>
                          : <span className="pred-tag">{resultStatus === 'live' ? 'In play' : 'Full time'}</span>}
                    </div>
                  </article>
                );
                }) : <div className="pred-empty">{error ? 'Fixtures are temporarily unavailable. Use refresh to try again.' : `No ${filter} fixtures available right now.`}</div>}
              </div>}
              <p className="pred-note">
                {Object.keys(rewardWeights).length
                  ? `Current reward mix: FTC ${rewardWeights.ftc ?? 0}% · Jerseys ${rewardWeights.jersey ?? 0}% · Sports gear ${rewardWeights.sports_gear ?? 0}%. Physical prizes are allocated only while stock is available.`
                  : loading ? 'Checking reward eligibility and current prize stock…' : 'Reward odds could not be loaded. Refresh to check again.'}
              </p>
            </>
          )}

          {screen === 'pick' && selectedMatch && (
            <section className="pred-detail">
              <button type="button" className="pred-back-link" onClick={() => setScreen('matches')}>‹ Back to fixtures</button>
              <div className="pred-detail-card">
                <div className="pred-detail-teams">
                  <div className="pred-detail-team"><TeamCrest team={selectedMatch.homeTeam} size="large" />{selectedMatch.homeTeam.name}</div>
                  <span className="pred-vs">VS</span>
                  <div className="pred-detail-team"><TeamCrest team={selectedMatch.awayTeam} tone="away" size="large" />{selectedMatch.awayTeam.name}</div>
                </div>
                <p className="pred-note">{selectedMatch.competition?.name || 'Football'} · {matchDate(selectedMatch.utcDate)}</p>
                <p style={{ textAlign: 'center', margin: '22px 0 0', fontWeight: 850 }}>Who will win?</p>
                <div className="pred-choice-grid">
                  {([
                    ['home', selectedMatch.homeTeam.shortName || selectedMatch.homeTeam.name, '1'],
                    ['draw', 'Draw', 'X'],
                    ['away', selectedMatch.awayTeam.shortName || selectedMatch.awayTeam.name, '2'],
                  ] as [Pick, string, string][]).map(([value, label, mark]) => (
                    <button key={value} type="button" aria-pressed={selectedPick === value}
                      className={`pred-choice ${selectedPick === value ? 'active' : ''}`} onClick={() => setSelectedPick(value)}>
                      {value === 'home' ? <TeamCrest team={selectedMatch.homeTeam} />
                        : value === 'away' ? <TeamCrest team={selectedMatch.awayTeam} tone="away" />
                          : <span className="pred-choice-mark">{mark}</span>}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!selectedPick || busy || !userId} className="pred-button full" onClick={() => void submitPick()}>
                  {busy ? 'Submitting pick…' : 'Submit Prediction'}
                </button>
                <p className="pred-note">Picks lock at kick-off. Only one pick is allowed per match.</p>
              </div>
            </section>
          )}

          {screen === 'matches' && section === 'picks' && (
            <div className="pred-reward-list">
              {predictions.length ? predictions.map(prediction => (
                <article className="pred-match-card" key={prediction.id}>
                  <div className="pred-match-meta"><span>{prediction.match.competition?.name || 'Football'}</span><span className="pred-tag">{prediction.status}</span></div>
                  <div className="pred-teams">
                    <div className="pred-team"><TeamCrest team={prediction.match.homeTeam} /><span className="pred-team-name">{prediction.match.homeTeam.shortName || prediction.match.homeTeam.name}</span></div>
                    <span className="pred-vs">VS</span>
                    <div className="pred-team away"><TeamCrest team={prediction.match.awayTeam} tone="away" /><span className="pred-team-name">{prediction.match.awayTeam.shortName || prediction.match.awayTeam.name}</span></div>
                  </div>
                  <div className="pred-match-footer">
                    <span className="pred-kickoff">Your pick: {pickName(prediction.pick, prediction.match)} · {matchDate(prediction.kickoffAt)}</span>
                    {prediction.rewardAvailable && (
                      <button type="button" className="pred-button" onClick={() => openReward(prediction)}>
                        {prediction.rewardClaimed ? 'Reward details' : prediction.rewardRevealed ? 'View reward' : 'Reveal reward'}
                      </button>
                    )}
                  </div>
                </article>
              )) : <div className="pred-empty">{loading ? 'Loading your picks…' : 'Your submitted predictions will appear here.'}</div>}
            </div>
          )}

          {screen === 'scratch' && selectedPrediction && (
            <section className="pred-scratch-page">
              {showDeliveryForm ? (
                <form className="pred-delivery-form" onSubmit={event => void submitDeliveryDetails(event)}>
                  <button type="button" className="pred-back-link" onClick={() => setShowDeliveryForm(false)}>‹ Back to reward</button>
                  <div>
                    <h3>Where should we send your prize?</h3>
                    <p>Enter your delivery information to claim {selectedPrediction.rewardName || 'your physical reward'}.</p>
                  </div>
                  <label className="pred-delivery-field">Full name
                    <input autoComplete="name" required maxLength={120} value={deliveryDetails.fullName} onChange={event => setDeliveryDetails(current => ({ ...current, fullName: event.target.value }))} />
                  </label>
                  <label className="pred-delivery-field">Phone
                    <input type="tel" autoComplete="tel" required maxLength={40} value={deliveryDetails.phone} onChange={event => setDeliveryDetails(current => ({ ...current, phone: event.target.value }))} />
                  </label>
                  <label className="pred-delivery-field">Email
                    <input type="email" autoComplete="email" required maxLength={254} value={deliveryDetails.email} onChange={event => setDeliveryDetails(current => ({ ...current, email: event.target.value }))} />
                  </label>
                  <label className="pred-delivery-field">Street address
                    <input autoComplete="street-address" required maxLength={240} value={deliveryDetails.streetAddress} onChange={event => setDeliveryDetails(current => ({ ...current, streetAddress: event.target.value }))} />
                  </label>
                  <label className="pred-delivery-field">City / Region
                    <input autoComplete="address-level2" required maxLength={120} value={deliveryDetails.cityRegion} onChange={event => setDeliveryDetails(current => ({ ...current, cityRegion: event.target.value }))} />
                  </label>
                  <label className="pred-delivery-field">Country
                    <input autoComplete="country-name" required maxLength={120} value={deliveryDetails.country} onChange={event => setDeliveryDetails(current => ({ ...current, country: event.target.value }))} />
                  </label>
                  <p className="pred-privacy-note">These details will be stored with this reward claim and used to fulfil delivery of your physical prize.</p>
                  <button type="submit" className="pred-button full" disabled={busy}>{busy ? 'Submitting details…' : 'Submit details & claim prize'}</button>
                </form>
              ) : !revealed ? (
                <>
                  <div className="pred-scratch-title">
                    <h2>You have a gift waiting!</h2>
                    <p>Tap the coin to reveal your reward</p>
                  </div>
                  <div className="pred-scratch-card" style={{ gap: 8 }}>
                    <button type="button" className="pred-tap-coin" aria-label="Tap coin to reveal reward" onClick={() => void revealReward()} disabled={busy}>
                      <CoinIcon />
                    </button>
                    <span className="pred-scratch-brand">FOOT-COLLECT</span>
                    <span className="pred-scratch-caption">{busy ? 'Revealing reward…' : 'Tap the coin'}</span>
                  </div>
                  <div className="pred-tap-hint">Your confirmed reward stays hidden until you tap the coin.</div>
                </>
              ) : (
                <div className="pred-reward-reveal">
                  <h3>Congratulations!</h3>
                  <p>Your prediction was correct — your reward is ready.</p>
                  <div style={{ margin: '15px 0 8px' }}>
                    <RewardArtwork type={selectedPrediction.rewardType || 'ftc'} className="h-20 w-20 mx-auto" />
                  </div>
                  <h3>{selectedPrediction.rewardName || 'Reward'}</h3>
                  {selectedPrediction.rewardType === 'ftc' && <p>{selectedPrediction.rewardAmount} FTC Tokens</p>}
                  {selectedPrediction.rewardType !== 'ftc' && <p>Physical reward · delivery details collected after claim</p>}
                  <div className="pred-reward-actions" style={{ marginTop: 18 }}>
                    <button type="button" className="pred-button full" disabled={busy || selectedPrediction.rewardClaimed} onClick={() => void claimReward()}>
                      {selectedPrediction.rewardClaimed ? 'Reward claimed' : selectedPrediction.rewardType === 'ftc' ? busy ? 'Claiming…' : 'Claim FTC Reward' : 'Claim physical prize'}
                    </button>
                    <button type="button" className="pred-button secondary full" onClick={() => { setScreen('matches'); setSection('rewards'); }}>View My Rewards</button>
                  </div>
                  {selectedPrediction.rewardClaimed && selectedPrediction.rewardType !== 'ftc' && <p className="pred-note">Your prize is reserved. We’ll collect delivery details in a follow-up step.</p>}
                </div>
              )}
            </section>
          )}

          {screen === 'result' && selectedPrediction && (
            <section className="pred-result">
              <h2>{selectedPrediction.rewardType === 'ftc' ? 'FTC added to your wallet' : 'Prize reserved for you'}</h2>
              <p>{selectedPrediction.rewardName}</p>
              <div style={{ margin: '24px 0 12px' }}><RewardArtwork type={selectedPrediction.rewardType || 'ftc'} className="h-24 w-24 mx-auto" /></div>
              {selectedPrediction.rewardType === 'ftc'
                ? <div style={{ color: '#e8b830', fontSize: 26, fontWeight: 950 }}>{selectedPrediction.rewardAmount} FTC</div>
                : <p>We’ll collect your delivery details in a follow-up step.</p>}
              <div className="pred-reward-actions" style={{ marginTop: 25 }}>
                <button type="button" className="pred-button full" onClick={() => { setScreen('matches'); setSection('rewards'); }}>View My Rewards</button>
                <button type="button" className="pred-button secondary full" onClick={() => { setScreen('matches'); setSection('matches'); }}>Back to Matches</button>
              </div>
            </section>
          )}

          {screen === 'matches' && section === 'rewards' && (
            <section>
              <div className="pred-filter-tabs" role="tablist" aria-label="Reward type">
                {([
                  ['All', 'All rewards'],
                  ['ftc', 'FTC'],
                  ['jersey', 'Jerseys'],
                  ['sports_gear', 'Sports gear'],
                ] as [typeof rewardFilter, string][]).map(([option, label]) => (
                  <button type="button" role="tab" aria-selected={rewardFilter === option} key={option}
                    className={`pred-filter ${rewardFilter === option ? 'active' : ''}`} onClick={() => setRewardFilter(option)}>{label}</button>
                ))}
              </div>
              <div className="pred-reward-list">
                {rewardHistory.filter(reward => rewardFilter === 'All' || reward.rewardType === rewardFilter).map(reward => (
                  <article className="pred-reward-item" key={reward.id}>
                    <RewardArtwork type={reward.rewardType || 'ftc'} className="h-9 w-9 shrink-0" />
                    <div className="pred-reward-title">
                      {reward.rewardRevealed ? reward.rewardName : 'Prediction reward'}
                      <small>{reward.rewardAwardedAt ? matchDate(reward.rewardAwardedAt) : matchDate(reward.kickoffAt)}</small>
                    </div>
                    <span className={`pred-tag ${reward.rewardDeliveryStatus === 'pending_contact' || reward.rewardDeliveryStatus === 'processing' ? 'processing' : ''}`}>
                      {reward.rewardClaimed ? reward.rewardType === 'ftc' ? 'Claimed' : reward.rewardDeliveryStatus === 'contact_submitted' ? 'Details submitted' : 'Processing' : reward.rewardRevealed ? 'Ready' : 'Unrevealed'}
                    </span>
                    {!reward.rewardRevealed && <button type="button" className="pred-button" onClick={() => openReward(reward)}>Reveal</button>}
                  </article>
                ))}
              </div>
              {!rewardHistory.length && <div className="pred-empty">{loading ? 'Loading your rewards…' : 'Rewards from correct predictions will appear here.'}</div>}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PredictionsScreen;

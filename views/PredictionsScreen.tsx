import React, { useMemo, useState } from 'react';
import { resolveClubBadge } from '../src/utils/clubBadge';

type MatchFilter = 'upcoming' | 'live' | 'past';
type Screen = 'matches' | 'pick' | 'scratch' | 'result' | 'rewards';
type Pick = 'home' | 'draw' | 'away';

interface MockMatch {
  id: string;
  league: string;
  date: string;
  status: MatchFilter;
  home: { name: string; shortName: string; badge?: string };
  away: { name: string; shortName: string; badge?: string };
  score?: string;
}

const MOCK_MATCHES: MockMatch[] = [
  {
    id: 'man-utd-liverpool',
    league: 'Premier League',
    date: 'Sat, 17 Oct · 15:00',
    status: 'upcoming',
    home: { name: 'Manchester United', shortName: 'Man United' },
    away: { name: 'Liverpool', shortName: 'Liverpool' },
  },
  {
    id: 'madrid-barcelona',
    league: 'La Liga',
    date: 'Sat, 17 Oct · 20:00',
    status: 'upcoming',
    home: { name: 'Real Madrid', shortName: 'Real Madrid' },
    away: { name: 'Barcelona', shortName: 'Barcelona' },
  },
  {
    id: 'bayern-dortmund',
    league: 'Bundesliga',
    date: 'Sun, 18 Oct · 17:30',
    status: 'upcoming',
    home: { name: 'Bayern Munich', shortName: 'Bayern Munich' },
    away: { name: 'Borussia Dortmund', shortName: 'Dortmund' },
  },
  {
    id: 'juventus-inter',
    league: 'Serie A',
    date: 'LIVE · 62′',
    status: 'live',
    home: { name: 'Juventus', shortName: 'Juventus' },
    away: { name: 'Inter Milan', shortName: 'Inter Milan' },
    score: '1 – 1',
  },
  {
    id: 'arsenal-chelsea',
    league: 'Premier League',
    date: 'Sun, 11 Oct · FT',
    status: 'past',
    home: { name: 'Arsenal', shortName: 'Arsenal' },
    away: { name: 'Chelsea', shortName: 'Chelsea' },
    score: '2 – 1',
  },
];

const MOCK_REWARDS = [
  { id: 'reward-1', amount: 50, date: 'Oct 10, 2026', status: 'Claimed' },
  { id: 'reward-2', amount: 100, date: 'Oct 3, 2026', status: 'Claimed' },
  { id: 'reward-3', amount: 50, date: 'Sep 26, 2026', status: 'Processing' },
];

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

const TeamCrest: React.FC<{ team: MockMatch['home']; tone?: 'home' | 'away'; size?: 'normal' | 'large' }> = ({
  team,
  tone = 'home',
  size = 'normal',
}) => {
  const badge = resolveClubBadge({ name: team.name, shortName: team.shortName, crest: team.badge });
  return (
    <span className={`pred-crest pred-crest-${size} pred-crest-${tone}`}>
      {badge
        ? <img src={badge} alt={`${team.name} crest`} loading="lazy" />
        : <span aria-hidden="true">{team.shortName.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase()}</span>}
    </span>
  );
};

const PredictionsScreen: React.FC<{
  userId?: string | null;
  onBack: () => void;
  onRewardClaimed?: (amount: number, balance: number) => void;
}> = ({ onBack }) => {
  const [filter, setFilter] = useState<MatchFilter>('upcoming');
  const [screen, setScreen] = useState<Screen>('matches');
  const [selectedMatch, setSelectedMatch] = useState<MockMatch | null>(null);
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [rewardFilter, setRewardFilter] = useState<'All' | 'Tokens'>('All');

  const visibleMatches = useMemo(
    () => MOCK_MATCHES.filter(match => match.status === filter),
    [filter],
  );

  const openPrediction = (match: MockMatch) => {
    setSelectedMatch(match);
    setSelectedPick(null);
    setScreen('pick');
  };

  const submitMockPick = () => {
    setRevealed(false);
    setClaimed(false);
    setScreen('scratch');
  };

  return (
    <div className="-mx-6 -my-6 min-h-full bg-[#06141a] text-[#f2f7f4]">
      <style>{`
        .predictions-page {
          --pred-bg: #06141a;
          --pred-panel: #0c1c22;
          --pred-card: #102a2c;
          --pred-line: #1d4a3f;
          --pred-green: #22e07a;
          --pred-green-deep: #0f7a45;
          --pred-muted: #8fa7a0;
          --pred-gold: #e8b830;
          min-height: 100%;
          color: #f2f7f4;
          background: radial-gradient(ellipse at 50% -8%, #0b2a2c 0%, #06141a 48%, #041018 100%);
          font-family: Inter, "Segoe UI", system-ui, sans-serif;
        }
        .predictions-page button { font: inherit; }
        .pred-inner { width: min(100%, 920px); margin: 0 auto; padding: 26px clamp(18px, 4vw, 40px) 42px; }
        .pred-page-top { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:22px; }
        .pred-back { display:inline-flex; align-items:center; gap:8px; padding:9px 13px; border:1px solid #1d4a3f; border-radius:10px; background:#0b2226; color:#cfe2da; cursor:pointer; font-size:13px!important; font-weight:700!important; }
        .pred-page-caption { color:var(--pred-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.13em; }
        .pred-balance { display:flex; align-items:center; gap:8px; border:1px solid rgba(232,184,48,.35); border-radius:999px; background:rgba(232,184,48,.08); color:#f3d26d; padding:6px 12px 6px 7px; font-size:12px; font-weight:800; }
        .pred-hero { position:relative; overflow:hidden; display:flex; align-items:center; min-height:142px; padding:24px clamp(20px,4vw,34px); border:1px solid rgba(34,224,122,.25); border-radius:20px; background:linear-gradient(115deg,rgba(9,70,49,.9),rgba(7,36,43,.93) 62%,rgba(9,29,39,.96)); box-shadow:0 16px 46px rgba(0,0,0,.18); }
        .pred-hero:before { content:""; position:absolute; inset:0; opacity:.4; background:repeating-linear-gradient(90deg,transparent 0 28px,rgba(195,255,221,.08) 29px 30px),linear-gradient(0deg,rgba(1,13,15,.38),transparent 80%); pointer-events:none; }
        .pred-pitch { position:absolute; right:8%; top:50%; width:172px; height:112px; transform:translateY(-50%); border:1px solid rgba(180,255,212,.16); border-radius:50%; }
        .pred-pitch:before { content:""; position:absolute; top:-1px; bottom:-1px; left:50%; border-left:1px solid rgba(180,255,212,.16); }
        .pred-pitch:after { content:""; position:absolute; left:50%; top:50%; width:34px; height:34px; transform:translate(-50%,-50%); border:1px solid rgba(180,255,212,.16); border-radius:50%; }
        .pred-hero-copy { position:relative; z-index:1; }
        .pred-hero-kicker { display:flex; align-items:center; gap:8px; color:#9effc7; font-size:10px; letter-spacing:.15em; font-weight:900; text-transform:uppercase; }
        .pred-hero h1 { margin:9px 0 4px; color:#f4fff9; font-size:clamp(25px,5vw,37px); line-height:1; letter-spacing:.02em; font-weight:950; }
        .pred-hero p { margin:0; color:#bfddd0; font-size:13px; }
        .pred-overline { margin:25px 0 11px; display:flex; justify-content:space-between; align-items:end; gap:12px; }
        .pred-overline h2 { margin:0; font-size:18px; font-weight:850; }
        .pred-overline p { margin:4px 0 0; color:var(--pred-muted); font-size:12px; }
        .pred-section-tabs { display:flex; gap:7px; padding:4px; border:1px solid rgba(255,255,255,.07); border-radius:12px; background:rgba(7,30,32,.85); }
        .pred-section-tab { border:0; border-radius:9px; background:transparent; color:#8fa7a0; padding:9px 15px; cursor:pointer; font-size:12px!important; font-weight:800!important; }
        .pred-section-tab.active { background:var(--pred-green); color:#032a14; }
        .pred-filter-tabs { display:flex; gap:8px; margin:15px 0; }
        .pred-filter { min-width:84px; padding:8px 14px; border:1px solid #25473f; border-radius:999px; background:#0b2226; color:#afc4bb; cursor:pointer; font-size:12px!important; font-weight:750!important; }
        .pred-filter.active { border-color:var(--pred-green); background:rgba(15,122,69,.65); color:#d9ffe8; box-shadow:inset 0 0 0 1px rgba(34,224,122,.14); }
        .pred-match-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .pred-match-card { position:relative; overflow:hidden; padding:16px; border:1px solid rgba(83,142,116,.22); border-radius:15px; background:linear-gradient(145deg,rgba(16,42,44,.98),rgba(9,27,32,.98)); box-shadow:0 8px 24px rgba(0,0,0,.13); }
        .pred-match-card:before { content:""; position:absolute; top:0; left:16px; right:16px; height:1px; background:linear-gradient(90deg,transparent,rgba(34,224,122,.4),transparent); }
        .pred-match-meta { display:flex; justify-content:space-between; align-items:center; gap:10px; color:#a9c0b5; font-size:10px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
        .pred-live-dot { width:6px; height:6px; display:inline-block; margin-right:5px; border-radius:50%; background:#ff5261; box-shadow:0 0 8px #ff5261; }
        .pred-teams { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); align-items:center; gap:8px; margin:18px 0 15px; }
        .pred-team { min-width:0; display:flex; align-items:center; gap:9px; }
        .pred-team.away { flex-direction:row-reverse; text-align:right; }
        .pred-team-name { overflow:hidden; color:#f2f7f4; font-size:12px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
        .pred-vs { color:#78968a; font-size:9px; font-weight:900; letter-spacing:.08em; }
        .pred-crest { width:34px; height:34px; flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.13); border-radius:50%; background:rgba(255,255,255,.06); }
        .pred-crest-large { width:58px; height:58px; padding:8px; }
        .pred-crest img { width:100%; height:100%; object-fit:contain; }
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
        .pred-empty { grid-column:1/-1; padding:40px 20px; border:1px dashed rgba(143,167,160,.28); border-radius:15px; color:#a9c0b5; text-align:center; }
        .pred-detail { max-width:650px; margin:0 auto; }
        .pred-back-link { margin-bottom:15px; padding:0; border:0; background:transparent; color:#a9f3c9; cursor:pointer; font-size:12px!important; font-weight:800!important; }
        .pred-detail-card { padding:clamp(18px,4vw,30px); border:1px solid rgba(83,142,116,.25); border-radius:18px; background:linear-gradient(145deg,rgba(16,42,44,.98),rgba(8,23,29,.98)); }
        .pred-detail-teams { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:10px; text-align:center; }
        .pred-detail-team { display:flex; flex-direction:column; align-items:center; gap:10px; font-size:13px; font-weight:850; }
        .pred-choice-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; margin:23px 0 13px; }
        .pred-choice { min-height:78px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; padding:10px 6px; border:1px solid #2a5a54; border-radius:11px; background:#0b2226; color:#e8f2ed; cursor:pointer; font-size:11px!important; font-weight:850!important; }
        .pred-choice.active { border-color:var(--pred-green); background:rgba(15,122,69,.35); box-shadow:inset 0 0 0 1px var(--pred-green); color:#c8ffdd; }
        .pred-choice-mark { width:22px; height:22px; display:grid; place-items:center; border-radius:50%; background:rgba(34,224,122,.12); color:#9effc7; font-size:10px; font-weight:900; }
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
        .pred-tap-hint { display:flex; justify-content:center; align-items:center; gap:8px; color:#e8d9a0; font-size:12px; font-weight:700; }
        .pred-reward-reveal { padding:20px; border:2px solid #22e07a; border-radius:15px; background:linear-gradient(#0e5a36,#0b3a2a); text-align:center; animation:pred-reveal-in .35s ease-out both; }
        @keyframes pred-reveal-in { from { opacity:0; transform:translateY(8px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .pred-reward-reveal h3 { margin:8px 0 2px; font-size:21px; font-weight:950; }
        .pred-reward-reveal p { margin:0; color:#c5dfd2; font-size:12px; }
        .pred-reward-actions { display:grid; gap:9px; }
        .pred-result { max-width:560px; margin:0 auto; padding:32px 20px; border:1px solid rgba(232,184,48,.2); border-radius:20px; background:radial-gradient(circle at 50% 30%,rgba(65,77,27,.55),rgba(8,20,26,.98) 68%); text-align:center; }
        .pred-result h2 { margin:0; color:#f5d678; font-size:25px; font-weight:950; }
        .pred-result p { margin:5px 0; color:#d6e6de; font-size:12px; }
        .pred-reward-list { display:grid; gap:10px; }
        .pred-reward-item { display:flex; align-items:center; gap:12px; padding:13px 15px; border:1px solid #1b3b3b; border-radius:12px; background:var(--pred-card); }
        .pred-reward-title { flex:1; font-size:12px; font-weight:850; }
        .pred-reward-title small { display:block; margin-top:4px; color:#8fa7a0; font-size:10px; font-weight:500; }
        .pred-tag { border:1px solid var(--pred-green); border-radius:5px; background:#0f7a45; color:#bfffd8; padding:4px 8px; font-size:9px; font-weight:850; text-transform:uppercase; }
        .pred-tag.processing { border-color:#3cc; background:#0b4d6b; color:#bff; }
        @media(max-width:700px) { .pred-match-list { grid-template-columns:1fr; } .pred-inner { padding-top:19px; } .pred-hero { min-height:125px; } .pred-pitch { right:-44px; opacity:.65; } }
        @media(max-width:420px) { .pred-page-top { margin-bottom:16px; } .pred-section-tab { padding:9px 10px; } .pred-match-card { padding:13px; } .pred-teams { gap:5px; } .pred-team { gap:6px; } .pred-team-name { font-size:11px; } .pred-crest { width:30px; height:30px; } .pred-filter { min-width:0; flex:1; } }
      `}</style>

      <main className="predictions-page">
        <div className="pred-inner">
          <div className="pred-page-top">
            <button className="pred-back" type="button" onClick={onBack} aria-label="Back to home">
              <span aria-hidden="true">‹</span> Home
            </button>
            <span className="pred-page-caption">Match Centre</span>
            <div className="pred-balance"><CoinIcon size="small" /> 250 FTC</div>
          </div>

          <section className="pred-hero">
            <div className="pred-pitch" aria-hidden="true" />
            <div className="pred-hero-copy">
              <div className="pred-hero-kicker"><BallIcon className="h-5 w-5" /> Predict · Win · Collect</div>
              <h1>Predictions</h1>
              <p>Back your football knowledge. Earn FTC.</p>
            </div>
          </section>

          <div className="pred-overline">
            <div>
              <h2>{screen === 'rewards' ? 'My Rewards' : screen === 'matches' ? 'Fixtures' : screen === 'pick' ? 'Make your prediction' : screen === 'scratch' ? 'Your reward' : 'Reward claimed'}</h2>
              <p>{screen === 'matches' ? 'Choose a match and make your call.' : 'A demo experience — no real predictions or rewards are submitted.'}</p>
            </div>
            <nav className="pred-section-tabs" aria-label="Predictions sections">
              <button type="button" className={`pred-section-tab ${screen !== 'rewards' ? 'active' : ''}`} onClick={() => setScreen('matches')}>Matches</button>
              <button type="button" className={`pred-section-tab ${screen === 'rewards' ? 'active' : ''}`} onClick={() => setScreen('rewards')}>My Rewards</button>
            </nav>
          </div>

          {screen === 'matches' && (
            <>
              <div className="pred-filter-tabs" role="tablist" aria-label="Match status">
                {(['upcoming', 'live', 'past'] as MatchFilter[]).map(option => (
                  <button key={option} type="button" role="tab" aria-selected={filter === option}
                    className={`pred-filter ${filter === option ? 'active' : ''}`} onClick={() => setFilter(option)}>
                    {option === 'upcoming' ? 'Upcoming' : option === 'live' ? 'Live' : 'Past'}
                  </button>
                ))}
              </div>

              <div className="pred-match-list">
                {visibleMatches.length ? visibleMatches.map(match => (
                  <article className="pred-match-card" key={match.id}>
                    <div className="pred-match-meta">
                      <span>{match.league}</span>
                      {match.status === 'live' && <span><i className="pred-live-dot" />LIVE</span>}
                    </div>
                    <div className="pred-teams">
                      <div className="pred-team">
                        <TeamCrest team={match.home} />
                        <span className="pred-team-name">{match.home.shortName}</span>
                      </div>
                      <span className={match.score ? 'pred-score' : 'pred-vs'}>{match.score || 'VS'}</span>
                      <div className="pred-team away">
                        <TeamCrest team={match.away} tone="away" />
                        <span className="pred-team-name">{match.away.shortName}</span>
                      </div>
                    </div>
                    <div className="pred-match-footer">
                      <span className="pred-kickoff">{match.date}</span>
                      {match.status === 'upcoming'
                        ? <button className="pred-button" type="button" onClick={() => openPrediction(match)}>Predict <span aria-hidden="true">›</span></button>
                        : <span className="pred-tag">{match.status === 'live' ? 'In play' : 'Full time'}</span>}
                    </div>
                  </article>
                )) : <div className="pred-empty">No matches in this section yet.</div>}
              </div>
            </>
          )}

          {screen === 'pick' && selectedMatch && (
            <section className="pred-detail">
              <button type="button" className="pred-back-link" onClick={() => setScreen('matches')}>‹ Back to fixtures</button>
              <div className="pred-detail-card">
                <div className="pred-detail-teams">
                  <div className="pred-detail-team"><TeamCrest team={selectedMatch.home} size="large" />{selectedMatch.home.name}</div>
                  <span className="pred-vs">VS</span>
                  <div className="pred-detail-team"><TeamCrest team={selectedMatch.away} tone="away" size="large" />{selectedMatch.away.name}</div>
                </div>
                <p className="pred-note">{selectedMatch.league} · {selectedMatch.date}</p>
                <p style={{ textAlign: 'center', margin: '22px 0 0', fontWeight: 850 }}>Who will win?</p>
                <div className="pred-choice-grid">
                  {([
                    ['home', selectedMatch.home.shortName, '1'],
                    ['draw', 'Draw', 'X'],
                    ['away', selectedMatch.away.shortName, '2'],
                  ] as [Pick, string, string][]).map(([value, label, mark]) => (
                    <button key={value} type="button" aria-pressed={selectedPick === value}
                      className={`pred-choice ${selectedPick === value ? 'active' : ''}`} onClick={() => setSelectedPick(value)}>
                      <span className="pred-choice-mark">{mark}</span>{label}
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!selectedPick} className="pred-button full" onClick={() => selectedPick && submitMockPick()}>
                  Submit Prediction
                </button>
                <p className="pred-note">Demo only · your pick is not saved or submitted.</p>
              </div>
            </section>
          )}

          {screen === 'scratch' && (
            <section className="pred-scratch-page">
              {!revealed ? (
                <>
                  <div className="pred-scratch-title">
                    <h2>You're a winner!</h2>
                    <p>Scratch the card to reveal your reward</p>
                  </div>
                  <div className="pred-scratch-card">
                    <BallIcon className="h-12 w-12" />
                    <span className="pred-scratch-brand">FOOT-COLLECT</span>
                    <span className="pred-scratch-caption">Scratch &amp; win</span>
                  </div>
                  <div className="pred-tap-hint"><span aria-hidden="true">⌁</span> Tap below to reveal your mock reward</div>
                  <button type="button" className="pred-button full" onClick={() => setRevealed(true)}>Tap to reveal reward</button>
                </>
              ) : (
                <div className="pred-reward-reveal">
                  <h3>Congratulations!</h3>
                  <p>Your demo reward is ready</p>
                  <div style={{ margin: '15px 0 8px' }}><CoinIcon size="medium" /></div>
                  <h3>50 FTC</h3>
                  <p>Token reward · UI preview only</p>
                  <div className="pred-reward-actions" style={{ marginTop: 18 }}>
                    <button type="button" className="pred-button full" onClick={() => { setClaimed(true); setScreen('result'); }}>Claim Reward</button>
                    <button type="button" className="pred-button secondary full" onClick={() => setScreen('rewards')}>View My Rewards</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {screen === 'result' && (
            <section className="pred-result">
              <h2>{claimed ? 'You Won!' : 'FTC Tokens'}</h2>
              <p>FTC Tokens · Demo reward</p>
              <div style={{ margin: '24px 0 12px' }}><CoinIcon /></div>
              <div style={{ color: '#e8b830', fontSize: 26, fontWeight: 950 }}>50 FTC</div>
              <p>Your mock reward is shown for preview only.</p>
              <div className="pred-reward-actions" style={{ marginTop: 25 }}>
                <button type="button" className="pred-button full" onClick={() => setScreen('rewards')}>View Rewards</button>
                <button type="button" className="pred-button secondary full" onClick={() => setScreen('matches')}>Back to Matches</button>
              </div>
            </section>
          )}

          {screen === 'rewards' && (
            <section>
              <div className="pred-filter-tabs" role="tablist" aria-label="Reward type">
                {(['All', 'Tokens'] as const).map(option => (
                  <button type="button" role="tab" aria-selected={rewardFilter === option} key={option}
                    className={`pred-filter ${rewardFilter === option ? 'active' : ''}`} onClick={() => setRewardFilter(option)}>{option}</button>
                ))}
              </div>
              <div className="pred-reward-list">
                {MOCK_REWARDS.filter(reward => rewardFilter === 'All' || reward.amount).map(reward => (
                  <article className="pred-reward-item" key={reward.id}>
                    <CoinIcon size="small" />
                    <div className="pred-reward-title">{reward.amount} FTC Tokens<small>{reward.date}</small></div>
                    <span className={`pred-tag ${reward.status === 'Processing' ? 'processing' : ''}`}>{reward.status}</span>
                  </article>
                ))}
              </div>
              <p className="pred-note">Sample reward history for the UI mockup. No wallet balance is changed.</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PredictionsScreen;

import React, { useMemo, useState } from 'react';

type Tab = 'upcoming' | 'live' | 'past';
type View = 'matches' | 'scratch' | 'result' | 'rewards';

type MatchItem = {
  id: string;
  league: string;
  home: string;
  homeBadge: string;
  away: string;
  awayBadge: string;
  kickoff: string;
  status: Tab;
};

type RewardItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: 'Token' | 'Merchandise' | 'Other';
  status: 'Claimed' | 'Processing' | 'Ready';
};

const matches: MatchItem[] = [
  { id: 'm1', league: 'Premier League', home: 'Man United', homeBadge: 'MU', away: 'Liverpool', awayBadge: 'LFC', kickoff: 'Sun, 20 Apr · 16:30', status: 'upcoming' },
  { id: 'm2', league: 'La Liga', home: 'Real Madrid', homeBadge: 'RM', away: 'Barcelona', awayBadge: 'FCB', kickoff: 'Sun, 20 Apr · 20:00', status: 'upcoming' },
  { id: 'm3', league: 'Bundesliga', home: 'Bayern Munich', homeBadge: 'BAY', away: 'Dortmund', awayBadge: 'BVB', kickoff: 'Mon, 21 Apr · 20:00', status: 'upcoming' },
  { id: 'm4', league: 'Premier League', home: 'Arsenal', homeBadge: 'ARS', away: 'Chelsea', awayBadge: 'CHE', kickoff: 'Sat, 19 Apr · 17:00', status: 'past' },
  { id: 'm5', league: 'Serie A', home: 'Juventus', homeBadge: 'JUV', away: 'Inter Milan', awayBadge: 'INT', kickoff: 'Live · 12:30', status: 'live' },
];

const rewardHistory: RewardItem[] = [
  { id: 'r1', title: '50 FTC Tokens', subtitle: 'Apr 20, 2025', kind: 'Token', status: 'Claimed' },
  { id: 'r2', title: 'Official Jersey (L)', subtitle: 'Apr 12, 2025', kind: 'Merchandise', status: 'Processing' },
  { id: 'r3', title: 'Football Boots', subtitle: 'Apr 5, 2025', kind: 'Merchandise', status: 'Claimed' },
  { id: 'r4', title: '100 FTC Tokens', subtitle: 'Mar 28, 2025', kind: 'Token', status: 'Claimed' },
];

const CoinSvg: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'ft-coin ft-coin-lg', style }) => (
  <svg className={className} style={style} viewBox="0 0 120 120" role="img" aria-label="FTC coin">
    <defs>
      <linearGradient id="coinFace" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#fff3a6" />
        <stop offset="35%" stopColor="#f3d56d" />
        <stop offset="70%" stopColor="#deaa2c" />
        <stop offset="100%" stopColor="#8a5a06" />
      </linearGradient>
      <linearGradient id="coinRing" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#fff4b5" />
        <stop offset="50%" stopColor="#d7a631" />
        <stop offset="100%" stopColor="#7c4d0b" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="rgba(232,184,48,0.2)" />
    <circle cx="60" cy="60" r="49" fill="#70470c" stroke="url(#coinRing)" strokeWidth="5" />
    <circle cx="60" cy="60" r="40" fill="url(#coinFace)" stroke="#ffe58a" strokeWidth="2" />
    <circle cx="60" cy="60" r="34" fill="none" stroke="#9b6814" strokeOpacity="0.7" strokeWidth="1.5" />
    <text x="60" y="68" textAnchor="middle" fill="#804d06" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif">FTC</text>
    <text x="60" y="100" textAnchor="middle" fill="#70470c" fontSize="7" fontWeight="800" letterSpacing="1.3" fontFamily="Arial, sans-serif">FOOT</text>
  </svg>
);

const FootballMark: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'ft-ball', style }) => (
  <div className={className} style={style} aria-hidden="true" />
);

const TeamBadge: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <span className={`ft-crest ${className}`}>{label}</span>
);

const PredictionsScreen: React.FC<{ userId?: string | null; onBack: () => void; onRewardClaimed?: (amount: number, balance: number) => void; }> = ({ userId, onBack, onRewardClaimed = () => undefined }) => {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [activeView, setActiveView] = useState<View>('matches');
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [pick, setPick] = useState<'home' | 'draw' | 'away'>('away');

  const visibleMatches = useMemo(() => matches.filter((item) => item.status === tab), [tab]);

  const openScratch = (match: MatchItem) => {
    setSelectedMatch(match);
    setRevealed(false);
    setClaimed(false);
    setPick('away');
    setActiveView('scratch');
  };

  const revealReward = () => setRevealed(true);
  const claimReward = () => {
    setClaimed(true);
    setActiveView('result');
  };

  return (
    <div className="ft-predictions-shell">
      <style>{`
        :root {
          --bg: #06141a;
          --panel: #0c1c22;
          --card: #102a2c;
          --line: #1d4a3f;
          --g: #22e07a;
          --gd: #0f7a45;
          --text: #f2f7f4;
          --muted: #8fa7a0;
          --gold: #e8b830;
          --dark: #09161b;
          --soft: rgba(255,255,255,0.06);
        }

        * { box-sizing: border-box; }
        .ft-predictions-shell {
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(ellipse at top, #0b2a2c, #04101a 68%);
          color: var(--text);
          font-family: Inter, "Segoe UI", sans-serif;
          padding: 18px 10px 26px;
        }

        .ft-phone {
          width: min(100%, 380px);
          min-height: 760px;
          background: linear-gradient(180deg, #08181e 0%, #050f14 100%);
          border: 2px solid #3b6a72;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 0 0 4px #0a1b22, 0 14px 30px rgba(0,0,0,0.45);
        }

        .ft-statusbar {
          display: flex;
          justify-content: space-between;
          padding: 9px 18px 4px;
          font-size: 9px;
          font-weight: 700;
        }

        .ft-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px 12px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .ft-topbar .ft-menu { font-size: 15px; font-weight: 700; color: var(--text); }
        .ft-brand { display: flex; align-items: center; gap: 6px; }
        .ft-brand span { font-size: 11px; letter-spacing: 0.04em; }
        .ft-btn-ghost {
          border: 0; background: transparent; color: var(--text); font-size: 12px; cursor: pointer;
        }

        .ft-body {
          padding: 0 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .ft-hero {
          height: 76px;
          border-radius: 10px;
          background: linear-gradient(120deg, #0b3a2c, #0a2430 60%, #0a2430 100%);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 10px;
          position: relative;
          overflow: hidden;
        }

        .ft-hero:after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 22px);
        }

        .ft-hero > * { position: relative; z-index: 1; }
        .ft-hero h1 { margin: 0; font-size: 17px; line-height: 1.1; letter-spacing: 0.01em; }
        .ft-sub { color: var(--muted); font-size: 9.5px; }

        .ft-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          background: #0b2226;
          border-radius: 8px;
          padding: 2px;
          font-size: 9px;
          text-align: center;
        }

        .ft-tabs .ft-tab {
          padding: 5px 0;
          border-radius: 6px;
          color: var(--muted);
          border: 0;
          background: transparent;
          font-weight: 700;
          cursor: pointer;
        }

        .ft-tabs .ft-tab.is-active {
          background: var(--g);
          color: #032;
          font-weight: 800;
        }

        .ft-card {
          background: var(--card);
          border: 1px solid #1b3b3b;
          border-radius: 10px;
          padding: 9px;
        }

        .ft-row { display: flex; align-items: center; gap: 8px; }
        .ft-row-between { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .ft-crest {
          width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
          font-size: 8px; font-weight: 900; color: #fff; border: 2px solid rgba(255,255,255,0.2); flex: none;
        }

        .ft-crest.red { background: #d4222a; }
        .ft-crest.white { background: #e6e6e6; color: #235; }
        .ft-crest.magenta { background: #a3004a; }
        .ft-crest.gold { background: #f3c400; color: #111; }
        .ft-crest.crimson { background: #d6001c; }
        .ft-crest.green { background: #0f7a45; }

        .ft-match-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .ft-match-meta { font-size: 9.5px; font-weight: 700; }
        .ft-match-kickoff { color: var(--muted); font-size: 9.5px; }

        .ft-btn {
          display: block; width: 100%; text-align: center; background: var(--g); color: #032a14; font-weight: 800;
          border-radius: 8px; padding: 9px; font-size: 10.5px; border: 0; cursor: pointer;
        }

        .ft-btn-secondary {
          display: block; width: 100%; text-align: center; background: #0b2226; color: var(--text);
          border: 1px solid #2f6a63; font-weight: 700; border-radius: 8px; padding: 9px; font-size: 10.5px; cursor: pointer;
        }

        .ft-btn-small {
          padding: 4px 12px; width: auto; font-size: 9px; border-radius: 6px; display: inline-block;
        }

        .ft-ball {
          width: 14px; height: 14px; border-radius: 50%; display: block; background: radial-gradient(circle at 35% 30%, #fff, #9bd 60%, #245);
          border: 2px solid var(--g); box-shadow: 0 0 0 2px rgba(34,224,122,0.15);
        }

        .ft-hero .ft-ball { width: 18px; height: 18px; }

        .ft-scratch-wrap {
          margin: 6px 10px 0; flex: 1; min-height: 200px; border: 4px solid var(--gold); border-radius: 16px;
          background: repeating-linear-gradient(115deg, #1b1b14 0 14px, #2b2a16 14px 18px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; position: relative;
          box-shadow: 0 0 24px rgba(232,184,48,0.3);
        }

        .ft-scratch-wrap b {
          color: var(--gold); font-size: 16px; letter-spacing: 0.02em; text-transform: uppercase;
        }

        .ft-scratch-wrap small {
          color: #e8d9a0; font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase;
        }

        .ft-coin { display: block; }
        .ft-coin-lg { width: 82px; height: 82px; }
        .ft-coin-md { width: 70px; height: 70px; }
        .ft-coin-sm { width: 28px; height: 28px; }

        .ft-reward-box {
          background: radial-gradient(circle at 50% 35%, rgba(42,42,18,0.96), rgba(8,20,26,0.98));
          border-radius: 16px; padding: 14px 12px 18px; text-align: center; border: 1px solid rgba(232,184,48,0.3);
        }

        .ft-prize-card {
          margin-top: 8px; padding: 12px; border: 2px solid var(--g); border-radius: 14px; background: linear-gradient(#0e5a36, #0b3a2a);
          text-align: center;
        }

        .ft-prize-card .ft-coin { margin: 0 auto 8px; }

        .ft-tag {
          display: inline-block; background: var(--gd); border: 1px solid var(--g); color: #bfffd8; border-radius: 5px; padding: 2px 8px;
          font-size: 8px; font-weight: 700; text-transform: uppercase;
        }

        .ft-tag.processing {
          background: #0b4d6b; border-color: #3cc; color: #bff;
        }

        .ft-list { display: flex; flex-direction: column; gap: 8px; }

        .ft-item {
          display: flex; align-items: center; gap: 9px; background: var(--card); border: 1px solid #1b3b3b; border-radius: 10px; padding: 9px;
        }

        .ft-item-title { flex: 1; font-size: 10.5px; font-weight: 700; }
        .ft-item-title small { display: block; color: var(--muted); font-weight: 400; font-size: 8.5px; margin-top: 2px; }

        .ft-bnav {
          display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));
          border-top: 1px solid #1b3b3b; background: #071419; padding: 7px 4px 12px; font-size: 7.5px; color: var(--muted); text-align: center;
        }

        .ft-bnav .active {
          color: var(--g);
        }

        .ft-bnav span { display: grid; gap: 4px; justify-items: center; }

        .ft-home-cta {
          margin-top: auto; display: flex; flex-direction: column; gap: 8px;
        }

        .ft-faint {
          color: var(--muted);
          font-size: 10px;
        }

        .ft-kicker {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--g);
        }
      `}</style>

      <div className="ft-phone">
        <div className="ft-statusbar"><span>9:41</span><span>▂▄▆ ▮</span></div>

        <div className="ft-topbar">
          <button className="ft-btn-ghost" onClick={onBack} aria-label="Back">Back</button>
          <div className="ft-brand"><FootballMark className="ft-ball" /><span>FOOT-COLLECT</span></div>
          <button className="ft-btn-ghost" aria-label="Refresh">Refresh</button>
        </div>

        {activeView === 'matches' && (
          <>
            <div className="ft-body">
              <div className="ft-hero">
                <FootballMark className="ft-ball" />
                <div>
                  <h1>PREDICTIONS</h1>
                  <div className="ft-sub">Predict. Win. Collect.</div>
                </div>
              </div>

              <div className="ft-tabs" aria-label="Prediction filters">
                {(['upcoming', 'live', 'past'] as Tab[]).map((option) => (
                  <button
                    key={option}
                    className={`ft-tab ${tab === option ? 'is-active' : ''}`}
                    onClick={() => setTab(option)}
                    type="button"
                  >
                    {option === 'upcoming' ? 'Upcoming' : option === 'live' ? 'Live' : 'Past'}
                  </button>
                ))}
              </div>

              {visibleMatches.map((match) => (
                <div key={match.id} className="ft-card">
                  <div className="ft-row-between">
                    <div className="ft-row">
                      <TeamBadge label={match.homeBadge} className="red" />
                      <span>{match.home}</span>
                    </div>
                    <div className="ft-row">
                      <span>{match.away}</span>
                      <TeamBadge label={match.awayBadge} className="crimson" />
                    </div>
                  </div>

                  <div className="ft-row-between" style={{ marginTop: 6 }}>
                    <div>
                      <div className="ft-match-meta">{match.league}</div>
                      <div className="ft-match-kickoff">{match.kickoff}</div>
                    </div>
                    <button className="ft-btn ft-btn-small" type="button" onClick={() => openScratch(match)}>
                      Predict
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ft-bnav">
              <span><b>Home</b></span>
              <span className="active"><b>Pred</b></span>
              <span><b>Collect</b></span>
              <span><b>Forum</b></span>
              <span><b>More</b></span>
            </div>
          </>
        )}

        {activeView === 'scratch' && selectedMatch && (
          <>
            <div className="ft-body" style={{ paddingTop: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="ft-kicker">You are a winner!</div>
                <div className="ft-sub" style={{ marginTop: 6, color: '#dde' }}>Scratch the card to reveal your reward</div>
              </div>

              <div className="ft-scratch-wrap">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <FootballMark className="ft-ball" style={{ width: 46, height: 46, marginBottom: 12 }} />
                </div>
                <b>FOOT-COLLECT</b>
                <small>Scratch &amp; win</small>
                <div style={{ position: 'absolute', right: 10, bottom: 6, fontSize: 34, color: 'rgba(255,255,255,0.8)' }}>Tap</div>
              </div>

              <div className="ft-home-cta">
                <button className="ft-btn" type="button" onClick={revealReward}>Tap to reveal reward</button>
              </div>
            </div>

            {revealed && (
              <div className="ft-body" style={{ paddingTop: 10 }}>
                <div className="ft-reward-box">
                  <div className="ft-kicker" style={{ color: '#f5d678' }}>Congratulations!</div>
                  <div className="ft-sub" style={{ marginTop: 4, color: '#dde' }}>You have won a reward</div>
                  <div className="ft-prize-card">
                    <CoinSvg className="ft-coin ft-coin-md" />
                    <div style={{ fontWeight: 800, fontSize: 12, marginTop: 10 }}>50 FTC</div>
                    <div className="ft-sub">Tokens</div>
                    <span className="ft-tag" style={{ marginTop: 8 }}>Token Reward</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="ft-btn" type="button" onClick={claimReward}>Claim Reward</button>
                  </div>
                  <button className="ft-btn-secondary" style={{ marginTop: 8 }} type="button" onClick={() => setActiveView('rewards')}>
                    View My Rewards
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === 'result' && (
          <>
            <div className="ft-body" style={{ paddingTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="ft-kicker" style={{ fontSize: 18, color: '#f5d678' }}>You Won!</div>
                <div className="ft-sub" style={{ marginTop: 3, color: '#dde' }}>FTC Tokens</div>
              </div>

              <div style={{ margin: '14px 0 6px' }}>
                <CoinSvg className="ft-coin ft-coin-lg" style={{ margin: '0 auto' }} />
              </div>

              <div className="ft-sub" style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>50 FTC</div>
              <div className="ft-sub" style={{ textAlign: 'center', color: '#dde' }}>Your reward has been added to your wallet.</div>

              <div className="ft-home-cta" style={{ marginTop: 14 }}>
                <button className="ft-btn" type="button" onClick={() => setActiveView('rewards')}>View Wallet</button>
                <button className="ft-btn-secondary" type="button" onClick={() => setActiveView('matches')}>Back to Home</button>
              </div>
            </div>
          </>
        )}

        {activeView === 'rewards' && (
          <>
            <div className="ft-body">
              <div style={{ marginTop: 16 }}>
                <div className="ft-kicker" style={{ fontSize: 14, color: '#fff' }}>My Rewards</div>
              </div>

              <div className="ft-tabs" style={{ gridTemplateColumns: '0.7fr 1fr 1.4fr 1fr' }}>
                <button className="ft-tab is-active" type="button">All</button>
                <button className="ft-tab" type="button">Tokens</button>
                <button className="ft-tab" type="button">Merch</button>
                <button className="ft-tab" type="button">Other</button>
              </div>

              <div className="ft-list">
                {rewardHistory.map((reward) => (
                  <div key={reward.id} className="ft-item">
                    {reward.kind === 'Token' ? <CoinSvg className="ft-coin ft-coin-sm" /> : <div className="ft-coin ft-coin-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#ebebeb', color: '#1d3643', fontWeight: 800, fontSize: 8 }}>J</div>}
                    <div className="ft-item-title">
                      {reward.title}
                      <small>{reward.subtitle}</small>
                    </div>
                    <span className={`ft-tag ${reward.status === 'Processing' ? 'processing' : ''}`}>{reward.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ft-bnav">
              <span>Home</span>
              <span className="active">Pred</span>
              <span>Collect</span>
              <span>Forum</span>
              <span>More</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionsScreen;

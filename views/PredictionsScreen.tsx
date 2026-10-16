import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthToken } from '../src/utils/versionControl';

const API_BASE = 'https://footnfts.up.railway.app/api';

type Pick = 'home' | 'draw' | 'away';
type PredictionStatus = 'pending' | 'correct' | 'incorrect' | 'expired';
type Section = 'matches' | 'my-picks' | 'rewards';
type FixtureFilter = 'upcoming' | 'live' | 'past';

interface Team {
  name: string;
  shortName?: string;
  crest?: string;
}

interface Match {
  id: string;
  utcDate: string;
  status: string;
  score?: { fullTime?: { home: number | null; away: number | null } } | null;
  competition?: { name?: string; emblem?: string } | null;
  homeTeam: Team;
  awayTeam: Team;
}

interface Prediction {
  id: string;
  matchId: string;
  kickoffAt: string;
  match: Match;
  pick: Pick;
  result: Pick | null;
  status: PredictionStatus;
  rewardAmount: number | null;
  rewardAwardedAt: string | null;
  rewardAvailable: boolean;
  rewardRevealed: boolean;
  rewardClaimed: boolean;
  rewardClaimedAt: string | null;
  createdAt: string;
}

interface PredictionsScreenProps {
  userId: string | null;
  onBack: () => void;
  onRewardClaimed: (amount: number, balance: number) => void;
}

const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const token = getAuthToken() || localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/predictions${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const data = await response.json();
  if (!response.ok || data?.success === false) {
    if (response.status === 401) {
      throw new Error('Your session is missing or expired. Please sign in again to submit predictions or claim rewards.');
    }
    throw new Error(data?.error || 'The predictions service is unavailable. Please try again.');
  }
  return data as T;
};

const kickoffLabel = (date: string) =>
  new Date(date).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const pickLabel = (pick: Pick) => ({ home: 'Home Win', draw: 'Draw', away: 'Away Win' }[pick]);

const TeamBadge: React.FC<{ team: Team; small?: boolean }> = ({ team, small = false }) => (
  <div className={`${small ? 'h-8 w-8' : 'h-12 w-12'} flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 p-1`}>
    {team.crest ? (
      <img src={team.crest} alt={`${team.name} badge`} className="h-full w-full object-contain" loading="lazy" />
    ) : (
      <span className="text-lg" aria-hidden="true">⚽</span>
    )}
  </div>
);

const ScratchCanvas: React.FC<{ onReveal: () => Promise<void>; busy: boolean }> = ({ onReveal, busy }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [revealing, setRevealing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#13202c';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(-0.52);
    context.fillStyle = 'rgba(213, 166, 53, 0.12)';
    for (let x = -canvas.width; x < canvas.width; x += 46) {
      context.fillRect(x, -canvas.height, 20, canvas.height * 2);
    }
    context.restore();
    context.strokeStyle = '#d7ad43';
    context.lineWidth = 8;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.fillStyle = '#f7df91';
    context.textAlign = 'center';
    context.font = 'bold 32px Oxanium, sans-serif';
    context.fillText('FOOT-COLLECT', canvas.width / 2, canvas.height / 2 - 14);
    context.font = 'bold 22px Rajdhani, sans-serif';
    context.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 + 28);
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (event.currentTarget.width / bounds.width),
      y: (event.clientY - bounds.top) * (event.currentTarget.height / bounds.height),
    };
  };

  const scratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || revealing || busy) return;
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const { x, y } = point(event);
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = 56;
    context.lineCap = 'round';
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  };

  const release = async (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    const canvas = event.currentTarget;
    const context = canvas.getContext('2d');
    if (!context || revealing || busy) return;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let clearPixels = 0;
    const totalPixels = pixels.length / 4;
    for (let i = 3; i < pixels.length; i += 4 * 16) {
      if (pixels[i] < 32) clearPixels++;
    }
    if (clearPixels / (totalPixels / 16) < 0.38) return;

    setRevealing(true);
    setMessage('');
    try {
      await onReveal();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not reveal your reward. Please try again.');
      setRevealing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300/40 bg-slate-950">
      <div className="flex h-44 flex-col items-center justify-center gap-2 text-center">
        <span className="text-4xl" aria-hidden="true">⚽</span>
        <p className="font-black uppercase tracking-widest text-amber-200">A gift is waiting</p>
        <p className="text-sm text-slate-300">Scratch to reveal your reward</p>
      </div>
      <canvas
        ref={canvasRef}
        width={640}
        height={300}
        role="img"
        aria-label="Scratch this card to reveal your confirmed FTC reward"
        className="absolute inset-0 h-full w-full touch-none cursor-pointer"
        onPointerDown={(event) => {
          drawing.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          const context = event.currentTarget.getContext('2d');
          if (!context) return;
          const { x, y } = point(event);
          context.beginPath();
          context.moveTo(x, y);
        }}
        onPointerMove={scratch}
        onPointerUp={release}
        onPointerCancel={() => { drawing.current = false; }}
      />
      {(revealing || busy) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-sm font-bold text-white">
          Confirming your reward…
        </div>
      )}
      {message && <p role="alert" className="absolute bottom-2 left-2 right-2 rounded-lg bg-red-950/90 p-2 text-center text-xs text-red-100">{message}</p>}
    </div>
  );
};

const PredictionsScreen: React.FC<PredictionsScreenProps> = ({ userId, onBack, onRewardClaimed }) => {
  const [section, setSection] = useState<Section>('matches');
  const [fixtureFilter, setFixtureFilter] = useState<FixtureFilter>('upcoming');
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [scratchPrediction, setScratchPrediction] = useState<Prediction | null>(null);
  const [rewardAmount, setRewardAmount] = useState(50);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) {
      setError('Sign in to submit predictions and collect rewards.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [matchData, predictionData] = await Promise.all([
        request<{ matches: Match[]; rewardAmount: number }>('/matches'),
        request<{ predictions: Prediction[] }>(`/mine/${encodeURIComponent(userId)}`),
      ]);
      setMatches(matchData.matches);
      setRewardAmount(matchData.rewardAmount);
      setPredictions(predictionData.predictions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load predictions.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const predictionFor = (matchId: string) => predictions.find(prediction => prediction.matchId === matchId);

  const submit = async () => {
    if (!userId || !selectedMatch || !selectedPick) return;
    setBusy(true);
    setError('');
    try {
      await request('/submit', {
        method: 'POST',
        body: JSON.stringify({ userId, matchId: selectedMatch.id, pick: selectedPick }),
      });
      setSelectedMatch(null);
      setSelectedPick(null);
      setSection('my-picks');
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Prediction could not be submitted.');
    } finally {
      setBusy(false);
    }
  };

  const reveal = async () => {
    if (!userId || !scratchPrediction) return;
    const data = await request<{ rewardAmount: number }>(`/${scratchPrediction.id}/reveal`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    setPredictions(current => current.map(prediction =>
      prediction.id === scratchPrediction.id
        ? { ...prediction, rewardAmount: data.rewardAmount, rewardRevealed: true }
        : prediction
    ));
    setScratchPrediction(current => current
      ? { ...current, rewardAmount: data.rewardAmount, rewardRevealed: true }
      : current
    );
  };

  const claim = async (prediction: Prediction) => {
    if (!userId) return;
    setBusy(true);
    setError('');
    try {
      const data = await request<{ amount: number; balance: number }>(`/${prediction.id}/claim`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      setPredictions(current => current.map(item =>
        item.id === prediction.id ? { ...item, rewardClaimed: true } : item
      ));
      setScratchPrediction(current => current?.id === prediction.id ? { ...current, rewardClaimed: true } : current);
      onRewardClaimed(data.amount, data.balance);
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : 'Reward could not be claimed.');
    } finally {
      setBusy(false);
    }
  };

  const availableRewards = predictions.filter(prediction => prediction.status === 'correct');
  const rewardHistory = predictions.filter(prediction => ['correct', 'expired'].includes(prediction.status));
  const fixturesForFilter = matches.filter(match => {
    const status = match.status.toUpperCase();
    if (fixtureFilter === 'upcoming') {
      return ['SCHEDULED', 'TIMED'].includes(status) && new Date(match.utcDate).getTime() > Date.now();
    }
    if (fixtureFilter === 'live') return ['IN_PLAY', 'PAUSED', 'HALF_TIME'].includes(status);
    return ['FINISHED', 'POST', 'CANCELLED', 'POSTPONED', 'AWARDED'].includes(status);
  });

  return (
    <div className="predictions-screen -mx-6 -my-6 min-h-full bg-[#050c12] text-white">
      <style>{`
        .predictions-screen { font-family: Rajdhani, sans-serif; }
        .prediction-title { font-family: Oxanium, sans-serif; }
        .prediction-scroll { scrollbar-width: none; }
        .prediction-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07131b]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <button onClick={onBack} className="rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-slate-200" aria-label="Back to home">‹ Back</button>
          <div className="text-center">
            <p className="prediction-title text-xs font-black tracking-[0.22em] text-emerald-300">FOOT-COLLECT</p>
            <h1 className="prediction-title text-lg font-black">PREDICTIONS</h1>
          </div>
          <button onClick={() => void load()} className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-300" aria-label="Refresh predictions">Refresh</button>
        </div>
      </header>

      <main className="prediction-scroll mx-auto flex max-w-xl flex-col gap-4 overflow-y-auto px-4 pb-10 pt-4">
        <section className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.22),_transparent_55%),linear-gradient(140deg,#111e25,#071018)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">Predict · Scratch · Collect</p>
          <h2 className="prediction-title mt-2 text-2xl font-black">Call the match.</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-300">Make one prediction before kick-off. Correct picks earn {rewardAmount} FTC after the final whistle and backend result validation.</p>
          <p className="mt-3 text-[11px] text-slate-400">Free to enter · One prediction per match · No staking</p>
        </section>

        <nav className="grid grid-cols-3 rounded-2xl border border-white/10 bg-slate-900/70 p-1" aria-label="Predictions sections">
          {([
            ['matches', 'Matches'],
            ['my-picks', 'My Picks'],
            ['rewards', `My Rewards${availableRewards.length ? ` · ${availableRewards.length}` : ''}`],
          ] as [Section, string][]).map(([value, label]) => (
            <button key={value} onClick={() => { setSection(value); setSelectedMatch(null); setScratchPrediction(null); }}
              className={`rounded-xl px-2 py-2 text-xs font-extrabold transition ${section === value ? 'bg-emerald-400 text-[#06110d]' : 'text-slate-400'}`}>
              {label}
            </button>
          ))}
        </nav>

        {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">{error}</div>}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center text-sm text-slate-300">Loading fixtures and predictions…</div>
        ) : selectedMatch ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <button onClick={() => { setSelectedMatch(null); setSelectedPick(null); }} className="mb-4 text-sm font-bold text-emerald-300">‹ Fixtures</button>
            <div className="mb-4 flex items-center justify-between gap-2 text-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2"><TeamBadge team={selectedMatch.homeTeam} /><span className="text-sm font-extrabold">{selectedMatch.homeTeam.name}</span></div>
              <span className="text-xs font-black text-emerald-300">VS</span>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2"><TeamBadge team={selectedMatch.awayTeam} /><span className="text-sm font-extrabold">{selectedMatch.awayTeam.name}</span></div>
            </div>
            <p className="text-center text-xs text-slate-400">{selectedMatch.competition?.name} · {kickoffLabel(selectedMatch.utcDate)}</p>
            <p className="mt-5 text-center text-sm font-bold">Who will win?</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['home', 'draw', 'away'] as Pick[]).map(pick => (
                <button key={pick} onClick={() => setSelectedPick(pick)} aria-pressed={selectedPick === pick}
                  className={`min-h-14 rounded-xl border px-2 py-3 text-xs font-extrabold ${selectedPick === pick ? 'border-emerald-300 bg-emerald-400 text-slate-950' : 'border-white/10 bg-slate-950/70 text-white'}`}>
                  {pickLabel(pick)}
                </button>
              ))}
            </div>
            <button onClick={() => void submit()} disabled={!selectedPick || busy}
              className="mt-4 w-full rounded-xl bg-emerald-400 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? 'Submitting…' : 'Submit Prediction'}
            </button>
            <p className="mt-3 text-center text-[11px] text-slate-400">Submissions lock automatically at kick-off. Picks cannot be changed.</p>
          </section>
        ) : scratchPrediction ? (
          <section className="rounded-3xl border border-amber-300/20 bg-slate-900/70 p-5">
            <button onClick={() => setScratchPrediction(null)} className="mb-4 text-sm font-bold text-emerald-300">‹ {section === 'my-picks' ? 'My Picks' : 'My Rewards'}</button>
            <h2 className="prediction-title mb-1 text-xl font-black">YOU HAVE A GIFT WAITING!</h2>
            <p className="mb-4 text-sm text-slate-300">Scratch to reveal your confirmed reward.</p>
            {scratchPrediction.rewardRevealed ? (
              <div className="rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-300/20 to-emerald-500/10 p-6 text-center">
                <span className="text-4xl" aria-hidden="true">🪙</span>
                <p className="prediction-title mt-2 text-3xl font-black text-amber-200">{scratchPrediction.rewardAmount} FTC</p>
                <p className="mt-1 text-sm text-slate-300">Your reward is ready to collect into your app balance.</p>
              </div>
            ) : (
              <>
                <ScratchCanvas onReveal={reveal} busy={busy} />
                <button onClick={() => void reveal().catch(revealError => setError(revealError instanceof Error ? revealError.message : 'Could not reveal your reward.'))}
                  disabled={busy} className="mt-3 w-full rounded-xl border border-amber-200/40 py-3 text-sm font-bold text-amber-100 disabled:opacity-50">
                  {busy ? 'Confirming…' : 'Reveal reward without scratching'}
                </button>
              </>
            )}
            {scratchPrediction.rewardRevealed && (
              <button onClick={() => void claim(scratchPrediction)} disabled={busy || scratchPrediction.rewardClaimed}
                className="mt-4 w-full rounded-xl bg-emerald-400 py-3 text-sm font-black text-slate-950 disabled:opacity-50">
                {scratchPrediction.rewardClaimed ? 'Reward Claimed' : busy ? 'Claiming…' : 'Claim FTC Reward'}
              </button>
            )}
            {scratchPrediction.rewardClaimed && <p className="mt-3 text-center text-sm font-bold text-emerald-300">FTC credited to your in-app balance.</p>}
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            {section === 'matches' && (
              <>
                <nav className="grid grid-cols-3 gap-2" aria-label="Match status filter">
                  {([
                    ['upcoming', 'Upcoming'],
                    ['live', 'Live'],
                    ['past', 'Past'],
                  ] as [FixtureFilter, string][]).map(([value, label]) => (
                    <button key={value} onClick={() => setFixtureFilter(value)} aria-pressed={fixtureFilter === value}
                      className={`rounded-xl border py-2 text-xs font-extrabold ${fixtureFilter === value ? 'border-emerald-300/50 bg-emerald-400/15 text-emerald-200' : 'border-white/10 bg-slate-900/60 text-slate-400'}`}>
                      {label}
                    </button>
                  ))}
                </nav>
                {fixturesForFilter.length ? fixturesForFilter.map(match => {
              const existing = predictionFor(match.id);
              return (
                <article key={match.id} className="rounded-2xl border border-white/10 bg-slate-900/65 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{match.competition?.name || 'Football'}</span>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${fixtureFilter === 'live' ? 'bg-red-400/10 text-red-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
                      {fixtureFilter === 'live' ? 'LIVE' : fixtureFilter === 'past' ? 'FT' : kickoffLabel(match.utcDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TeamBadge team={match.homeTeam} small />
                    <span className="min-w-0 flex-1 truncate text-xs font-extrabold">{match.homeTeam.name}</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {match.score?.fullTime?.home != null && match.score?.fullTime?.away != null
                        ? `${match.score.fullTime.home}–${match.score.fullTime.away}`
                        : 'VS'}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-right text-xs font-extrabold">{match.awayTeam.name}</span>
                    <TeamBadge team={match.awayTeam} small />
                  </div>
                  {fixtureFilter !== 'upcoming' ? (
                    existing && <p className="mt-3 rounded-lg bg-slate-950/70 px-3 py-2 text-center text-xs font-bold text-slate-300">Your pick: {pickLabel(existing.pick)}</p>
                  ) : existing ? (
                    <p className="mt-3 rounded-lg bg-slate-950/70 px-3 py-2 text-center text-xs font-bold text-slate-300">Your pick: {pickLabel(existing.pick)} · Submitted</p>
                  ) : (
                    <button onClick={() => { setSelectedMatch(match); setSelectedPick(null); setError(''); }}
                      className="mt-3 w-full rounded-xl bg-emerald-400 py-2.5 text-xs font-black text-slate-950">Predict</button>
                  )}
                </article>
              );
                }) : <p className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center text-sm text-slate-300">
                  {fixtureFilter === 'upcoming' ? 'No upcoming fixtures are available right now.' : `No ${fixtureFilter} matches are available right now.`}
                </p>}
              </>
        )}

            {section === 'my-picks' && (predictions.length ? predictions.map(prediction => (
              <article key={prediction.id} className="rounded-2xl border border-white/10 bg-slate-900/65 p-4">
                <div className="flex items-center gap-3">
                  <TeamBadge team={prediction.match.homeTeam} small />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Your pick: {pickLabel(prediction.pick)} · {kickoffLabel(prediction.kickoffAt)}</p>
                    {prediction.result && <p className="mt-1 text-[11px] text-slate-400">Match result: {pickLabel(prediction.result)}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${prediction.status === 'correct' ? 'bg-emerald-400/15 text-emerald-300' : prediction.status === 'incorrect' ? 'bg-red-400/15 text-red-300' : prediction.status === 'expired' ? 'bg-slate-400/15 text-slate-300' : 'bg-amber-300/15 text-amber-200'}`}>
                    {prediction.status === 'correct' ? 'Correct' : prediction.status === 'incorrect' ? 'Missed' : prediction.status === 'expired' ? 'Expired' : 'Waiting'}
                  </span>
                </div>
                {prediction.rewardAvailable && (
                  <button onClick={() => setScratchPrediction(prediction)}
                    className="mt-3 w-full rounded-xl border border-amber-300/40 bg-amber-200/10 py-2.5 text-xs font-black text-amber-100">
                    {prediction.rewardClaimed ? `Reward claimed · ${prediction.rewardAmount} FTC` : prediction.rewardRevealed ? `Collect ${prediction.rewardAmount} FTC` : 'Scratch to reveal reward'}
                  </button>
                )}
                {prediction.status === 'pending' && new Date(prediction.kickoffAt).getTime() < Date.now() && (
                  <p className="mt-3 text-center text-[11px] text-slate-400">Waiting for the official result. Refresh later to update.</p>
                )}
              </article>
            )) : <p className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center text-sm text-slate-300">Your submitted predictions will appear here.</p>)}

            {section === 'rewards' && (rewardHistory.length ? rewardHistory.map(prediction => (
              <article key={prediction.id} className="rounded-2xl border border-amber-200/20 bg-gradient-to-r from-slate-900 to-emerald-950/30 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-300/15 text-2xl" aria-hidden="true">🪙</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold">{prediction.status === 'expired' ? 'Reward unavailable' : prediction.rewardRevealed ? `${prediction.rewardAmount} FTC Tokens` : 'FTC Scratch Reward'}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{prediction.status === 'expired' ? 'Fixture cancelled · no reward issued' : `Awarded ${prediction.rewardAwardedAt ? kickoffLabel(prediction.rewardAwardedAt) : ''}`}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${prediction.status === 'expired' ? 'bg-slate-400/15 text-slate-300' : prediction.rewardClaimed ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-300/15 text-amber-200'}`}>
                    {prediction.status === 'expired' ? 'Expired' : prediction.rewardClaimed ? 'Claimed' : prediction.rewardRevealed ? 'Ready' : 'Unrevealed'}
                  </span>
                </div>
                {prediction.status === 'correct' && !prediction.rewardClaimed && (
                  <button onClick={() => setScratchPrediction(prediction)} className="mt-3 w-full rounded-xl bg-emerald-400 py-2.5 text-xs font-black text-slate-950">
                    {prediction.rewardRevealed ? 'Claim reward' : 'Scratch to reveal'}
                  </button>
                )}
              </article>
            )) : <p className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center text-sm text-slate-300">Correct predictions and reward history will appear here.</p>)}
          </section>
        )}
        <p className="px-3 pb-2 text-center text-[10px] leading-relaxed text-slate-500">Predictions are free. Picks close at kick-off. Reward eligibility and claims are confirmed by FOOT-COLLECT.</p>
      </main>
    </div>
  );
};

export default PredictionsScreen;

import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';

interface MatchCardData {
  id: string;
  league: string;
  country: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  statusLabel: string;
  stage: string;
  venue: string;
  homeLogo?: string;
  awayLogo?: string;
  raw?: any;
}

const FALLBACK_MATCHES: MatchCardData[] = [
  {
    id: 'fallback-1',
    league: 'Premier League',
    country: 'England',
    kickoff: '2026-09-11T18:00:00Z',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 2,
    awayScore: 1,
    statusLabel: 'FT',
    stage: 'Matchday 5',
    venue: 'Emirates Stadium',
  },
  {
    id: 'fallback-2',
    league: 'LaLiga',
    country: 'Spain',
    kickoff: '2026-09-11T19:00:00Z',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: null,
    awayScore: null,
    statusLabel: 'Kickoff 7:00 PM',
    stage: 'El Clásico',
    venue: 'Santiago Bernabéu',
  },
  {
    id: 'fallback-3',
    league: 'Serie A',
    country: 'Italy',
    kickoff: '2026-09-11T20:15:00Z',
    homeTeam: 'Inter Milan',
    awayTeam: 'Juventus',
    homeScore: null,
    awayScore: null,
    statusLabel: 'Kickoff 8:15 PM',
    stage: 'Matchday 4',
    venue: 'San Siro',
  },
];

const API_ENDPOINTS = [
  'https://site.api.espn.com/apis/site/v2/sports/soccer/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
  'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard',
];

const maybeNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTeams = (competitors: any[] = []) => {
  const home = competitors.find((team) => team?.homeAway === 'home') ?? competitors[0] ?? {};
  const away = competitors.find((team) => team?.homeAway === 'away') ?? competitors[1] ?? competitors[0] ?? {};

  const homeTeam = home.team ?? home;
  const awayTeam = away.team ?? away;

  return {
    homeName: homeTeam?.shortName || homeTeam?.displayName || 'Home',
    awayName: awayTeam?.shortName || awayTeam?.displayName || 'Away',
    homeScore: maybeNumber(home?.score ?? homeTeam?.score),
    awayScore: maybeNumber(away?.score ?? awayTeam?.score),
    homeLogo: homeTeam?.logos?.[0]?.href || homeTeam?.logo || undefined,
    awayLogo: awayTeam?.logos?.[0]?.href || awayTeam?.logo || undefined,
  };
};

const normalizeMatch = (event: any): MatchCardData | null => {
  if (!event) return null;

  const competition = event.competitions?.[0] ?? {};
  const competitionName = competition.competition?.name || event.competition?.name || 'Football';
  const countryName = competition.competition?.location || competition.competition?.country || 'World';
  const status = competition.status ?? event.status ?? {};
  const type = status.type ?? {};
  const state = type.state ?? 'pre';
  const detail = type.shortDetail || type.description || 'Scheduled';

  const homeAway = normalizeTeams(competition.competitors ?? event.competitors ?? []);

  const formattedDate = event.date || competition.date || new Date().toISOString();
  const kickoff = new Date(formattedDate).toISOString();

  const statusLabel =
    state === 'post' || type.completed
      ? `FT${homeAway.homeScore != null && homeAway.awayScore != null ? ` • ${homeAway.homeScore}-${homeAway.awayScore}` : ''}`
      : detail && detail !== 'Scheduled'
        ? detail
        : `Kickoff ${new Date(formattedDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  return {
    id: event.id || `${event.date}-${competitionName}`,
    league: competitionName,
    country: countryName,
    kickoff,
    homeTeam: homeAway.homeName,
    awayTeam: homeAway.awayName,
    homeScore: homeAway.homeScore,
    awayScore: homeAway.awayScore,
    statusLabel,
    stage: event.name || event.shortName || 'Fixture',
    venue: competition.venue?.fullName || event.venue?.fullName || 'TBD',
    homeLogo: homeAway.homeLogo,
    awayLogo: homeAway.awayLogo,
    raw: event,
  };
};

const formatDay = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatClock = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const FootballCalendarScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [matches, setMatches] = useState<MatchCardData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedMatch, setSelectedMatch] = useState<MatchCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      setLoading(true);

      for (const endpoint of API_ENDPOINTS) {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) continue;

          const data = await response.json();
          const events = Array.isArray(data?.events) ? data.events : [];
          const normalized = events
            .map(normalizeMatch)
            .filter((match): match is MatchCardData => Boolean(match));

          if (normalized.length > 0 && isMounted) {
            setMatches(normalized);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Football calendar fetch failed for', endpoint, error);
        }
      }

      if (isMounted) {
        setMatches(FALLBACK_MATCHES);
        setLoading(false);
      }
    };

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  const filters = useMemo(() => {
    const unique = Array.from(new Set(matches.map((match) => match.league).filter(Boolean)));
    return ['All', ...unique];
  }, [matches]);

  const visibleMatches = selectedFilter === 'All'
    ? matches
    : matches.filter((match) => match.league === selectedFilter);

  if (selectedMatch) {
    return (
      <div className="animate-in fade-in duration-300 flex flex-col gap-5 pb-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMatch(null)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <button
            onClick={onBack}
            className="text-xs font-black uppercase tracking-[0.2em] text-green-400"
          >
            Close
          </button>
        </div>

        <Card className="bg-darkCard border border-gray-800 p-5">
          <div className="mb-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">{selectedMatch.country}</p>
            <h2 className="mt-2 text-2xl font-black text-white">{selectedMatch.league}</h2>
            <p className="mt-1 text-xs text-gray-400">{selectedMatch.stage}</p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-darkDeep border border-gray-800 p-4">
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800 text-lg font-black text-white">
                {selectedMatch.homeTeam.slice(0, 2).toUpperCase()}
              </div>
              <p className="truncate text-sm font-black text-white">{selectedMatch.homeTeam}</p>
            </div>

            <div className="flex min-w-[100px] items-center justify-center gap-3">
              <span className="text-3xl font-black text-white">{selectedMatch.homeScore ?? 0}</span>
              <span className="text-lg text-gray-500">:</span>
              <span className="text-3xl font-black text-white">{selectedMatch.awayScore ?? 0}</span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800 text-lg font-black text-white">
                {selectedMatch.awayTeam.slice(0, 2).toUpperCase()}
              </div>
              <p className="truncate text-sm font-black text-white">{selectedMatch.awayTeam}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-gray-300">
            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-darkDeep p-3">
              <span className="text-gray-400">Status</span>
              <span className="font-black text-green-400">{selectedMatch.statusLabel}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-darkDeep p-3">
              <span className="text-gray-400">Date</span>
              <span className="font-bold text-white">{formatDay(selectedMatch.kickoff)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-darkDeep p-3">
              <span className="text-gray-400">Kickoff</span>
              <span className="font-bold text-white">{formatClock(selectedMatch.kickoff)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-darkDeep p-3">
              <span className="text-gray-400">Venue</span>
              <span className="max-w-[180px] text-right font-bold text-white">{selectedMatch.venue}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-20 animate-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Football</p>
          <h2 className="text-3xl font-black text-white tracking-tighter">Football Calendar</h2>
        </div>
        <button onClick={onBack} className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">Back</button>
      </div>

      <Card className="bg-darkCard border border-gray-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Today’s matches</p>
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-green-400">
            Live
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${
                selectedFilter === filter
                  ? 'bg-green-600 text-black'
                  : 'border border-gray-700 bg-darkDeep text-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-darkCard p-6 text-center text-sm text-gray-400">
          Loading fixtures...
        </div>
      ) : visibleMatches.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-darkCard p-6 text-center text-sm text-gray-400">
          No matches available for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleMatches.map((match) => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="w-full rounded-[1.5rem] border border-gray-800 bg-darkCard p-4 text-left transition-all active:scale-[0.99]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-400">{match.country}</p>
                  <p className="mt-1 text-[10px] text-gray-400">{match.league}</p>
                </div>
                <span className="rounded-full bg-green-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-green-400">
                  {match.statusLabel}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-[9px] font-black text-white">
                    {match.homeTeam.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{match.homeTeam}</p>
                  </div>
                </div>

                <div className="text-lg font-black text-white">
                  {match.homeScore ?? 0}
                </div>
              </div>

              <div className="my-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-[9px] font-black text-white">
                    {match.awayTeam.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{match.awayTeam}</p>
                  </div>
                </div>

                <div className="text-lg font-black text-white">
                  {match.awayScore ?? 0}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-3 text-[10px] text-gray-400">
                <span>{formatDay(match.kickoff)}</span>
                <span>{formatClock(match.kickoff)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FootballCalendarScreen;

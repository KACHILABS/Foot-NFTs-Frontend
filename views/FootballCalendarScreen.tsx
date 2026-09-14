import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { CLUBS } from '../constants';

/* ============================================================
   FOOTBALL CALENDAR — MATCH / ODDS / LINE UP / FORMATIONS / VIRTUAL
   System dark theme match centre, 430px portrait, stadium hero.
   Data: backend Football API proxy → football-data.org (real crests,
   multi-league fixtures, squads). Falls back to ESPN + local.
   ============================================================ */

type TabId = 'match' | 'odds' | 'lineup' | 'formation' | 'virtuals';

interface TeamRef {
  id?: string | number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
  logo?: string;
}

interface CalendarMatch {
  id: string | number;
  utcDate: string;
  status: string;
  matchday?: number | null;
  stage?: string;
  competition?: { id?: any; name: string; code?: string; emblem?: string } | null;
  area?: { name?: string; flag?: string } | null;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string | null;
  odds?: any;
  source?: string;
}

interface SquadPlayer {
  id: string | number;
  name: string;
  position?: string;
  nationality?: string;
  dateOfBirth?: string;
}

interface SquadData {
  team?: { id?: any; name?: string; shortName?: string; crest?: string; venue?: string };
  squad: SquadPlayer[];
}

interface OddsMarketRow {
  bookmaker: string;
  key: string;
  outcomes: { name: string; price: number }[];
}

interface OddsPayload {
  success: boolean;
  source?: string;
  available: boolean;
  message?: string;
  homeTeam?: string;
  awayTeam?: string;
  competition?: string;
  markets?: OddsMarketRow[];
}

interface VirtualBet {
  id: string;
  matchId: string | number;
  label: string;
  outcome: '1' | 'X' | '2';
  stake: number;
  odds: number;
  potential: number;
  createdAt: string;
  settled?: boolean;
  won?: boolean;
}

const API_BASE = 'https://footnfts.up.railway.app/api';
const REFRESH_MS = 60000;
const STADIUM_IMG = '/stadium.jpg';

const C = {
  navy: '#0D1B2A',      // system darkDeep
  navy2: '#111827',     // system darkCard
  navyDeep: '#0A0A0F',  // system darkBg
  card: 'rgba(17, 24, 39, 0.72)',
  card2: 'rgba(13, 27, 42, 0.55)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderSoft: 'rgba(255,255,255,0.10)',
  green: '#22C55E',
  greenDeep: '#16A34A',
  cyan: '#4da3ff',
  orange: '#F59E0B',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.58)',
  dim: 'rgba(255,255,255,0.34)',
  mono: "'Space Mono', 'Inter', monospace",
  font: "'Oxanium', 'Inter', sans-serif",
};


/* ---------- inline SVG icons (system icons - no emojis) ---------- */
const SvgIco: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = 'w-3.5 h-3.5', children }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const IcoBall: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.4l4.3 3.1-1.6 5H9.3l-1.6-5L12 7.4z" />
    <path d="M12 3.5v3.9M19.8 9.3l-3.7 1.2M17.4 19.5l-2.7-4M9.3 15.5l-2.7 4M4.2 9.3l3.7 1.2" />
  </SvgIco>
);
const IcoChart: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <path d="M4 4v16h16" />
    <path d="M8.5 16v-5M13 16V8M17.5 16v-3" />
  </SvgIco>
);
const IcoUsers: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5c.7-3.2 2.9-4.9 5.5-4.9s4.8 1.7 5.5 4.9" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16.2 14.7c2.3.2 3.9 1.7 4.4 4.3" />
  </SvgIco>
);
const IcoClipboard: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
    <path d="M9 4.5V3h6v1.5" />
    <path d="M9 10h6M9 13.5h6M9 17h3.5" />
  </SvgIco>
);
const IcoCoin: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v9M9.8 9.6h3.4a1.9 1.9 0 010 3.8H9.8" />
  </SvgIco>
);
const IcoTrophy: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <path d="M8 21h8M12 17.5V21" />
    <path d="M7 4h10v4.5a5 5 0 01-10 0V4z" />
    <path d="M7 5.5H4.5a2.6 2.6 0 002.7 4.2M17 5.5h2.5a2.6 2.6 0 01-2.7 4.2" />
  </SvgIco>
);
const IcoStadium: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <path d="M3 21h18" />
    <path d="M5 21V9.5L12 4l7 5.5V21" />
    <path d="M10 21v-4.5h4V21" />
  </SvgIco>
);
const IcoGlobe: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.5 2.4 3.8 5.2 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.2-3.8-8.5s1.3-6.1 3.8-8.5z" />
  </SvgIco>
);
const IcoSignal: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    <path d="M8.8 11.8a4.5 4.5 0 016.4 0M6.2 9.2a8 8 0 0111.6 0" />
  </SvgIco>
);
const IcoRefresh: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}>
    <path d="M21 12a9 9 0 11-2.6-6.4" />
    <path d="M21 3v6h-6" />
  </SvgIco>
);
const IcoArrowRight: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></SvgIco>
);
const IcoCheck: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIco className={className}><path d="M4.5 12.5l4.8 4.8L19.5 6.5" /></SvgIco>
);
const TABS: { id: TabId; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'match', label: 'Match', Icon: IcoBall },
  { id: 'odds', label: 'Odds', Icon: IcoChart },
  { id: 'lineup', label: 'Line up', Icon: IcoUsers },
  { id: 'formation', label: 'Formations', Icon: IcoClipboard },
  { id: 'virtuals', label: 'Virtuals', Icon: IcoCoin },
];

/* ---------- text helpers ---------- */
const acc = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss').replace(/ø/g, 'o')
    .replace(/đ/g, 'd').replace(/ł/g, 'l')
    .replace(/æ/g, 'ae').replace(/œ/g, 'oe');
const norm = (s: string) =>
  acc((s || '').toLowerCase()).replace(/[^a-z0-9]/g, '')
    .replace(/^(fc|afc|sc|cf|af|ac|as)\s*/, '').trim();
const initials = (name: string) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('');
/* ---------- Digital Terrace logos (the CLUBS list) ---------- */
const findClubBadge = (names: string[]): string | undefined => {
  const tries = names.map(norm).filter(s => s.length > 1);
  for (const club of CLUBS) {
    const clubNorm = norm(club.name);
    if (tries.some(t => t === clubNorm)) return club.badge;
  }
  for (const club of CLUBS) {
    const clubNorm = norm(club.name);
    if (clubNorm.length > 4 && tries.some(t => t.length > 4 && (t.includes(clubNorm) || clubNorm.includes(t)))) return club.badge;
  }
  return undefined;
};
const badgeOf = (team: TeamRef | undefined): string | undefined => {
  if (!team) return undefined;
  // Prefer the same badges used on the Digital Terraces
  const fromClubs = findClubBadge([team.name, team.shortName || '', team.tla || '']);
  return fromClubs || team.crest || team.logo || undefined;
};

/* ---------- URL date helpers ---------- */
const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
};
const fmtDay = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};
const fmtClock = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const statusInfo = (m: CalendarMatch): { label: string; live: boolean; done: boolean } => {
  const st = (m.status || '').toUpperCase();
  if (st === 'IN_PLAY' || st === 'PAUSED' || st === 'HALF_TIME') {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(m.utcDate).getTime()) / 60000));
    return { label: `LIVE · ${Math.min(mins, 120)}'`, live: true, done: false };
  }
  if (st === 'FINISHED' || st === 'POST' || st === 'FT') {
    return { label: 'FT', live: false, done: true };
  }
  return { label: fmtClock(m.utcDate), live: false, done: false };
};

/* ---------- deterministic EST odds (until a bookmaker key feeds live odds) ---------- */
const hashNum = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) & 0xffffffff;
  }
  return h;
};
const estimateOdds = (m: CalendarMatch) => {
  const seed = `${m.id}-${m.homeTeam?.name}-${m.awayTeam?.name}`;
  const h = hashNum(seed);
  const r1 = ((h & 0xff) % 1000) / 1000;
  const r2 = (((h >> 8) & 0xff) % 1000) / 1000;
  const r3 = (((h >> 16) & 0xff) % 1000) / 1000;
  let p1 = 0.34 + r1 * 0.4;
  let pX = 0.16 + r2 * 0.16;
  let p2 = 0.24 + r3 * 0.34;
  const total = p1 + pX + p2;
  p1 /= total; pX /= total; p2 /= total;
  const margin = 0.945; // bookmaker hold
  const dec = (p: number) => Math.round((1 / (p * margin)) * 100) / 100;
  const ouSeed = hashNum(`${seed}-goals`);
  const overP = 0.44 + ((ouSeed & 0xff) % 1000) / 1000 * 0.28;
  const bttsP = 0.5 + (((ouSeed >> 8) & 0xff) % 1000) / 1000 * 0.22;
  return {
    home: dec(p1), draw: dec(pX), away: dec(p2),
    over: dec(overP), under: dec(1 - overP + 0.04),
    bttsYes: dec(bttsP), bttsNo: dec(1 - bttsP + 0.04),
  };
};
/* ---------- local fallback fixtures (crests from the terraces) ---------- */
const localFallback = (): CalendarMatch[] => [
  {
    id: 'fb-1', utcDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), status: 'FINISHED', matchday: 5,
    competition: { id: 2021, name: 'Premier League', code: 'PL', emblem: 'https://crests.football-data.org/PL.png' },
    area: { name: 'England', flag: 'https://crests.football-data.org/770.svg' },
    homeTeam: { id: 42, name: 'Arsenal', shortName: 'Arsenal', crest: 'https://crests.football-data.org/57.png' },
    awayTeam: { id: 49, name: 'Chelsea', shortName: 'Chelsea', crest: 'https://crests.football-data.org/61.png' },
    homeScore: 2, awayScore: 1, venue: 'Emirates Stadium', source: 'fallback',
  },
  {
    id: 'fb-2', utcDate: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), status: 'SCHEDULED', matchday: 7,
    competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
    area: { name: 'Spain', flag: 'https://crests.football-data.org/724.svg' },
    homeTeam: { id: 541, name: 'Real Madrid', shortName: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' },
    awayTeam: { id: 529, name: 'Barcelona', shortName: 'Barcelona', crest: 'https://crests.football-data.org/81.png' },
    homeScore: null, awayScore: null, venue: 'Santiago Bernabéu', source: 'fallback',
  },
  {
    id: 'fb-3', utcDate: new Date(Date.now() + 26 * 3600 * 1000).toISOString(), status: 'SCHEDULED', matchday: 8,
    competition: { id: 2019, name: 'Serie A', code: 'SA', emblem: 'https://crests.football-data.org/SA.png' },
    area: { name: 'Italy', flag: 'https://crests.football-data.org/784.svg' },
    homeTeam: { id: 505, name: 'Inter Milan', shortName: 'Inter', crest: 'https://crests.football-data.org/102.png' },
    awayTeam: { id: 496, name: 'Juventus', shortName: 'Juventus', crest: 'https://crests.football-data.org/109.png' },
    homeScore: null, awayScore: null, venue: 'San Siro', source: 'fallback',
  },
];

const toCalendarMatch = (m: any, source: string): CalendarMatch => ({
  id: m.id,
  utcDate: m.utcDate,
  status: m.status,
  matchday: m.matchday,
  stage: m.stage,
  competition: m.competition ? { id: m.competition.id, name: m.competition.name, code: m.competition.code, emblem: m.competition.emblem } : null,
  area: m.area ? { name: m.area.name, flag: m.area.flag } : null,
  homeTeam: { id: m.homeTeam?.id, name: m.homeTeam?.name || 'Home', shortName: m.homeTeam?.shortName, tla: m.homeTeam?.tla, crest: m.homeTeam?.crest },
  awayTeam: { id: m.awayTeam?.id, name: m.awayTeam?.name || 'Away', shortName: m.awayTeam?.shortName, tla: m.awayTeam?.tla, crest: m.awayTeam?.crest },
  homeScore: m.score?.fullTime?.home,
  awayScore: m.score?.fullTime?.away,
  venue: m.venue || null,
  odds: m.odds,
  source,
});

/* ---------- ESPN fallback normalization ---------- */
const espnMaybeNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const espnToCalendar = (ev: any): CalendarMatch | null => {
  if (!ev) return null;
  const comp = ev.competitions?.[0] ?? {};
  const status = comp.status ?? ev.status ?? {};
  const type = status.type ?? {};
  const detail = type.shortDetail || type.description || 'Scheduled';
  const competitors = comp.competitors ?? [];

  const home = competitors.find((c: any) => c?.homeAway === 'home') ?? competitors[0] ?? {};
  const away = competitors.find((c: any) => c?.homeAway === 'away') ?? competitors[1] ?? {};
  const homeT = home.team ?? home;
  const awayT = away.team ?? away;
  const compName = comp.competition?.name || ev.competition?.name || 'Football';
  const country = comp.competition?.location || comp.competition?.country || 'World';
  const state = type.state ?? 'pre';
  const date = ev.date || comp.date || new Date().toISOString();

  return {
    id: ev.id || `${date}-${compName}`,
    utcDate: date,
    status: state === 'post' || type.completed ? 'FINISHED' : (state === 'in' ? 'IN_PLAY' : 'SCHEDULED'),
    matchday: ev.name ? undefined : undefined,
    stage: ev.name || ev.shortName || 'Fixture',
    competition: { id: ev.league?.id, name: compName, code: ev.league?.abbreviation },
    area: { name: country },
    homeTeam: {
      id: homeT?.id, name: homeT?.shortName || homeT?.displayName || 'Home',
      shortName: homeT?.shortName, tla: homeT?.abbreviation, crest: homeT?.logos?.[0]?.href || homeT?.logo,
    },
    awayTeam: {
      id: awayT?.id, name: awayT?.shortName || awayT?.displayName || 'Away',
      shortName: awayT?.shortName, tla: awayT?.abbreviation, crest: awayT?.logos?.[0]?.href || awayT?.logo,
    },
    homeScore: espnMaybeNumber(home?.score ?? homeT?.score),
    awayScore: espnMaybeNumber(away?.score ?? awayT?.score),
    venue: comp.venue?.fullName || ev.venue?.fullName || null,
    statusLabel: detail,
    source: 'ESPN',
  } as CalendarMatch;
};
/* ============================================================
   MAIN SCREEN
   ============================================================ */
const FootballCalendarScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [matches, setMatches] = useState<CalendarMatch[]>([]);
  const [tab, setTab] = useState<TabId>('match');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState('…');
  const [filter, setFilter] = useState('All');
  const [now, setNow] = useState<Date>(new Date());
  const [detailCache, setDetailCache] = useState<Record<string, CalendarMatch>>({});
  const [squadCache, setSquadCache] = useState<Record<string, SquadData>>({});
  const [oddsCache, setOddsCache] = useState<Record<string, OddsPayload>>({});
  const [virtuals, setVirtuals] = useState<VirtualBet[]>([]);
  const [pickedOutcome, setPickedOutcome] = useState<'1' | 'X' | '2'>('1');
  const [stake, setStake] = useState('10');
  const [formation, setFormation] = useState('4-3-3');

  const tg = (window as any).Telegram?.WebApp;
  const haptic = () => { try { tg?.HapticFeedback?.selectionChanged(); } catch (_) {} };

  const selectedMatch: CalendarMatch | undefined =
    matches.find(m => String(m.id) === String(selectedId)) || matches[0];

  /* ---------- data loading ---------- */
  const fetchOnce = async (): Promise<boolean> => {
    let ok = false;
    try {
      const fromIso = now.toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/fanzone/calendar?dateFrom=${fromIso}&dateTo=${addDays(fromIso, 7)}&limit=90`);
      const data: any = await res.json();
      if (data?.success && Array.isArray(data.matches) && data.matches.length) {
        const mapped = data.matches.map((m: any) => toCalendarMatch(m, 'football-data.org'));
        setMatches(mapped); setDataSource('football-data.org'); setLastUpdated(new Date());
        ok = true;
      }
    } catch (_) { /* backend proxy not deployed yet */ }
    if (ok) return ok;

    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/scoreboard?limit=300');
      if (res.ok) {
        const data: any = await res.json();
        const mapped = (Array.isArray(data?.events) ? data.events : [])
          .map(espnToCalendar).filter(Boolean) as CalendarMatch[];
        if (mapped.length) { setMatches(mapped); setDataSource('ESPN'); setLastUpdated(new Date()); return true; }
      }
    } catch (_) { /* CORS / network */ }

    setMatches(localFallback()); setDataSource('offline demo'); setLastUpdated(new Date());
    return false;
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const ok = await fetchOnce();
      if (!cancelled) setLoading(false);
      return ok;
    };
    run();
    const auto = setInterval(() => { if (!cancelled) { void fetchOnce(); setNow(new Date()); } }, REFRESH_MS);
    const clock = setInterval(() => { if (!cancelled) setNow(new Date()); }, 1000);
    return () => { cancelled = true; clearInterval(auto); clearInterval(clock); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manualRefresh = async () => {
    setRefreshing(true); setLoading(true);
    await fetchOnce();
    setLoading(false); setRefreshing(false);
    haptic();
  };

  /* ---------- detail / squads / odds ---------- */
  const ensureDetail = async (m: CalendarMatch | undefined) => {
    if (!m || detailCache[String(m.id)]) return;
    try {
      const res = await fetch(`${API_BASE}/fanzone/calendar/${m.id}`);
      const d: any = await res.json();
      if (d?.success && d.match) {
        setDetailCache(prev => ({ ...prev, [String(m.id)]: toCalendarMatch({ ...d.match, score: { fullTime: { home: d.match.homeScore, away: d.match.awayScore } } }, 'football-data.org') }));
      }
    } catch (_) {}
  };
  const ensureSquads = async (m: CalendarMatch | undefined) => {
    if (!m) return;
    const ids = [m.homeTeam?.id, m.awayTeam?.id].map(String).filter(id => id && id !== 'undefined');
    for (const id of ids) {
      if (squadCache[id]) continue;
      try {
        const res = await fetch(`${API_BASE}/fanzone/squad/${id}`);
        const d: any = await res.json();
        if (d?.success) setSquadCache(prev => ({ ...prev, [id]: d }));
      } catch (_) {}
    }
  };
  const ensureOdds = async (m: CalendarMatch | undefined) => {
    if (!m || oddsCache[String(m.id)]) return;
    try {
      const res = await fetch(`${API_BASE}/fanzone/odds/${m.id}`);
      const d: any = await res.json();
      if (d?.success) setOddsCache(prev => ({ ...prev, [String(m.id)]: d }));
    } catch (_) {}
  };

  useEffect(() => {
    if (!selectedMatch) return;
    if (tab === 'odds') { void ensureOdds(selectedMatch); void ensureDetail(selectedMatch); }
    if (tab === 'lineup' || tab === 'formation') void ensureSquads(selectedMatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedId, matches.length]);

  const filters = useMemo(() => {
    const uniq = new Set<string>();
    matches.forEach(m => { if (m.competition?.name) uniq.add(m.competition.name); });
    return ['All', ...Array.from(uniq)];
  }, [matches]);

  const visibleMatches = filter === 'All'
    ? matches
    : matches.filter(m => m.competition?.name === filter);
/* ============================================================
   THEME STYLES  (scoped, system dark theme)
   ============================================================ */
const FC_STYLES = `
.fc-root{
  width:100%; max-width:430px; margin:0 auto; position:relative; overflow:hidden;
  display:flex; flex-direction:column; color:#fff;
  background:#0A0A0F;
  border-radius:26px; min-height:640px;
  font-family:'Inter',sans-serif;
}
.fc-hero{ position:relative; padding:12px 14px 4px; }
.fc-hero-bg{ position:absolute; inset:0; background-image:url('${STADIUM_IMG}'); background-size:cover; background-position:center 32%; opacity:.6; }
.fc-hero-veil{ position:absolute; inset:0; background:linear-gradient(205deg, rgba(17,24,39,.5) 0%, rgba(13,27,42,.55) 45%, rgba(10,10,15,.94) 100%); }
.fc-hero-inner{ position:relative; z-index:2; }

.fc-top{ display:flex; align-items:center; gap:10px; }
.fc-back{ width:34px; height:34px; border-radius:12px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.fc-brand{ flex:1; min-width:0; }
.fc-brand-kicker{ font-family:${C.mono}; font-size:9px; letter-spacing:.22em; color:${C.cyan}; text-transform:uppercase; }
.fc-brand-title{ font-family:${C.font}; font-size:17px; font-weight:700; letter-spacing:-.01em; }
.fc-refresh{ display:flex; align-items:center; gap:6px; background:linear-gradient(135deg, ${C.green}, ${C.greenDeep}); color:#000; border:none; border-radius:12px; padding:8px 12px; font-size:11px; font-weight:800; cursor:pointer; }
.fc-refresh svg{ width:13px; height:13px; }
.fc-refresh.spinning svg{ animation:fc-spin 1s linear infinite; }
@keyframes fc-spin{ to{ transform:rotate(360deg);} }

.fc-stadium{ margin-top:12px; position:relative; border-radius:18px; overflow:hidden; padding:15px 14px; }
.fc-stadium-live{ display:flex; align-items:center; gap:8px; font-size:10px; color:rgba(255,255,255,.7); font-family:${C.mono}; letter-spacing:.1em; text-transform:uppercase; }
.fc-live-dot{ width:8px; height:8px; border-radius:50%; background:${C.green}; animation:fc-ping 1.5s ease-out infinite; }
@keyframes fc-ping{ 0%{ box-shadow:0 0 0 0 rgba(34,197,94,.55);} 100%{ box-shadow:0 0 0 7px rgba(34,197,94,0);} }
.fc-stadium-title{ font-family:${C.font}; font-size:21px; font-weight:800; margin-top:6px; }
.fc-stadium-sub{ font-size:11.5px; color:rgba(255,255,255,.62); margin-top:4px; line-height:1.45; }
.fc-stadium-meta{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.fc-meta-chip{ font-family:${C.mono}; font-size:8.5px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14); color:rgba(255,255,255,.78); padding:3px 9px; border-radius:999px; letter-spacing:.05em; }

.fc-tabs{ display:flex; gap:6px; overflow-x:auto; padding:8px 14px; }
.fc-tab{ white-space:nowrap; padding:7px 13px; border-radius:999px; background:rgba(17,24,39,.45); border:1px solid rgba(77,163,255,.12); color:rgba(255,255,255,.62); font-size:11px; font-weight:700; letter-spacing:.03em; display:inline-flex; align-items:center; gap:5px; cursor:pointer; transition:all .15s ease; }
.fc-tab.active{ background:linear-gradient(135deg, ${C.green}, ${C.greenDeep}); color:#000; border-color:transparent; box-shadow:0 4px 14px rgba(34,197,94,.25); }

.fc-body{ padding:14px 14px 24px; display:flex; flex-direction:column; gap:14px; }

.fc-card{ background:${C.card}; border:1px solid ${C.border}; border-radius:16px; overflow:hidden; }
.fc-section-head{ display:flex; align-items:center; gap:8px; padding:9px 12px; }
.fc-section-title{ font-family:${C.font}; font-size:12.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
.fc-pill{ display:inline-flex; align-items:center; gap:5px; font-family:${C.mono}; font-size:8.5px; padding:3px 9px; border-radius:999px; letter-spacing:.08em; text-transform:uppercase; }
.fc-pill.live{ background:rgba(34,197,94,.16); color:${C.green}; border:1px solid rgba(34,197,94,.35); }
.fc-pill.ft{ background:rgba(255,255,255,.09); color:rgba(255,255,255,.7); border:1px solid rgba(255,255,255,.14); }
.fc-pill.soon{ background:rgba(77,163,255,.1); color:${C.cyan}; border:1px solid rgba(77,163,255,.28); }
` +
`/* ---- match list ---- */
.fc-league{ display:flex; align-items:center; gap:10px; padding:10px 12px; border-bottom:1px solid ${C.borderSoft}; }
.fc-league img{ width:22px; height:22px; object-fit:contain; }
.fc-league-name{ font-family:${C.font}; font-size:12px; font-weight:700; letter-spacing:.02em; }
.fc-league-count{ font-family:${C.mono}; font-size:8.5px; color:rgba(255,255,255,.5); }
.fc-match{ display:flex; align-items:center; gap:10px; padding:12px 14px; cursor:pointer; border-top:1px solid rgba(255,255,255,.06); transition:background .15s ease; }
.fc-match:hover, .fc-match.sel{ background:rgba(77,163,255,.05); }
.fc-match-left{ flex:0 0 58px; display:flex; flex-direction:column; align-items:center; }
.fc-day{ font-family:${C.mono}; font-size:9px; color:rgba(255,255,255,.6); text-transform:uppercase; }
.fc-time{ font-family:${C.mono}; font-size:13px; font-weight:700; color:#fff; margin-top:3px; }
.fc-match-mid{ flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.fc-row-team{ display:flex; align-items:center; gap:9px; min-width:0; }
.fc-crest{ width:26px; height:26px; border-radius:50%; object-fit:contain; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.14); padding:2px; flex-shrink:0; }
.fc-crest-fallback{ width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg, ${C.cyan}, ${C.navy}); color:#fff; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; flex-shrink:0; }
.fc-team-name{ font-size:12.5px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
.fc-score{ font-family:${C.mono}; font-size:14px; font-weight:800; width:34px; text-align:right; color:${C.green}; }
.fc-score.small{ color:rgba(255,255,255,.35); }
.fc-match-right{ flex:0 0 66px; display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
.fc-filter-row{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; padding:8px 12px; }
.fc-filter{ font-family:${C.mono}; font-size:8.5px; padding:4px 10px; border-radius:999px; background:rgba(17,24,39,.5); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.62); text-transform:uppercase; letter-spacing:.06em; cursor:pointer; }
.fc-filter.active{ background:linear-gradient(135deg, ${C.green}, ${C.greenDeep}); color:#000; border-color:transparent; }

/* ---- match centre / selected ---- */
.fc-centre{ position:relative; background:${C.card}; border:1px solid ${C.border}; border-radius:18px; padding:14px; }
.fc-centre-veil{ position:absolute; inset:0; border-radius:18px; background:linear-gradient(180deg, rgba(10,10,15,.2), rgba(10,10,15,.55)); pointer-events:none; }
.fc-vs{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.fc-side{ flex:1; display:flex; flex-direction:column; align-items:center; gap:7px; min-width:0; }
.fc-side img{ width:52px; height:52px; object-fit:contain; border-radius:14px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.16); padding:3px; }
.fc-side span{ font-size:12px; font-weight:800; text-align:center; max-width:110px; line-height:1.15; }
.fc-vs-core{ display:flex; flex-direction:column; align-items:center; gap:4px; flex:0 0 52px; }
.fc-vs-score{ font-family:${C.font}; font-size:24px; font-weight:800; }
.fc-vs-xl{ font-family:${C.mono}; font-size:11px; color:rgba(255,255,255,.6); }
.fc-centre-info{ display:flex; flex-wrap:wrap; gap:7px; margin-top:10px; justify-content:center; }
.fc-info{ font-family:${C.mono}; font-size:8.5px; padding:4px 9px; border-radius:999px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.75); letter-spacing:.04em; }
.fc-quick{ display:flex; gap:7px; flex-wrap:wrap; margin-top:10px; justify-content:center; }
.fc-quick-btn{ font-size:10.5px; font-weight:800; font-family:${C.font}; padding:7px 12px; border-radius:11px; background:rgba(17,24,39,.55); border:1px solid rgba(77,163,255,.2); color:${C.cyan}; cursor:pointer; letter-spacing:.02em; }
` +
`/* ---- odds ---- */
.fc-odds-3col{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.fc-odds-cell{ display:flex; flex-direction:column; align-items:center; gap:3px; padding:11px 6px; border-radius:13px; background:rgba(17,24,39,.55); border:1px solid rgba(77,163,255,.16); cursor:pointer; }
.fc-odds-cell.sel{ background:linear-gradient(135deg, ${C.green}, ${C.greenDeep}); border-color:transparent; color:#000; }
.fc-odds-label{ font-family:${C.mono}; font-size:8.5px; opacity:.75; letter-spacing:.06em; }
.fc-odds-val{ font-family:${C.font}; font-size:15px; font-weight:800; }
.fc-odds-name{ font-size:9.5px; opacity:.85; text-align:center; line-height:1.2; }
.fc-odds-note{ font-size:10px; color:rgba(255,255,255,.55); line-height:1.5; padding:9px 12px; font-family:${C.mono}; letter-spacing:.02em; }

/* ---- lineup ---- */
.fc-squad{ display:flex; flex-direction:column; gap:5px; padding:11px 12px; }
.fc-squad-team{ display:flex; align-items:center; gap:9px; padding:8px 10px; background:rgba(10,10,15,.4); border-radius:12px; border:1px solid ${C.borderSoft}; }
.fc-squad-team img{ width:28px; height:28px; object-fit:contain; border-radius:8px; background:rgba(255,255,255,.07); padding:2px; }
.fc-pos-row{ display:flex; align-items:center; justify-content:space-between; padding:7px 10px; background:rgba(255,255,255,.045); border-radius:10px; border:1px solid rgba(255,255,255,.07); }
.fc-pos-gap{ display:flex; align-items:center; gap:6px; min-width:0; }
.fc-pos-av{ width:22px; height:22px; border-radius:8px; background:linear-gradient(135deg, rgba(77,163,255,.25), rgba(17,24,39,.6)); color:#fff; font-size:8px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.fc-pos-name{ font-size:12px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fc-pos-meta{ font-family:${C.mono}; font-size:8px; color:rgba(255,255,255,.45); text-transform:uppercase; letter-spacing:.04em; }
.fc-pos-tag{ font-family:${C.mono}; font-size:8px; padding:2px 7px; border-radius:999px; background:rgba(77,163,255,.12); color:${C.cyan}; border:1px solid rgba(77,163,255,.2); }

/* ---- formations pitch ---- */
.fc-form-row{ display:flex; gap:6px; flex-wrap:wrap; }
.fc-form-chip{ font-family:${C.mono}; font-size:9px; padding:5px 11px; border-radius:999px; background:rgba(17,24,39,.5); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.65); cursor:pointer; }
.fc-form-chip.active{ background:linear-gradient(135deg, ${C.green}, ${C.greenDeep}); color:#000; border-color:transparent; }
.fc-pitch{ position:relative; height:252px; border-radius:18px; overflow:hidden; background:linear-gradient(180deg, #111827 0%, #0D1B2A 100%); }
.fc-pitch-stripes{ position:absolute; inset:0; background:repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 42px, transparent 42px 84px); }
.fc-pitch-line-c{ position:absolute; top:0; left:50%; width:1px; height:100%; background:rgba(255,255,255,.22); }
.fc-pitch-line-m{ position:absolute; top:50%; left:6%; width:88%; height:1px; background:rgba(255,255,255,.22); }
.fc-pitch-box{ position:absolute; left:6%; width:88%; height:58%; top:21%; border:1px solid rgba(255,255,255,.5); border-radius:4px; opacity:.4; }
.fc-player{ position:absolute; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:#000; border:2px solid rgba(255,255,255,.65); cursor:pointer; transform:translate(-50%,-50%); box-shadow:0 0 10px rgba(0,0,0,.25); }

/* ---- virtuals ---- */
.fc-vir-out{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:9px; }
.fc-vir-out-cell{ display:flex; flex-direction:column; align-items:center; gap:3px; padding:11px 6px; border-radius:13px; background:rgba(17,24,39,.55); border:1px solid rgba(77,163,255,.16); cursor:pointer; }
.fc-vir-out-cell.sel{ background:linear-gradient(135deg, ${C.green}, ${C.greenDeep}); border-color:transparent; color:#000; }
.fc-stake-row{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:9px; }
.fc-stake-input{ flex:1; background:rgba(17,24,39,.6); border:1px solid rgba(77,163,255,.22); color:#fff; border-radius:11px; padding:10px 12px; font-family:${C.mono}; font-size:13px; outline:none; }
.fc-vir-btn{ font-family:${C.font}; font-size:11.5px; font-weight:800; padding:11px 18px; border-radius:12px; background:linear-gradient(135deg, ${C.green}, ${C.greenDeep}); color:#000; border:none; cursor:pointer; box-shadow:0 4px 14px rgba(34,197,94,.25); }
.fc-vir-trade{ display:flex; align-items:center; justify-content:space-between; gap:9px; padding:10px 12px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.09); border-radius:12px; }
.fc-vir-sum{ display:flex; justify-content:space-between; gap:10px; font-family:${C.mono}; font-size:10px; color:rgba(255,255,255,.6); }
/* ---- icon alignment (svg swap-in) ---- */
.fc-info{ display:inline-flex; align-items:center; gap:5px; }
.fc-meta-chip{ display:inline-flex; align-items:center; gap:4px; }
.fc-quick-btn{ display:inline-flex; align-items:center; gap:5px; }
.fc-vir-btn{ display:inline-flex; align-items:center; gap:6px; }
.fc-filter{ display:inline-flex; align-items:center; gap:4px; }
.fc-league svg{ width:16px; height:16px; flex-shrink:0; }
.fc-tab svg{ width:13px; height:13px; flex-shrink:0; }
`;

/* ============================================================
     RENDER HELPERS
     ============================================================ */
  const crestImg = (team: TeamRef | undefined, cls: string): React.ReactNode => {
    const src = badgeOf(team);
    if (!src) return <div className="fc-crest-fallback">{initials(team?.name || '?')}</div>;
    return (
      <img
        className={cls}
        src={src}
        alt={team?.name || ''}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  };
  const bigCrest = (team: TeamRef | undefined): React.ReactNode => {
    const src = badgeOf(team);
    if (!src) {
      return (
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #4da3ff, #0D1B2A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
          {initials(team?.name || '?')}
        </div>
      );
    }
    return <img src={src} alt="" loading="lazy" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 14, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.16)', padding: 3 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
  };

  const renderHero = () => (
    <div className="fc-hero">
      <div className="fc-hero-bg" />
      <div className="fc-hero-veil" />
      <div className="fc-hero-inner">
        <div className="fc-top">
          <button className="fc-back" onClick={() => { haptic(); onBack(); }} aria-label="Back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="fc-brand">
            <div className="fc-brand-kicker">Match Centre</div>
            <div className="fc-brand-title">Football Calendar</div>
          </div>
          <button className={`fc-refresh${refreshing ? ' spinning' : ''}`} onClick={manualRefresh} aria-label="Refresh fixtures">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12l-4-9-7-4 3 1 8-9 1-2 8 9 2 3" /></svg>
            Refresh
          </button>
        </div>

        <div className="fc-stadium">
          <div className="fc-stadium-live">
            <span className="fc-live-dot" />
            MatchDay Live · {fmtTime(now)}
            {lastUpdated ? ` · Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </div>
          <div className="fc-stadium-title">Your Matchday Hub</div>
          <div className="fc-stadium-sub">
            Fresh fixtures across {Math.max(filters.length - 1, 1)} leagues — live scores, odds, line-ups &amp; formations.
          </div>
          <div className="fc-stadium-meta">
            <span className="fc-meta-chip"><IcoRefresh className="w-3 h-3" /> auto 60s</span>
            <span className="fc-meta-chip"><IcoSignal className="w-3 h-3" /> {dataSource}</span>
            <span className="fc-meta-chip">{matches.length} fixtures</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="fc-tabs">
      {TABS.map(t => (
        <button key={t.id} className={`fc-tab${tab === t.id ? ' active' : ''}`} onClick={() => { haptic(); setTab(t.id); }}>
          <t.Icon className="w-3.5 h-3.5" />{t.label}
        </button>
      ))}
    </div>
  );
const renderMatchRow = (m: CalendarMatch): React.ReactNode => {
    const st = statusInfo(m);
    const sel = selectedMatch && String(selectedMatch.id) === String(m.id);
    return (
      <div key={m.id} className={`fc-match${sel ? ' sel' : ''}`} onClick={() => { haptic(); setSelectedId(m.id); }}>
        <div className="fc-match-left">
          <span className="fc-day">{fmtDay(m.utcDate).split(',')[0]}</span>
          <span className="fc-time">{fmtClock(m.utcDate)}</span>
        </div>
        <div className="fc-match-mid">
          <div className="fc-row-team">
            {crestImg(m.homeTeam, 'fc-crest')}
            <span className="fc-team-name">{m.homeTeam?.name}</span>
            <span className={`fc-score${m.homeScore == null ? ' small' : ''}`}>{m.homeScore ?? '·'}</span>
          </div>
          <div className="fc-row-team">
            {crestImg(m.awayTeam, 'fc-crest')}
            <span className="fc-team-name">{m.awayTeam?.name}</span>
            <span className={`fc-score${m.awayScore == null ? ' small' : ''}`}>{m.awayScore ?? '·'}</span>
          </div>
        </div>
        <div className="fc-match-right">
          <span className={`fc-pill ${st.live ? 'live' : st.done ? 'ft' : 'soon'}`}>{st.label}</span>
        </div>
      </div>
    );
  };

  const renderCentre = (m: CalendarMatch): React.ReactNode => {
    const st = statusInfo(m);
    return (
      <div className="fc-centre">
        <div className="fc-centre-veil" />
        <div className="fc-vs">
          <div className="fc-side">
            {bigCrest(m.homeTeam)}
            <span>{m.homeTeam?.name}</span>
          </div>
          <div className="fc-vs-core">
            {!st.live && !st.done ? (
              <div className="fc-vs-xl" style={{ fontSize: 15 }}>VS</div>
            ) : (
              <div className="fc-vs-score">{m.homeScore ?? 0}<span style={{ fontSize: 16 }}> – </span>{m.awayScore ?? 0}</div>
            )}
            <span className={`fc-pill ${st.live ? 'live' : st.done ? 'ft' : 'soon'}`}>{st.label}</span>
          </div>
          <div className="fc-side">
            {bigCrest(m.awayTeam)}
            <span>{m.awayTeam?.name}</span>
          </div>
        </div>
        <div className="fc-centre-info">
          <span className="fc-info"><IcoStadium className="w-3 h-3" /> {m.venue || (m.competition?.name || 'Stadium')}</span>
          <span className="fc-info">{m.competition?.name}</span>
          <span className="fc-info">MD {m.matchday || '?'}</span>
          {m.area?.flag ? (
            <span className="fc-info"><IcoGlobe className="w-3 h-3" /> {m.area.name}</span>
          ) : null}
        </div>
        <div className="fc-quick">
          <button className="fc-quick-btn" onClick={() => { haptic(); setTab('odds'); }}><IcoChart className="w-3 h-3" /> Odds</button>
          <button className="fc-quick-btn" onClick={() => { haptic(); setTab('lineup'); }}><IcoUsers className="w-3 h-3" /> XI</button>
          <button className="fc-quick-btn" onClick={() => { haptic(); setTab('formation'); }}><IcoClipboard className="w-3 h-3" /> Formation</button>
          <button className="fc-quick-btn" onClick={() => { haptic(); setTab('virtuals'); }}><IcoCoin className="w-3 h-3" /> Virtuals</button>
        </div>
      </div>
    );
  };
const noMatchCard = (msg: string): React.ReactNode => (
    <div className="fc-card">
      <div className="fc-section-head">
        <span className="fc-section-title">{msg}</span>
      </div>
      <div className="fc-odds-note" style={{ textAlign: 'center' }}>
        Tap a fixture on the Match tab to unlock {tab === 'match' ? 'the match centre' : `the ${tab} board`}.
      </div>
    </div>
  );

  const renderMatchTab = (): React.ReactNode => {
    if (loading) {
      return (
        <div className="fc-centre" style={{ padding: 22 }}>
          <div className="fc-centre-veil" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.cyan, fontFamily: C.mono, fontSize: 10 }}>
            <span className="fc-live-dot" /> SYNCING FIXTURES…
          </div>
        </div>
      );
    }
    const groups = new Map<string, CalendarMatch[]>();
    visibleMatches.forEach((m) => {
      const key = m.competition?.name || 'Other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    });
    return (
      <React.Fragment>
        {selectedMatch ? renderCentre(selectedMatch) : null}
        <div className="fc-card">
          <div className="fc-section-head">
            <span className="fc-section-title">Fixtures</span>
            <span className="fc-pill soon">{visibleMatches.length} games</span>
          </div>
          <div className="fc-filter-row">
            {filters.map(f => (
              <button key={f} className={`fc-filter${filter === f ? ' active' : ''}`} onClick={() => { haptic(); setFilter(f); }}>
                {f}
              </button>
            ))}
          </div>
          {Array.from(groups.entries()).map(([league, ms]) => (
            <React.Fragment key={league}>
              <div className="fc-league">
                {ms[0]?.competition?.emblem ? (
                  <img src={ms[0].competition.emblem} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <IcoTrophy className="w-4 h-4 text-[#4da3ff]" />
                )}
                <span className="fc-league-name">{league}</span>
                <span className="fc-league-count">{ms.length}</span>
              </div>
              {ms.map(renderMatchRow)}
            </React.Fragment>
          ))}
          {visibleMatches.length === 0 && (
            <div className="fc-odds-note" style={{ textAlign: 'center' }}>No fixtures for this filter yet.</div>
          )}
        </div>
      </React.Fragment>
    );
  };
const renderEstOdds = (m: CalendarMatch) => {
    const est = estimateOdds(m);
    const pick = (o: '1' | 'X' | '2') => {
      setPickedOutcome(o);
      haptic();
    };
    return (
      <React.Fragment>
        <div style={{ padding: '4px 12px 2px', fontFamily: C.mono, fontSize: 8.5, color: 'rgba(255,255,255,.5)', letterSpacing: '.06em' }}>
          MATCH RESULT · 1X2
        </div>
        <div className="fc-odds-3col">
          <div className={`fc-odds-cell${pickedOutcome === '1' ? ' sel' : ''}`} onClick={() => pick('1')}>
            <span className="fc-odds-label">1</span>
            <span className="fc-odds-val">{est.home}</span>
            <span className="fc-odds-name">{m.homeTeam?.shortName || m.homeTeam?.name}</span>
          </div>
          <div className={`fc-odds-cell${pickedOutcome === 'X' ? ' sel' : ''}`} onClick={() => pick('X')}>
            <span className="fc-odds-label">X</span>
            <span className="fc-odds-val">{est.draw}</span>
            <span className="fc-odds-name">Draw</span>
          </div>
          <div className={`fc-odds-cell${pickedOutcome === '2' ? ' sel' : ''}`} onClick={() => pick('2')}>
            <span className="fc-odds-label">2</span>
            <span className="fc-odds-val">{est.away}</span>
            <span className="fc-odds-name">{m.awayTeam?.shortName || m.awayTeam?.name}</span>
          </div>
        </div>
        <div className="fc-odds-row" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <span className="fc-team-name" style={{ flex: 1 }}>Over / Under 2.5 goals</span>
          <span className="fc-odds-val" style={{ width: 60 }}>O {est.over}</span>
          <span className="fc-odds-val" style={{ width: 60 }}>U {est.under}</span>
        </div>
        <div className="fc-odds-row">
          <span className="fc-team-name" style={{ flex: 1 }}>Both teams to score</span>
          <span className="fc-odds-val" style={{ width: 60 }}>Y {est.bttsYes}</span>
          <span className="fc-odds-val" style={{ width: 60 }}>N {est.bttsNo}</span>
        </div>
      </React.Fragment>
    );
  };

  const renderLiveMarkets = (markets: OddsMarketRow[]) => (
    <React.Fragment>
      {markets.map((mk, i) => (
        <div key={i} className="fc-odds-row" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fc-team-name" style={{ fontSize: 11.5 }}>
              {mk.key === 'h2h' ? 'Match result' : mk.key === 'totals' ? 'Over/Under 2.5' : 'Both to score'}
            </div>
            <div className="fc-pos-meta">{mk.bookmaker}</div>
          </div>
          {mk.outcomes.slice(0, 3).map(o => (
            <span key={o.name} className="fc-info" style={{ border: '1px solid rgba(34,197,94,.3)', color: C.green }}>
              {o.name.split(' ')[0]} {o.price}
            </span>
          ))}
        </div>
      ))}
    </React.Fragment>
  );

  const renderOddsTab = (m: CalendarMatch | undefined): React.ReactNode => {
    if (!m) return noMatchCard('Odds');
    const cached = oddsCache[String(m.id)];
    const live = Boolean(cached?.available && cached.markets && cached.markets.length);
    return (
      <React.Fragment>
        <div className="fc-card">
          <div className="fc-section-head">
            <span className="fc-section-title">Bookmaker odds</span>
            <span className={`fc-pill ${live ? 'live' : 'soon'}`}>{live ? 'LIVE' : 'EST'}</span>
          </div>
          <div className="fc-odds-note">
            {m.homeTeam?.name} vs {m.awayTeam?.name} · {m.competition?.name}
          </div>
          {live ? renderLiveMarkets(cached!.markets!) : renderEstOdds(m)}
          {!live && (
            <div className="fc-odds-note">
              Estimates shown until the bookmaker feed opens for this fixture.
              {cached?.message ? ` Feed: ${cached.message}` : ''}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };
const POS_ABBR: Record<string, string> = {
    Goalkeeper: 'GK', Defence: 'DEF', Midfield: 'MID', Offence: 'FWD',
  };
  const posAbbr = (p?: string) => POS_ABBR[p || ''] || (p ? p.slice(0, 3).toUpperCase() : 'PL');

  const renderSquadCard = (m: CalendarMatch, isAway: boolean): React.ReactNode => {
    const team = isAway ? m.awayTeam : m.homeTeam;
    const data = team?.id ? squadCache[String(team.id)] : undefined;
    const title = `${isAway ? 'Away' : 'Home'} squad · ${team?.name || '…'}`;
    if (!data) {
      return (
        <div className="fc-card">
          <div className="fc-section-head">
            <span className="fc-section-title">{title}</span>
            <span className="fc-pill soon">loading</span>
          </div>
          <div className="fc-odds-note">Fetching registered squad from the live feed…</div>
        </div>
      );
    }
    const players = (data.squad || []).slice(0, 24);
    if (players.length === 0) {
      return (
        <div className="fc-card">
          <div className="fc-section-head"><span className="fc-section-title">{title}</span></div>
          <div className="fc-odds-note">No squad feed published for this team yet.</div>
        </div>
      );
    }
    const ordered = [...players].sort((a, b) => {
      const pa = POS_ABBR[a.position || ''] || 'ZZ';
      const pb = POS_ABBR[b.position || ''] || 'ZZ';
      return pa === pb ? (a.name || '').localeCompare(b.name || '') : pa.localeCompare(pb);
    });
    return (
      <div className="fc-card">
        <div className="fc-squad-team">
          {crestImg(team, 'fc-crest')}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fc-team-name">{team?.name}</div>
            <div className="fc-pos-meta">{data.team?.venue || 'Squad'}</div>
          </div>
          <span className="fc-pill soon">{ordered.length} players</span>
        </div>
        <div className="fc-squad">
          {ordered.map(p => (
            <div key={p.id} className="fc-pos-row">
              <div className="fc-pos-gap">
                <span className="fc-pos-av">{initials(p.name)}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="fc-pos-name">{p.name}</div>
                  <div className="fc-pos-meta">{p.position || 'Player'} · {p.nationality || '—'}</div>
                </div>
              </div>
              <span className="fc-pos-tag">{posAbbr(p.position)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLineupTab = (m: CalendarMatch | undefined): React.ReactNode => {
    if (!m) return noMatchCard('Line up');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {renderSquadCard(m, false)}
        {renderSquadCard(m, true)}
        <div className="fc-odds-note" style={{ fontFamily: C.mono }}>
          LINE-UPS · LIVE SQUAD FEED · PREDICTED XI
        </div>
      </div>
    );
  };
const FORMATIONS: Record<string, { def: number; mid: number; off: number }> = {
    '4-3-3': { def: 4, mid: 3, off: 3 },
    '4-4-2': { def: 4, mid: 4, off: 2 },
    '3-5-2': { def: 3, mid: 5, off: 2 },
    '4-2-3-1': { def: 4, mid: 2, off: 4 },
  };
  const ROLE_COLOR: Record<string, string> = { Offence: '#22C55E', Midfield: '#4da3ff', Defence: '#F59E0B', Goalkeeper: '#8B93A9' };
  const shirtNo = (id: string | number) => (hashNum(String(id)) % 80) + 10;

  const renderFormationTab = (m: CalendarMatch | undefined): React.ReactNode => {
    if (!m) return noMatchCard('Formations');
    const team = m.homeTeam;
    const data = team?.id ? squadCache[String(team.id)] : undefined;
    if (!data) {
      return (
        <div className="fc-card">
          <div className="fc-section-head"><span className="fc-section-title">Formation · {team?.name || '…'}</span></div>
          <div className="fc-odds-note">Loading {team?.name} squad to build the tactical board…</div>
        </div>
      );
    }
    const pool = (data.squad || []).filter(p => p.name && p.name !== 'null');
    const byRole = (r: string) => pool.filter(p => (p.position || '').toLowerCase().includes(r));
    const gks = byRole('goal');
    const defs = byRole('defence');
    const mids = byRole('midfield');
    const offs = byRole('offence');
    const others = pool.filter(p =>
      !(p.position || '').toLowerCase().includes('goal') &&
      !(p.position || '').toLowerCase().includes('defence') &&
      !(p.position || '').toLowerCase().includes('midfield') &&
      !(p.position || '').toLowerCase().includes('offence'));
    const f = FORMATIONS[formation] || FORMATIONS['4-3-3'];
    const used = new Set<string>();
    const pick = (arr: SquadPlayer[], n: number): SquadPlayer[] => {
      const out: SquadPlayer[] = [];
      for (const p of arr) {
        if (out.length >= n) break;
        if (used.has(String(p.id))) continue;
        used.add(String(p.id));
        out.push(p);
      }
      if (out.length < n) {
        for (const p of others) {
          if (out.length >= n) break;
          if (used.has(String(p.id))) continue;
          used.add(String(p.id));
          out.push(p);
        }
      }
      return out;
    };
    const gk = gks[0];
    if (gk) used.add(String(gk.id));
    const lDef = pick(defs, f.def);
    const lMid = pick(mids, f.mid);
    const lOff = pick(offs, f.off);
    const stripe = (arr: SquadPlayer[], y: number) =>
      arr.map((p, i) => ({
        p, x: 14 + (arr.length > 1 ? i * (72 / (arr.length - 1)) : 0), y,
      }));
    const spots = [
      ...stripe(lDef, 72),
      ...stripe(lMid, 52),
      ...stripe(lOff, 32),
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="fc-card">
          <div className="fc-section-head">
            <span className="fc-section-title">Formation · {formation}</span>
            <span className="fc-pill soon">{team?.name}</span>
          </div>
          <div className="fc-form-row" style={{ padding: '6px 12px' }}>
            {Object.keys(FORMATIONS).map(k => (
              <button key={k} className={`fc-form-chip${formation === k ? ' active' : ''}`} onClick={() => { haptic(); setFormation(k); }}>
                {k}
              </button>
            ))}
          </div>
          <div className="fc-pitch">
            <div className="fc-pitch-stripes" />
            <div className="fc-pitch-line-c" />
            <div className="fc-pitch-line-m" />
            <div className="fc-pitch-box" />
            {gk && (
              <div className="fc-player" style={{ left: '50%', top: '88%', background: ROLE_COLOR.Goalkeeper, color: '#fff' }}
                title={`${gk.name} · GK`} onClick={() => showSquadDetail(gk)}>
                {shirtNo(gk.id)}
              </div>
            )}
            {spots.map(({ p, x, y }) => (
              <div key={p.id} className="fc-player"
                style={{ left: `${x}%`, top: `${y}%`, background: ROLE_COLOR[p.position || 'Offence'] || '#22C55E', color: '#000' }}
                title={`${p.name} · ${p.position || ''}`} onClick={() => showSquadDetail(p)}>
                {shirtNo(p.id)}
              </div>
            ))}
          </div>
          <div className="fc-odds-note" style={{ fontFamily: C.mono }}>
            {lDef.length} DEF · {lMid.length} MID · {lOff.length} FWD + 1 GK · tap a shirt to inspect
          </div>
        </div>
        <div className="fc-card">
          <div className="fc-section-head"><span className="fc-section-title">Squad selector</span></div>
          <div className="fc-squad">
            {pool.slice(0, 22).map(p => (
              <div key={p.id} className="fc-pos-row" onClick={() => showSquadDetail(p)}>
                <div className="fc-pos-gap">
                  <span className="fc-pos-av">{initials(p.name)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="fc-pos-name">{p.name}</div>
                    <div className="fc-pos-meta">{p.position || 'Player'} · {p.nationality || '—'}</div>
                  </div>
                </div>
                <span className="fc-pos-tag">{posAbbr(p.position)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const showSquadDetail = (p: SquadPlayer) => {
    try {
      const short = (p.nationality || '?') ? `${p.position || 'Player'} · ${p.nationality}` : p.position || 'Player';
      tg?.showAlert ? tg.showAlert(`${p.name} — ${short}`) : alert(`${p.name} — ${short}`);
    } catch (_) {}
    haptic();
  };
const renderVirtualsTab = (m: CalendarMatch | undefined): React.ReactNode => {
    if (!m) return noMatchCard('Virtuals');
    const est = estimateOdds(m);
    const oddsOf = pickedOutcome === '1' ? est.home : pickedOutcome === 'X' ? est.draw : est.away;
    const stakeNum = Math.max(1, parseInt(stake, 10) || 1);
    const potential = Math.round(stakeNum * oddsOf * 100) / 100;
    const outcomeLabel = (o: '1' | 'X' | '2') =>
      o === '1' ? `1 · ${m.homeTeam?.shortName || m.homeTeam?.name}` :
        o === 'X' ? 'X · Draw' : `2 · ${m.awayTeam?.shortName || m.awayTeam?.name}`;

    const placeTrade = () => {
      const bet: VirtualBet = {
        id: `vt-${Date.now()}`,
        matchId: m.id,
        label: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
        outcome: pickedOutcome,
        stake: stakeNum,
        odds: oddsOf,
        potential,
        createdAt: new Date().toISOString(),
      };
      setVirtuals(prev => [bet, ...prev]);
      try { tg?.HapticFeedback?.notificationOccurred('success'); } catch (_) {}
    };
    const settleTrade = (id: string, won: boolean) => {
      setVirtuals(prev => prev.map(t => t.id === id ? { ...t, settled: true, won } : t));
      haptic();
    };
    const totalStaked = virtuals.reduce((s, t) => s + t.stake, 0);
    const totalPotential = virtuals.reduce((s, t) => s + (t.settled && t.won ? t.potential : t.settled ? 0 : t.potential), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="fc-card">
          <div className="fc-section-head">
            <span className="fc-section-title">Virtuals · match trading</span>
            <span className="fc-pill soon">FTC</span>
          </div>
          <div className="fc-odds-note">
            {m.homeTeam?.name} vs {m.awayTeam?.name} · predict &amp; trade the virtual outcome.
          </div>
          <div className="fc-vir-out">
            <div className={`fc-vir-out-cell${pickedOutcome === '1' ? ' sel' : ''}`} onClick={() => { setPickedOutcome('1'); haptic(); }}>
              <span className="fc-odds-val">1</span>
              <span className="fc-odds-name">{m.homeTeam?.shortName || m.homeTeam?.name}</span>
            </div>
            <div className={`fc-vir-out-cell${pickedOutcome === 'X' ? ' sel' : ''}`} onClick={() => { setPickedOutcome('X'); haptic(); }}>
              <span className="fc-odds-val">X</span>
              <span className="fc-odds-name">Draw</span>
            </div>
            <div className={`fc-vir-out-cell${pickedOutcome === '2' ? ' sel' : ''}`} onClick={() => { setPickedOutcome('2'); haptic(); }}>
              <span className="fc-odds-val">2</span>
              <span className="fc-odds-name">{m.awayTeam?.shortName || m.awayTeam?.name}</span>
            </div>
          </div>
          <div className="fc-stake-row" style={{ marginTop: 10 }}>
            <input className="fc-stake-input" type="number" min="1" step="1" value={stake}
              onChange={(e) => setStake(e.target.value)} aria-label="Stake in FTC" />
            <span style={{ fontFamily: C.mono, fontSize: 10.5, color: 'rgba(255,255,255,.68)', whiteSpace: 'nowrap' }}>
              @ {oddsOf} <IcoArrowRight className="w-3 h-3" /> ~{potential} FTC
            </span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="fc-vir-btn" onClick={placeTrade}><IcoArrowRight className="w-3.5 h-3.5" /> Place virtual trade</button>
          </div>
        </div>

        <div className="fc-card">
          <div className="fc-section-head">
            <span className="fc-section-title">Open &amp; settled trades</span>
            <span className="fc-pill soon">{virtuals.length}</span>
          </div>
          {virtuals.length === 0 ? (
            <div className="fc-odds-note" style={{ textAlign: 'center' }}>
              No virtual trades yet. Predict the result and stake some FTC.
            </div>
          ) : (
            virtuals.map(t => (
              <div key={t.id} className="fc-vir-trade">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fc-pos-name">{t.label}</div>
                  <div className="fc-pos-meta">{t.outcome} @ {t.odds} · {t.stake} FTC · {t.settled ? (t.won ? 'WON' : 'VOID') : 'OPEN'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{ color: C.green, fontWeight: 800, fontFamily: C.mono, fontSize: 12 }}>±{t.potential}</span>
                  {!t.settled ? (
                    <button className="fc-filter" onClick={() => settleTrade(t.id, true)}><IcoCheck className="w-3 h-3" /> Settle</button>
                  ) : (
                    <span className="fc-pos-tag">{t.won ? 'WON' : 'VOID'}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="fc-vir-sum">
          <span>PORTFOLIO · {virtuals.length} TRADES</span>
          <span>STAKED {totalStaked} · RETURN {Math.round(totalPotential * 100) / 100} FTC</span>
        </div>
      </div>
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="fc-root">
      <style>{FC_STYLES}</style>
      {renderHero()}
      {renderTabs()}
      <div className="fc-body">
        {tab === 'match' && renderMatchTab()}
        {tab === 'odds' && renderOddsTab(selectedMatch)}
        {tab === 'lineup' && renderLineupTab(selectedMatch)}
        {tab === 'formation' && renderFormationTab(selectedMatch)}
        {tab === 'virtuals' && renderVirtualsTab(selectedMatch)}
      </div>
    </div>
  );
};

export default FootballCalendarScreen;
import React, { useMemo, useState } from 'react';

interface MarketplaceScreenProps {
  onNotify: () => void;
  onBack: () => void;
}

/* ============================================================
   MARKETPLACE — Official Club Merchandise & Digital Collectibles
   Frontend mockup only: currency filter + FTC pricing are local state.
   ============================================================ */

/* ---------- mock currency engine (no backend) ---------- */
interface Currency { code: string; symbol: string; name: string; perNgn: number; }
const CURRENCIES: Currency[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', perNgn: 1 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', perNgn: 0.0077 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', perNgn: 0.084 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', perNgn: 0.0115 },
  { code: 'GBP', symbol: '£', name: 'British Pound', perNgn: 0.00049 },
  { code: 'EUR', symbol: '€', name: 'Euro', perNgn: 0.00057 },
  { code: 'USD', symbol: '$', name: 'US Dollar', perNgn: 0.00062 },
];
const FTC_PER_NGN = 1 / 1500;

const img = (id: string, w: number) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const PALACE_BADGE = 'https://media.api-sports.io/football/teams/52.png';
const PALACE_JERSEY = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNrH5qMnWdaWP6MVW6oRNTQt9L1o9qg4ah84mEPI6q4FGdwuZgYC7tOQmfl78KFUtolP7mhB3YlR43y0zlEv_WcGBF7gYDezh1v67YIeyozYK9QJ98qLrmPLzJgJd0rW4q-ge2TYNkLXFmDCkY4O_r3QdwD7I3D1HO2YCoTgcpOGn15LXDzGyACSeH6L7R/s1000/palace-25-26-home-kit%20%284%29.jpg';

/* ---------- vendor logos (verified live) ---------- */
const LOGOS: Record<string, string> = {
  'Nike Football': 'https://images.seeklogo.com/logo-png/9/1/nike-logo-png_seeklogo-99478.png',
  'adidas Football': 'https://image.shutterstock.com/image-photo/image-260nw-2723017555.jpg',
  'Puma Football': 'https://cdn.worldvectorlogo.com/logos/puma.svg',
  'JD Sports': 'https://cdn.worldvectorlogo.com/logos/jd-sports.svg',
  'Official Club Store': PALACE_BADGE,
};

/* ---------- tiny inline icons ---------- */
const Ico: React.FC<{ d: string; className?: string; fill?: string }> = ({ d, className = 'w-4 h-4', fill = 'none' }) => (
  <svg className={className} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const IcoSearch = ({ className }: { className?: string }) => <Ico className={className} d="M21 21l-5.2-5.2M16.8 10.4a6.4 6.4 0 11-12.8 0 6.4 6.4 0 0112.8 0z" />;
const IcoFilter = ({ className }: { className?: string }) => <Ico className={className} d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h10M18 17h2M14 5v4M6 10v4M14 15v4" />;
const IcoChevron = ({ className }: { className?: string }) => <Ico className={className} d="M9 5l7 7-7 7" />;
const IcoCart = ({ className }: { className?: string }) => <Ico className={className} d="M4 5h2l2.2 10.2a1.6 1.6 0 001.6 1.3h6.9a1.6 1.6 0 001.6-1.2L20 8H7M10 20.5h.01M17 20.5h.01" />;
const IcoShield = ({ className }: { className?: string }) => <Ico className={className} d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />;
const IcoStore = ({ className }: { className?: string }) => <Ico className={className} d="M4 10l1-5h14l1 5M4 10v10h16V10M4 10c0 1.4 1.2 2.5 2.7 2.5S9.3 11.4 9.3 10c0 1.4 1.2 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1.2 2.5 2.7 2.5S20 11.4 20 10M9 20v-5h6v5" />;
const IcoShirt = ({ className }: { className?: string }) => <Ico className={className} d="M8 4l4 2 4-2 4 3-2.2 2.8L16 8.6V20H8V8.6L6.2 9.8 4 7l4-3zM10 4c0 1.4.9 2.5 2 2.5S14 5.4 14 4" />;
const IcoBoot = ({ className }: { className?: string }) => <Ico className={className} d="M3 16V7h2l1.5 5H13l2.5 2h3c1.4 0 2.5 1.1 2.5 2.5V18H3v-2zM3 16h18" />;
const IcoGem = ({ className }: { className?: string }) => <Ico className={className} d="M7 4h10l4 5-9 11L3 9l4-5zM3 9h18M9.5 4L7 9l5 11M14.5 4L17 9l-5 11" />;
const IcoStar = ({ className }: { className?: string }) => <Ico className={className} d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8L12 3z" />;
const IcoBag = ({ className }: { className?: string }) => <Ico className={className} d="M6 8h12l1 12H5L6 8zM9 10V6a3 3 0 016 0v4" />;
const IcoGrid = ({ className }: { className?: string }) => <Ico className={className} d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />;
const IcoArrow = ({ className }: { className?: string }) => <Ico className={className} d="M4 12h15M13 6l6 6-6 6" />;
const IcoClose = ({ className }: { className?: string }) => <Ico className={className} d="M6 6l12 12M18 6L6 18" />;
const IcoCoin = ({ className }: { className?: string }) => <Ico className={className} d="M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM12 7.5v9M9.8 9.6h3.4a1.9 1.9 0 010 3.8H9.8" />;
const IcoVerified = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2l2.2 1.9 2.9-.3.9 2.7 2.6 1.2-.6 2.8 1.8 2.2-1.9 2.2.3 2.9-2.7.9-1.2 2.6-2.8-.6L12 22.6l-2.2-1.9-2.9.3-.9-2.7-2.6-1.2.6-2.8L2.2 12l1.9-2.2-.3-2.9 2.7-.9L7.7 3.4l2.8.6L12 2.2zm-1.3 13.4l5-5-1.5-1.5-3.5 3.5-1.7-1.7-1.5 1.5 3.2 3.2z" /></svg>
);

/* ---------- data (mock) ---------- */
type CatId = 'all' | 'clubs' | 'vendors' | 'jerseys' | 'boots' | 'collectibles' | 'gear' | 'accessories';
const CATEGORIES: { id: CatId; label: string; Ico: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All', Ico: IcoGrid },
  { id: 'clubs', label: 'Official Clubs', Ico: IcoShield },
  { id: 'vendors', label: 'Vendors', Ico: IcoStore },
  { id: 'jerseys', label: 'Jerseys', Ico: IcoShirt },
  { id: 'boots', label: 'Boots', Ico: IcoBoot },
  { id: 'collectibles', label: 'Collectibles', Ico: IcoGem },
  { id: 'gear', label: 'Fan Gear', Ico: IcoStar },
  { id: 'accessories', label: 'Accessories', Ico: IcoBag },
];

const VENDORS = [
  { name: 'Nike Football', mono: 'N', tint: 'bg-white', products: '2.4k' },
  { name: 'adidas Football', mono: 'A', tint: 'bg-white', products: '1.8k' },
  { name: 'Puma Football', mono: 'P', tint: 'bg-white', products: '1.5k' },
  { name: 'Fanatics', mono: 'F', tint: 'bg-[#f59e0b]/20', products: '1.2k' },
  { name: 'JD Sports', mono: 'JD', tint: 'bg-white', products: '980' },
  { name: 'Official Club Store', mono: 'FC', tint: 'bg-white', products: '450' },
];

interface Product {
  name: string; vendor: string; sub: string; priceNgn: number;
  image: string; badge: string; badgeTint: string; cat: 'jerseys' | 'boots' | 'collectibles' | 'gear' | 'accessories';
}
const PRODUCTS: Product[] = [
  { name: 'Crystal Palace 25/26 Home Jersey', vendor: 'Official Club Store', sub: 'Official Club Merchandise', priceNgn: 85000, image: PALACE_JERSEY, badge: 'OFFICIAL', badgeTint: 'bg-green-500 text-black', cat: 'jerseys' },
  { name: 'Nike Mercurial Vapor 16 FG', vendor: 'Nike Football', sub: 'Verified Vendor', priceNgn: 120000, image: img('1595950653106-6c9ebd614d3a', 500), badge: 'VERIFIED VENDOR', badgeTint: 'bg-[#4da3ff] text-black', cat: 'boots' },
  { name: 'adidas Predator Elite FG Boots', vendor: 'adidas Football', sub: 'Verified Vendor', priceNgn: 145000, image: img('1600185365483-26d7a4cc7519', 500), badge: 'VERIFIED VENDOR', badgeTint: 'bg-[#4da3ff] text-black', cat: 'boots' },
  { name: 'Palace 25/26 Away Jersey', vendor: 'Official Club Store', sub: 'Official Club Merchandise', priceNgn: 85000, image: img('1543326727-cf6c39e8f84c', 500), badge: 'OFFICIAL', badgeTint: 'bg-green-500 text-black', cat: 'jerseys' },
  { name: 'Pro Training Drill Jacket', vendor: 'Official Club Store', sub: 'Official Training Wear', priceNgn: 42000, image: img('1591047139829-d91aecb6caea', 500), badge: 'FOOT-COLLECT EXCLUSIVE', badgeTint: 'bg-[#f59e0b] text-black', cat: 'gear' },
  { name: 'Digital Twin 24/25 Jersey', vendor: 'Fanatics', sub: 'Digital Twin Collectible', priceNgn: 75000, image: img('1614632537190-23e4146777db', 500), badge: 'DIGITAL TWIN', badgeTint: 'bg-purple-500 text-black', cat: 'collectibles' },
  { name: 'Pro Match Ball', vendor: 'Puma Football', sub: 'FIFA Quality Pro Ball', priceNgn: 35000, image: img('1579952363873-27f3bade9f55', 500), badge: 'NEW DROP', badgeTint: 'bg-green-500 text-black', cat: 'accessories' },
  { name: 'Retro Matchday Tee', vendor: 'Fanatics', sub: 'Fan Gear', priceNgn: 28000, image: img('1576566588028-4147f3842f27', 500), badge: 'FAN FAVOURITE', badgeTint: 'bg-white/90 text-black', cat: 'gear' },
  { name: 'Keeper Grip Goalkeeper Gloves', vendor: 'adidas Football', sub: 'Matchday Equipment', priceNgn: 32000, image: img('1613977257363-707ba9348227', 500), badge: 'OFFICIAL', badgeTint: 'bg-green-500 text-black', cat: 'accessories' },
  { name: 'Pitchside Snapback Cap', vendor: 'JD Sports', sub: 'Matchday Accessories', priceNgn: 18000, image: img('1521369909029-2afed882baee', 500), badge: 'FAN FAVOURITE', badgeTint: 'bg-white/90 text-black', cat: 'accessories' },
];

const CLUB_CHIPS = [
  { name: 'Crystal Palace', badge: PALACE_BADGE },
  { name: 'Chelsea', badge: 'https://media.api-sports.io/football/teams/49.png' },
  { name: 'Liverpool', badge: 'https://media.api-sports.io/football/teams/40.png' },
  { name: 'Man City', badge: 'https://media.api-sports.io/football/teams/50.png' },
  { name: 'Man United', badge: 'https://media.api-sports.io/football/teams/33.png' },
  { name: 'Tottenham', badge: 'https://media.api-sports.io/football/teams/47.png' },
];

/* ---------- FTC utility (rendered on the wallet/balance page) ---------- */
export const FtcUtilityCard: React.FC = () => {
  const cases = [
    { t: 'Buy Official Jerseys', d: 'Use FTC to get home, away, and special-edition kits.', I: IcoShirt },
    { t: 'Shop Sport Gear & Merchandise', d: 'Boots, training kits, scarves, caps, fan gear.', I: IcoBag },
    { t: 'Pay for Match-Day Tickets', d: 'Use FTC to book and pay for stadium tickets.', I: IcoStore },
    { t: 'Unlock Exclusive Fan Rewards', d: 'VIP experiences, signed merch, meet-and-greets, limited drops.', I: IcoStar },
    { t: 'Redeem Digital Collectibles & Fan Moments', d: 'Trade FTC for Digital Collectibles and Fan Moments in-app.', I: IcoGem },
  ];
  return (
    <div className="rounded-2xl border border-gray-800 bg-darkCard p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-600/15 text-green-400 ring-1 ring-green-500/30">
          <IcoCoin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">FTC Utility</p>
          <h3 className="text-xl font-black tracking-tight text-white">What Can You Do with FTC in the Foot-Collect Marketplace?</h3>
        </div>
      </div>
      <div className="space-y-3">
        {cases.map(({ t, d, I }) => (
          <div key={t} className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-darkDeep p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-600/10 text-green-300 ring-1 ring-green-500/20">
              <I className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black text-white">{t}</p>
              <p className="text-xs leading-relaxed text-gray-400">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-gray-800 pt-4">
        <p className="text-[11px] leading-relaxed text-gray-300">
          The more you engage, predict, vote, and participate in Foot-Collect, the more FTC you can earn and spend.
        </p>
      </div>
    </div>
  );
};

/* ============================================================
   MARKETPLACE SCREEN
   ============================================================ */
const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ onNotify }) => {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CatId>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('NGN');
  const [showFtc, setShowFtc] = useState(true);

  const cur = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const fmt = (ngn: number): string => {
    if (showFtc) {
      const ftc = ngn * FTC_PER_NGN;
      return ftc >= 100 ? `${Math.round(ftc).toLocaleString()} FTC` : `${ftc.toFixed(1)} FTC`;
    }
    const v = ngn * cur.perNgn;
    const vStr = v >= 100 ? Math.round(v).toLocaleString() : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${cur.symbol}${vStr}`;
  };

  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS;
    if (q) list = list.filter(p => `${p.name} ${p.vendor} ${p.sub}`.toLowerCase().includes(q));
    else if (cat !== 'all') {
      if (cat === 'clubs' || cat === 'vendors') list = list.filter(p => p.vendor === 'Official Club Store');
      else list = list.filter(p => p.cat === cat);
    }
    return list;
  }, [query, cat]);

  const showVendors = !searching && (cat === 'all' || cat === 'vendors');
  const showClubChips = !searching && (cat === 'all' || cat === 'clubs');

  const priceLabel = showFtc ? 'FTC' : cur.code;

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-10 duration-500 pb-6">
      {/* ===== Search + filter ===== */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2.5 rounded-full border border-gray-800 bg-darkDeep px-4 py-3">
          <IcoSearch className="h-4 w-4 shrink-0 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for clubs, products, vendors..."
            className="w-full bg-transparent text-[13px] text-white placeholder-gray-500 outline-none"
          />
          {searching && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-gray-500 hover:text-white">
              <IcoClose className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter(true)}
          aria-label="Currency & price filter"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 ${showFtc ? 'border-green-500/40 bg-green-600/15 text-green-400' : 'border-gray-800 bg-darkDeep text-gray-300'}`}
        >
          <IcoFilter className="h-4 w-4" />
        </button>
      </div>

      {/* ===== Category pills ===== */}
      <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
        {CATEGORIES.map(({ id, label, Ico: PI }) => (
          <button
            key={id}
            onClick={() => { setCat(id); setQuery(''); }}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
              cat === id ? 'border-green-500 bg-green-600 text-black' : 'border-gray-800 bg-darkCard text-gray-300'
            }`}
          >
            <PI className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ===== Hero banner (Crystal Palace) ===== */}
      {!searching && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-darkDeep">
            <img src={img('1517927033932-b3d18e61fb3a', 800)} alt="Club merchandise" className="absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent" />
            <div className="relative flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-base font-black leading-tight text-white" style={{ fontFamily: "'Oxanium', sans-serif" }}>OFFICIAL CLUB MERCHANDISE</p>
                <p className="mt-0.5 text-[10px] font-bold text-gray-300">Your club. Your colours.</p>
                <button
                  onClick={() => { setCat('clubs'); setQuery(''); }}
                  className="mt-3 flex items-center gap-1.5 rounded-full bg-green-600 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-black active:scale-95"
                >
                  Shop Now <IcoArrow className="h-3 w-3" />
                </button>
              </div>
              <div className="flex shrink-0 items-center pr-1">
                {['https://media.api-sports.io/football/teams/52.png', 'https://media.api-sports.io/football/teams/49.png', 'https://media.api-sports.io/football/teams/40.png'].map((b, i) => (
                  <img
                    key={b}
                    src={b}
                    alt="Official club"
                    loading="lazy"
                    className={`h-12 w-12 rounded-full border border-white/15 bg-white/10 object-contain p-1 ${i > 0 ? '-ml-4' : ''}`}
                    style={{ zIndex: 3 - i }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-gray-800 bg-darkCard px-4 py-3">
            <div>
              <p className="text-[11px] font-black text-white" style={{ fontFamily: "'Oxanium', sans-serif" }}>Top Brands</p>
              <p className="text-[9px] font-bold text-gray-400">Trusted Vendors</p>
            </div>
            <div className="flex items-center gap-2">
              {VENDORS.slice(0, 3).map(v => (
                <span key={v.name} className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-gray-700 ${LOGOS[v.name] ? 'bg-white' : `border-gray-800 ${v.tint}`}`}>
                  {LOGOS[v.name]
                    ? <img src={LOGOS[v.name]} alt={v.name} className="h-full w-full object-contain p-1" loading="lazy" />
                    : <span className="text-[9px] font-black text-white">{v.mono}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Featured vendors ===== */}
      {showVendors && (
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Featured Vendors</p>
            <span className="flex items-center gap-0.5 text-[10px] text-green-500 font-black uppercase tracking-widest">View All <IcoChevron className="h-3 w-3" /></span>
          </div>
          <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-1">
            {VENDORS.map(v => {
              const logo = LOGOS[v.name];
              return (
                <div key={v.name} className="w-[110px] shrink-0 rounded-2xl border border-gray-800 bg-darkCard p-3">
                  <div className={`mb-2 flex h-12 w-full items-center justify-center rounded-xl overflow-hidden ${v.tint}`}>
                    {logo ? (
                      <img src={logo} alt={v.name} className="h-full w-full object-contain p-1.5" loading="lazy" />
                    ) : (
                      <span className="text-sm font-black text-white">{v.mono}</span>
                    )}
                  </div>
                  <p className="truncate text-[11px] font-black text-white">{v.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-green-400">
                    <IcoVerified className="h-3 w-3" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Verified</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[8px] font-bold text-gray-500">
                    <span>{v.products} products</span>
                    <IcoChevron className="h-2.5 w-2.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Trending / results ===== */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">{searching ? `Results (${results.length})` : 'Trending Products'}</p>
          <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Prices in {priceLabel}</span>
        </div>
        {results.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-darkCard p-8 text-center">
            <IcoSearch className="mx-auto mb-2 h-6 w-6 text-gray-600" />
            <p className="text-sm font-black text-white">Nothing found</p>
            <p className="mt-1 text-xs text-gray-500">Try another club, product or vendor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map(p => (
              <div key={p.name} className="overflow-hidden rounded-2xl border border-gray-800 bg-darkCard">
                <div className="relative">
                  <img src={p.image} alt={p.name} className="h-36 w-full object-cover" loading="lazy" />
                  <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${p.badgeTint}`}>{p.badge}</span>
                </div>
                <div className="p-3">
                  <p className="truncate text-[12px] font-black leading-tight text-white">{p.name}</p>
                  <p className="mt-0.5 truncate text-[9px] font-bold text-gray-500">{p.sub}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[13px] font-black text-green-400" style={{ fontFamily: "'Oxanium', sans-serif" }}>{fmt(p.priceNgn)}</span>
                    <button
                      onClick={onNotify}
                      aria-label={`Add ${p.name} to cart`}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-green-500/30 bg-green-600/10 text-green-400 active:scale-90"
                    >
                      <IcoCart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Official club merchandise chips ===== */}
      {showClubChips && (
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Official Club Merchandise</p>
            <span className="flex items-center gap-0.5 text-[10px] text-green-500 font-black uppercase tracking-widest">View All <IcoChevron className="h-3 w-3" /></span>
          </div>
          <div className="no-scrollbar -mx-6 flex gap-2.5 overflow-x-auto px-6 pb-1">
            {CLUB_CHIPS.map(c => (
              <button key={c.name} onClick={() => { setQuery(c.name); setCat('all'); }} className="w-[74px] shrink-0 rounded-2xl border border-gray-800 bg-darkCard p-2.5 text-center active:scale-95">
                <img src={c.badge} alt={c.name} className="mx-auto h-10 w-10 rounded-full object-contain" loading="lazy" />
                <p className="mt-1.5 truncate text-[8px] font-black text-white">{c.name}</p>
              </button>
            ))}
            <div className="flex w-[74px] shrink-0 flex-col items-center justify-center rounded-2xl border border-gray-800 bg-darkCard p-2.5 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-darkDeep text-base font-black tracking-widest text-gray-400">...</span>
              <p className="mt-1.5 text-[8px] font-black text-gray-400">More Clubs</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Currency / FTC filter modal ===== */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowFilter(false)}>
          <div className="w-full max-w-md rounded-t-3xl border border-gray-800 bg-darkCard p-5 pb-8 animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Oxanium', sans-serif" }}>Price Display</h3>
              <button onClick={() => setShowFilter(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-darkDeep text-gray-400">
                <IcoClose className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFtc(true)}
              className={`mb-3 flex w-full items-center justify-between rounded-2xl border p-4 ${showFtc ? 'border-green-500/50 bg-green-600/10' : 'border-gray-800 bg-darkDeep'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${showFtc ? 'bg-green-600 text-black' : 'bg-darkCard text-gray-400'}`}>
                  <IcoCoin className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white">Show prices in FTC</p>
                  <p className="text-[10px] text-gray-500">Mock rate: 1 FTC = 1,500 NGN</p>
                </div>
              </div>
              {showFtc && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-black">
                  <Ico className="h-3 w-3" d="M4.5 12.5l4.8 4.8L19.5 6.5" />
                </span>
              )}
            </button>

            <p className="mb-2 mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Or use your country's currency</p>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {CURRENCIES.map(c => {
                const active = !showFtc && c.code === currencyCode;
                return (
                  <button
                    key={c.code}
                    onClick={() => { setShowFtc(false); setCurrencyCode(c.code); }}
                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 ${active ? 'border-green-500/50 bg-green-600/10' : 'border-gray-800 bg-darkDeep'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 text-center text-sm font-black text-white">{c.symbol}</span>
                      <div className="text-left">
                        <p className="text-[13px] font-black text-white">{c.code}</p>
                        <p className="text-[10px] text-gray-500">{c.name}</p>
                      </div>
                    </div>
                    {active && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-black">
                        <Ico className="h-3 w-3" d="M4.5 12.5l4.8 4.8L19.5 6.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-[9px] leading-relaxed text-gray-600">
              Currency conversion is a preview mockup — live FX rates arrive with checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceScreen;





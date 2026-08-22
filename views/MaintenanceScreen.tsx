import React, { useEffect, useMemo, useState } from 'react';
import footnftLogo from '../src/assets/footnft_logo.png';

type MaintenanceStar = {
  id: number;
  left: string;
  top: string;
  fontSize: string;
  delay: string;
};

const MAINTENANCE_DURATION_SECONDS = 72 * 60 * 60;

const MaintenanceScreen: React.FC = () => {
  const [remainingSeconds, setRemainingSeconds] = useState(MAINTENANCE_DURATION_SECONDS);

  const stars = useMemo<MaintenanceStar[]>(() =>
    Array.from({ length: 22 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${8 + Math.random() * 10}px`,
      delay: `${Math.random() * 3.5}s`,
    })),
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds(previous => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeUnits = [
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ];

  return (
    <main className="maintenance-screen">
      <div className="maintenance-background" aria-hidden="true">
        <div className="maintenance-facet maintenance-facet-one" />
        <div className="maintenance-facet maintenance-facet-two" />
        <div className="maintenance-facet maintenance-facet-three" />
        <div className="maintenance-facet maintenance-facet-four" />
        <div className="maintenance-shard maintenance-shard-one" />
        <div className="maintenance-shard maintenance-shard-two" />
        <div className="maintenance-sheen" />
        <div className="maintenance-grain" />
        <div className="maintenance-stars">
          {stars.map(star => (
            <span
              key={star.id}
              className="maintenance-star"
              style={{
                left: star.left,
                top: star.top,
                fontSize: star.fontSize,
                animationDelay: star.delay,
              }}
            >
              *
            </span>
          ))}
        </div>
      </div>

      <section className="maintenance-content" aria-labelledby="maintenance-title">
        <div className="maintenance-logo-wrap">
          <img src={footnftLogo} alt="FOOT NFTs logo" className="maintenance-logo" />
        </div>
        <p className="maintenance-eyebrow">FOOT NFTs</p>
        <h1 id="maintenance-title">Server Maintenance</h1>
        <p className="maintenance-message">We are making improvements to serve you better.</p>

        <div className="maintenance-card" aria-label="Maintenance countdown">
          {timeUnits.map(unit => (
            <div className="maintenance-time-unit" key={unit.label}>
              <span className="maintenance-time-value">{String(unit.value).padStart(2, '0')}</span>
              <span className="maintenance-time-label">{unit.label}</span>
            </div>
          ))}
        </div>

        <p className="maintenance-status">Back on the pitch soon</p>
      </section>

      <footer className="maintenance-footer">FOOT NFTs</footer>

      <style>{`
        .maintenance-screen {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: #fff;
          background: radial-gradient(120% 90% at 50% -10%, #14257a 0%, transparent 55%), radial-gradient(90% 70% at 100% 110%, #071233 0%, transparent 60%), linear-gradient(160deg, #050b1f 0%, #0a1440 45%, #0c1c52 75%, #071233 100%);
          font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
          z-index: 100;
        }
        .maintenance-background,
        .maintenance-stars {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .maintenance-facet {
          position: absolute;
          background: linear-gradient(135deg, rgba(53,232,255,0.10), rgba(47,95,224,0.04) 60%, transparent);
          border: 1px solid rgba(120,170,255,0.14);
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }
        .maintenance-facet-one { width: 520px; height: 520px; top: -160px; left: -140px; transform: rotate(12deg); opacity: .55; }
        .maintenance-facet-two { width: 380px; height: 380px; top: 55%; left: -120px; transform: rotate(-18deg); opacity: .4; }
        .maintenance-facet-three { width: 640px; height: 640px; top: -220px; right: -220px; transform: rotate(-8deg); opacity: .5; }
        .maintenance-facet-four { width: 420px; height: 420px; bottom: -180px; right: -80px; transform: rotate(22deg); opacity: .45; }
        .maintenance-shard { position: absolute; background: linear-gradient(120deg, rgba(255,255,255,0.05), transparent 70%); clip-path: polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%); }
        .maintenance-shard-one { width: 220px; height: 900px; top: -100px; left: 12%; transform: rotate(18deg); opacity: .12; }
        .maintenance-shard-two { width: 160px; height: 900px; top: -200px; right: 22%; transform: rotate(-14deg); opacity: .10; }
        .maintenance-sheen { position: absolute; inset: -20%; background: conic-gradient(from 210deg at 50% 45%, transparent 0deg, rgba(53,232,255,0.08) 40deg, transparent 90deg, transparent 300deg, rgba(120,140,255,0.06) 340deg, transparent 360deg); animation: maintenance-rotate-sheen 22s linear infinite; }
        .maintenance-grain { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 3px 3px; opacity: .5; mix-blend-mode: overlay; }
        .maintenance-star { position: absolute; color: rgba(255,255,255,0.55); animation: maintenance-twinkle 3.5s ease-in-out infinite; }
        .maintenance-content { position: relative; z-index: 1; width: min(92vw, 560px); padding: 32px 20px 64px; text-align: center; animation: maintenance-fade-in 700ms ease-out both; }
        .maintenance-logo-wrap { width: 92px; height: 92px; margin: 0 auto 18px; animation: maintenance-float 4s ease-in-out infinite; }
        .maintenance-logo { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 0 0 4px rgba(255,255,255,0.06), 0 0 28px rgba(255,120,40,0.28); }
        .maintenance-eyebrow { margin: 0 0 16px; color: #35e8ff; font-size: 12px; font-weight: 700; letter-spacing: .42em; text-transform: uppercase; }
        .maintenance-content h1 { margin: 0; color: #fff; font-family: 'Anton', Impact, sans-serif; font-size: clamp(38px, 8vw, 66px); font-weight: 400; letter-spacing: .02em; line-height: .98; text-shadow: 0 0 40px rgba(53,232,255,0.25); }
        .maintenance-message { max-width: 360px; margin: 18px auto 30px; color: rgba(226,232,240,.78); font-size: 18px; line-height: 1.35; }
        .maintenance-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; padding: 1px; overflow: hidden; border: 1px solid rgba(53,232,255,.25); border-radius: 16px; background: rgba(53,232,255,.18); box-shadow: 0 16px 50px rgba(0,0,0,.25), 0 0 30px rgba(53,232,255,.08); backdrop-filter: blur(14px); }
        .maintenance-time-unit { min-width: 0; padding: 22px 8px 18px; background: rgba(7,18,51,.78); }
        .maintenance-time-value { display: block; color: #fff; font-family: 'Anton', Impact, sans-serif; font-size: clamp(32px, 9vw, 56px); line-height: 1; }
        .maintenance-time-label { display: block; margin-top: 10px; color: #35e8ff; font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
        .maintenance-status { margin: 24px 0 0; color: rgba(226,232,240,.5); font-size: 12px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; }
        .maintenance-footer { position: absolute; right: 0; bottom: 20px; left: 0; z-index: 1; color: rgba(226,232,240,.42); font-family: 'Anton', Impact, sans-serif; font-size: 16px; letter-spacing: .3em; text-align: center; }
        @keyframes maintenance-fade-in { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes maintenance-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes maintenance-rotate-sheen { to { transform: rotate(360deg); } }
        @keyframes maintenance-twinkle { 0%, 100% { opacity: .15; } 50% { opacity: .75; } }
        @media (max-height: 650px) { .maintenance-content { padding-top: 12px; padding-bottom: 42px; transform: scale(.86); } .maintenance-logo-wrap { width: 70px; height: 70px; margin-bottom: 10px; } .maintenance-message { margin: 12px auto 18px; } }
      `}</style>
    </main>
  );
};

export default MaintenanceScreen;

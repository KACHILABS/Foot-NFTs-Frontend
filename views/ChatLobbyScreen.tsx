import React from 'react';
import Card from '../components/Card';
import { Club } from '../types';
import { CLUBS } from '../constants';

interface ChatLobbyScreenProps {
  onJoinChat: (club: Club) => void;
  onEnterGlobalHall: () => void;
}

const ChatLobbyScreen: React.FC<ChatLobbyScreenProps> = ({ onJoinChat, onEnterGlobalHall }) => {
  return (
    <div className="chat-lobby-root">
      <style>{CHAT_LOBBY_STYLES}</style>
      
      <div className="chat-lobby-header">
        <h2 className="chat-lobby-title">Digital Terraces</h2>
        <p className="chat-lobby-subtitle">Join any club's chatroom to discuss tactics, transfers, and matchday drama.</p>
      </div>

      <div className="chat-lobby-clubs">
        {CLUBS.map((club, index) => (
          <div 
            key={club.id} 
            className="chat-lobby-club-card"
            onClick={() => onJoinChat(club)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="chat-lobby-club-info">
              <div className="chat-lobby-club-badge">
                <img src={club.badge} alt={club.name} />
              </div>
              <div>
                <h3 className="chat-lobby-club-name">{club.name}</h3>
                <div className="chat-lobby-club-status">
                  <div className="chat-lobby-online-dot" />
                  <span>{(club.fanCount / 10).toFixed(0)} Fans Online</span>
                </div>
              </div>
            </div>
            
            <div className="chat-lobby-club-action">
              <div className="chat-lobby-activity">
                <span>Activity</span>
                <div className="chat-lobby-activity-bars">
                  <div className="chat-lobby-bar high" />
                  <div className="chat-lobby-bar high" />
                  <div className="chat-lobby-bar high" />
                  <div className="chat-lobby-bar low" />
                </div>
              </div>
              <div className="chat-lobby-join-btn">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Banter Hall Card */}
      <div className="chat-lobby-global" onClick={onEnterGlobalHall}>
        <div className="chat-lobby-global-content">
          <span className="chat-lobby-global-badge">Neutral Grounds</span>
          <h4 className="chat-lobby-global-title">Global Banter Hall</h4>
          <p className="chat-lobby-global-text">Discuss neutral football topics and earn FTC tokens for high-quality engagement.</p>
          <button className="chat-lobby-global-btn">
            Enter Global Hall →
          </button>
        </div>
        <div className="chat-lobby-global-glow" />
      </div>
    </div>
  );
};

const CHAT_LOBBY_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap');

  .chat-lobby-root {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 16px 16px 24px;
    background: transparent;
    animation: fadeIn 0.5s ease;
  }

  /* Header */
  .chat-lobby-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .chat-lobby-title {
    font-family: 'Oxanium', sans-serif;
    font-weight: 800;
    font-size: 22px;
    color: #fff;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .chat-lobby-subtitle {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
    line-height: 1.4;
  }

  /* Clubs Container */
  .chat-lobby-clubs {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Club Card */
  .chat-lobby-club-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(17, 24, 39, 0.6);
    backdrop-filter: blur(8px);
    border: 1px solid #1f2937;
    border-radius: 20px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: slideUp 0.4s ease forwards;
    opacity: 0;
    transform: translateY(10px);
  }
  .chat-lobby-club-card:hover {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
    transform: translateY(-2px);
  }

  /* Club Info */
  .chat-lobby-club-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .chat-lobby-club-badge {
    width: 48px;
    height: 48px;
    background: #1f2937;
    border-radius: 16px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  .chat-lobby-club-card:hover .chat-lobby-club-badge {
    background: #374151;
  }
  .chat-lobby-club-badge img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .chat-lobby-club-name {
    font-family: 'Oxanium', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #fff;
    margin: 0 0 4px 0;
  }
  .chat-lobby-club-status {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .chat-lobby-online-dot {
    width: 6px;
    height: 6px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }
  .chat-lobby-club-status span {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Club Action */
  .chat-lobby-club-action {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .chat-lobby-activity {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .chat-lobby-activity span {
    font-family: 'Space Mono', monospace;
    font-size: 7px;
    font-weight: 700;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .chat-lobby-activity-bars {
    display: flex;
    gap: 3px;
    align-items: flex-end;
  }
  .chat-lobby-bar {
    width: 3px;
    background: #22c55e;
    border-radius: 2px;
  }
  .chat-lobby-bar.high {
    height: 12px;
  }
  .chat-lobby-bar.low {
    height: 6px;
    background: #4b5563;
  }
  .chat-lobby-join-btn {
    width: 36px;
    height: 36px;
    background: #22c55e;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    transition: all 0.2s ease;
  }
  .chat-lobby-club-card:hover .chat-lobby-join-btn {
    transform: scale(1.05);
    background: #16a34a;
  }

  /* Global Banter Hall Card */
  .chat-lobby-global {
    position: relative;
    background: linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(17,24,39,0.6) 100%);
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: 24px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    margin-top: 8px;
  }
  .chat-lobby-global:hover {
    border-color: #22c55e;
    transform: translateY(-2px);
  }
  .chat-lobby-global-content {
    position: relative;
    z-index: 2;
  }
  .chat-lobby-global-badge {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    color: #22c55e;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    display: inline-block;
    margin-bottom: 8px;
  }
  .chat-lobby-global-title {
    font-family: 'Oxanium', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: #fff;
    margin: 0 0 8px 0;
  }
  .chat-lobby-global-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 12px;
    color: #9ca3af;
    margin: 0 0 16px 0;
    line-height: 1.4;
  }
  .chat-lobby-global-btn {
    width: 100%;
    padding: 12px;
    background: #22c55e;
    border: none;
    border-radius: 30px;
    font-family: 'Oxanium', sans-serif;
    font-weight: 800;
    font-size: 11px;
    color: #000;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .chat-lobby-global-btn:hover {
    background: #16a34a;
    transform: scale(0.98);
  }
  .chat-lobby-global-glow {
    position: absolute;
    bottom: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
    transition: all 0.3s ease;
  }
  .chat-lobby-global:hover .chat-lobby-global-glow {
    width: 160px;
    height: 160px;
    bottom: -50px;
    right: -50px;
    opacity: 0.8;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
`;

export default ChatLobbyScreen;
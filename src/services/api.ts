// src/services/api.ts

const API_BASE = 'https://footnfts.up.railway.app/api';

export const api = {
  // Auth
  auth: {
    login: async (telegramId: number | string, username: string, referralCode?: string) => {
      const res = await fetch(`${API_BASE}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          username,
          ...(referralCode ? { referralCode } : {}),
        }),
      });
      return res.json();
    }
  },
  
  // User
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
    },
    updateProfile: async (data: { displayName?: string; avatar?: string }) => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    claimWelcomeBonus: async (userId: string) => {
      const res = await fetch(`${API_BASE}/user/claim-welcome-bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return res.json();
    }
  },
  
  // Highlights (Voting)
  highlights: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/highlights`);
      return res.json();
    },
    vote: async (highlightId: string, userId: string) => {
      const res = await fetch(`${API_BASE}/highlights/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId, userId })
      });
      return res.json();
    }
  },
  
  // Trivia
  trivia: {
    getQuestion: async () => {
      const res = await fetch(`${API_BASE}/trivia/question`);
      return res.json();
    },
    submitAnswer: async (userId: string, questionId: string, answer: number) => {
      const res = await fetch(`${API_BASE}/trivia/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionId, answer })
      });
      return res.json();
    }
  },
  
  // Leaderboard
  leaderboard: {
    getTop: async () => {
      const res = await fetch(`${API_BASE}/leaderboard`);
      return res.json();
    }
  },
  
  // Jersey Day
  jersey: {
    select: async (userId: string, club: string, kitType: string) => {
      const res = await fetch(`${API_BASE}/jersey/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, club, kitType })
      });
      return res.json();
    }
  },
  
  // Banter Hall
  banter: {
    getFeed: async () => {
      const res = await fetch(`${API_BASE}/banter/feed`);
      return res.json();
    },
    createPost: async (userId: string, content: string, clubTag?: string) => {
      const res = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, clubTag })
      });
      return res.json();
    },
    vote: async (postId: string, voterId: string) => {
      const res = await fetch(`${API_BASE}/banter/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, voterId })
      });
      return res.json();
    }
  },
  
  // Referral
  referral: {
    claim: async (referralCode: string) => {
      const res = await fetch(`${API_BASE}/referral/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode })
      });
      return res.json();
    },
    getInfo: async () => {
      const res = await fetch(`${API_BASE}/referral/info`);
      return res.json();
    }
  }
};
// src/services/api.ts

import { getAuthToken } from '../utils/versionControl';

const API_BASE = 'https://footnfts.up.railway.app/api';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

export const api = {
  // Auth (stores session)
  auth: {
    login: async (telegramId: number, username?: string) => {
      const res = await fetch(`${API_BASE}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, username })
      });
      const data = await res.json();
      
      if (data.success) {
        // Store session
        const { setAuthSession } = await import('../utils/versionControl');
        setAuthSession(data.token, data.user.id);
        // Also store telegramId for profile requests
        localStorage.setItem('telegramId', telegramId.toString());
      }
      return data;
    },
    
    logout: async () => {
      const { clearAuthSession } = await import('../utils/versionControl');
      clearAuthSession();
      localStorage.removeItem('telegramId');
      return { success: true };
    }
  },
  
  // User Profile (all data from backend)
  user: {
    getProfile: async (telegramId?: number) => {
      // Get telegramId from param, localStorage, or use default
      const storedTelegramId = localStorage.getItem('telegramId');
      const finalTelegramId = telegramId || (storedTelegramId ? parseInt(storedTelegramId) : 123456789);
      
      const res = await fetch(`${API_BASE}/user/profile?telegramId=${finalTelegramId}`, {
        headers: headers()
      });
      return res.json();
    },
    
    updateProfile: async (data: { displayName?: string; avatar?: string }) => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    getBalance: async () => {
      const res = await fetch(`${API_BASE}/user/balance`, {
        headers: headers()
      });
      return res.json();
    },
    
    getTransactions: async () => {
      const res = await fetch(`${API_BASE}/user/transactions`, {
        headers: headers()
      });
      return res.json();
    },
    
    claimWelcomeBonus: async (userId: string) => {
      const res = await fetch(`${API_BASE}/user/claim-welcome-bonus`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId })
      });
      return res.json();
    }
  },
  
  // Trivia (questions from backend/Gemini)
  trivia: {
    getDailyQuestions: async () => {
      const res = await fetch(`${API_BASE}/trivia/daily`, {
        headers: headers()
      });
      return res.json();
    },
    
    submitAnswer: async (questionId: string, answer: number) => {
      const res = await fetch(`${API_BASE}/trivia/answer`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ questionId, answer })
      });
      return res.json();
    },
    
    getStatus: async () => {
      const res = await fetch(`${API_BASE}/trivia/status`, {
        headers: headers()
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
  
  // Highlights/Voting
  highlights: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/highlights`);
      return res.json();
    },
    
    vote: async (highlightId: string) => {
      const res = await fetch(`${API_BASE}/highlights/vote`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ highlightId })
      });
      return res.json();
    }
  },
  
  // Jersey Day
  jersey: {
    select: async (club: string, kitType: string) => {
      const res = await fetch(`${API_BASE}/jersey/select`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ club, kitType })
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
    
    createPost: async (content: string, clubTag?: string) => {
      const res = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ content, clubTag })
      });
      return res.json();
    },
    
    vote: async (postId: string) => {
      const res = await fetch(`${API_BASE}/banter/vote`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ postId })
      });
      return res.json();
    }
  },
  
  // Referral
  referral: {
    getInfo: async () => {
      const res = await fetch(`${API_BASE}/referral/info`, {
        headers: headers()
      });
      return res.json();
    },
    
    register: async (referralCode: string) => {
      const res = await fetch(`${API_BASE}/referral/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ referralCode })
      });
      return res.json();
    }
  }
};
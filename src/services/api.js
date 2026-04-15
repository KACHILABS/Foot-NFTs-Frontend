// src/services/api.js

const API_BASE = 'https://footnfts.up.railway.app/api';

export const api = {
  auth: {
    login: async (telegramId, username) => {
      const res = await fetch(`${API_BASE}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, username })
      });
      return res.json();
    }
  },
  
  user: {
    getProfile: async (telegramId) => {
      const res = await fetch(`${API_BASE}/user/profile?telegramId=${telegramId}`);
      return res.json();
    },
    getTransactions: async (userId) => {
      const res = await fetch(`${API_BASE}/user/transactions?userId=${userId}`);
      return res.json();
    }
  },
  
  leaderboard: {
    getTop: async () => {
      const res = await fetch(`${API_BASE}/leaderboard`);
      return res.json();
    }
  },
  
  trivia: {
    getQuestion: async () => {
      const res = await fetch(`${API_BASE}/trivia/question`);
      return res.json();
    },
    submitAnswer: async (userId, questionId, answer) => {
      const res = await fetch(`${API_BASE}/trivia/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionId, answer })
      });
      return res.json();
    }
  },
  
  jersey: {
    select: async (userId, club, kitType) => {
      const res = await fetch(`${API_BASE}/jersey/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, club, kitType })
      });
      return res.json();
    }
  },
  
  banter: {
    getFeed: async () => {
      const res = await fetch(`${API_BASE}/banter/feed`);
      return res.json();
    },
    createPost: async (userId, content, clubTag) => {
      const res = await fetch(`${API_BASE}/banter/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, clubTag })
      });
      return res.json();
    },
    vote: async (postId, voterId) => {
      const res = await fetch(`${API_BASE}/banter/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, voterId })
      });
      return res.json();
    }
  },
  
  highlights: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/highlights`);
      return res.json();
    },
    vote: async (highlightId, userId) => {
      const res = await fetch(`${API_BASE}/highlights/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId, userId })
      });
      return res.json();
    }
  },
  
  referral: {
    register: async (referrerId, referredId) => {
      const res = await fetch(`${API_BASE}/referral/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerId, referredId })
      });
      return res.json();
    }
  }
};
// src/services/api.ts

const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Auth
  auth: {
    login: async (telegramId: number, username?: string) => {
      const res = await fetch(`${API_BASE}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, username })
      });
      return res.json();
    }
  },
  
  // User
  user: {
    getProfile: async (telegramId: number) => {
      const res = await fetch(`${API_BASE}/user/profile?telegramId=${telegramId}`);
      return res.json();
    }
  },
  
  // Highlights
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
  }
};
// src/services/gemini.ts - No API key needed!

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  fact: string;
}

interface GenerateResponse {
  success: boolean;
  question: TriviaQuestion;
}

export const generateTriviaQuestion = async (clubName: string | null = null): Promise<GenerateResponse> => {
  try {
    const response = await fetch(`${API_URL}/gemini/trivia`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clubName })
    });

    const data = await response.json();
    
    if (data.success && data.question) {
      return {
        success: true,
        question: data.question
      };
    } else if (data.fallback) {
      return {
        success: true,
        question: {
          id: Date.now().toString(),
          question: data.fallback.question,
          options: data.fallback.options,
          correctAnswer: data.fallback.correctAnswer,
          fact: data.fallback.fact
        }
      };
    }
    
    throw new Error('Failed to generate question');
  } catch (error) {
    console.error('Trivia generation error:', error);
    return getFallbackQuestion();
  }
};

const getFallbackQuestion = (): GenerateResponse => {
  const fallbackQuestions = [
    {
      question: "Which player has won the most Ballon d'Or awards?",
      options: ["Cristiano Ronaldo", "Lionel Messi", "Michel Platini", "Johan Cruyff"],
      correctAnswer: 1,
      fact: "Lionel Messi has won a record 8 Ballon d'Or awards."
    },
    {
      question: "Which country has won the most FIFA World Cup titles?",
      options: ["Germany", "Italy", "Argentina", "Brazil"],
      correctAnswer: 3,
      fact: "Brazil has won the World Cup 5 times (1958, 1962, 1970, 1994, 2002)."
    },
    {
      question: "Which club has won the most UEFA Champions League titles?",
      options: ["AC Milan", "Bayern Munich", "Liverpool", "Real Madrid"],
      correctAnswer: 3,
      fact: "Real Madrid has won an incredible 14 Champions League titles."
    }
  ];
  
  const random = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  return {
    success: true,
    question: {
      id: Date.now().toString(),
      question: random.question,
      options: random.options,
      correctAnswer: random.correctAnswer,
      fact: random.fact
    }
  };
};
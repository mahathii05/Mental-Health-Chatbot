const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sentiment = require('sentiment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const sentiment = new Sentiment();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Student-focused relaxation tips based on mood
const moodTips = {
  veryNegative: [
    "Take a deep breath. Inhale for 4 counts, hold for 4, exhale for 4. Repeat 3 times.",
    "Remember, it's okay to not be okay. Your feelings are valid.",
    "Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    "Step away from your study space for 10 minutes. A short walk can reset your mind.",
    "Write down three things you're grateful for today, no matter how small.",
    "Listen to calming music or nature sounds. There are great free playlists online.",
    "Practice progressive muscle relaxation: tense and release each muscle group from toes to head.",
    "Remember: This feeling is temporary. You've gotten through difficult times before."
  ],
  negative: [
    "Take a 5-minute break. Stretch your body and move around.",
    "Drink a glass of water. Dehydration can affect your mood.",
    "Try the Pomodoro technique: 25 minutes of focused work, then a 5-minute break.",
    "Write down what's bothering you. Sometimes putting it on paper helps.",
    "Connect with a friend or family member, even just a quick text.",
    "Do a quick mindfulness exercise: focus on your breathing for 2 minutes.",
    "Organize your study space. A clean environment can improve your mental state.",
    "Remember your 'why' - why are you studying? What's your goal?"
  ],
  neutral: [
    "Maintain your current routine. Consistency is key for mental wellness.",
    "Take regular breaks during study sessions to prevent burnout.",
    "Stay hydrated and eat nutritious meals to keep your energy stable.",
    "Practice good sleep hygiene for better mood regulation.",
    "Set small, achievable goals for today to build momentum.",
    "Practice self-compassion. You're doing your best, and that's enough."
  ],
  positive: [
    "Great to hear you're feeling good! Keep up the positive momentum.",
    "Use this positive energy to tackle a challenging task you've been avoiding.",
    "Share your good mood with others - it can be contagious in the best way!",
    "Document what's working well for you so you can return to these strategies later.",
    "Take advantage of this energy to plan ahead and set yourself up for success.",
    "Remember this feeling when you face challenges - you have the strength to overcome them."
  ],
  veryPositive: [
    "Wonderful! Your positive energy is inspiring. Keep spreading that light!",
    "Use this momentum to help a friend or classmate who might be struggling.",
    "Celebrate your wins, no matter how small. You deserve to feel good!",
    "Channel this energy into creative activities or hobbies you enjoy.",
    "Remember this feeling - you can return to these positive thoughts when needed.",
    "Consider journaling about what's making you feel great - it's a great reference for later!"
  ]
};

// Emergency resources
const emergencyResources = {
  message: "If you're in immediate crisis, please reach out to:",
  resources: [
    "National Suicide Prevention Lifeline: 988 (US)",
    "Crisis Text Line: Text HOME to 741741",
    "Your campus counseling center",
    "Emergency services: 911"
  ]
};

// Analyze sentiment and determine mood
function analyzeMood(text) {
  const result = sentiment.analyze(text);
  const score = result.score;
  
  let mood;
  if (score <= -3) {
    mood = 'veryNegative';
  } else if (score < 0) {
    mood = 'negative';
  } else if (score === 0) {
    mood = 'neutral';
  } else if (score < 3) {
    mood = 'positive';
  } else {
    mood = 'veryPositive';
  }
  
  return {
    mood,
    score,
    comparative: result.comparative,
    tokens: result.tokens,
    words: result.words,
    positive: result.positive,
    negative: result.negative
  };
}

// Get appropriate response based on mood
function getResponse(moodAnalysis, userMessage) {
  const { mood, score } = moodAnalysis;
  
  // Check for crisis keywords
  const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'want to die'];
  const hasCrisisKeywords = crisisKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  if (hasCrisisKeywords || score <= -5) {
    return {
      type: 'crisis',
      message: "I'm concerned about what you've shared. Your life has value, and there are people who want to help.",
      tips: emergencyResources.resources,
      mood: moodAnalysis.mood,
      score: moodAnalysis.score
    };
  }
  
  // Get tips for the detected mood
  const tips = moodTips[mood] || moodTips.neutral;
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  // Generate empathetic response
  let empatheticResponse = "";
  if (mood === 'veryNegative' || mood === 'negative') {
    empatheticResponse = "I understand you're going through a tough time. That's completely valid, and I'm here to help.";
  } else if (mood === 'neutral') {
    empatheticResponse = "I'm here to support you. Let's work together to maintain your wellbeing.";
  } else {
    empatheticResponse = "It's wonderful to hear you're feeling positive! Let's keep that momentum going.";
  }
  
  return {
    type: 'normal',
    message: empatheticResponse,
    tip: randomTip,
    mood: moodAnalysis.mood,
    score: moodAnalysis.score,
    additionalTips: tips.filter(t => t !== randomTip).slice(0, 2) // Provide 2 more tips
  };
}

// API endpoint for chat
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    
    // Analyze sentiment
    const moodAnalysis = analyzeMood(message);
    
    // Get response
    const response = getResponse(moodAnalysis, message);
    
    res.json({
      success: true,
      response: response.message,
      tip: response.tip,
      additionalTips: response.additionalTips,
      mood: response.mood,
      sentimentScore: response.score,
      type: response.type,
      resources: response.resources || null
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get mood history (simple in-memory storage for demo)
let moodHistory = [];

app.post('/api/mood-history', (req, res) => {
  try {
    const { message, mood, score } = req.body;
    moodHistory.push({
      message,
      mood,
      score,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 entries
    if (moodHistory.length > 50) {
      moodHistory = moodHistory.slice(-50);
    }
    
    res.json({ success: true, history: moodHistory });
  } catch (error) {
    console.error('Error saving mood history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mood-history', (req, res) => {
  res.json({ success: true, history: moodHistory });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Mental Health Chatbot server running on http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${3000}`);
});

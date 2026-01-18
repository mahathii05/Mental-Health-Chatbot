# Student Mental Health Chatbot

A supportive AI chatbot designed specifically for students, featuring sentiment analysis, mood detection, and personalized relaxation tips.

## Features

- **Sentiment Analysis**: Analyzes user messages to detect emotional state
- **Mood Detection**: Categorizes mood into 5 levels (Very Negative, Negative, Neutral, Positive, Very Positive)
- **Personalized Tips**: Provides student-focused relaxation and wellness tips based on detected mood
- **Crisis Detection**: Identifies crisis situations and provides immediate support resources
- **Modern UI**: Beautiful, responsive interface with gradient design
- **Real-time Mood Tracking**: Visual mood indicator that updates based on conversation

## Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Sentiment Analysis**: Sentiment.js library
- **Styling**: Modern CSS with gradients and animations

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. Open the application in your web browser
2. Type your message in the input field
3. The chatbot will:
   - Analyze your message sentiment
   - Detect your current mood
   - Provide empathetic responses
   - Offer personalized relaxation tips
   - Update the mood indicator in real-time

## API Endpoints

### POST `/api/chat`
Send a message to the chatbot.

**Request:**
```json
{
  "message": "I'm feeling stressed about my exams"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I understand you're going through a tough time...",
  "tip": "Take a deep breath. Inhale for 4 counts...",
  "additionalTips": ["...", "..."],
  "mood": "negative",
  "sentimentScore": -2,
  "type": "normal"
}
```

### POST `/api/mood-history`
Save mood data to history.

### GET `/api/mood-history`
Retrieve mood history.

## Mood Categories

- **Very Negative** (score ≤ -3): Crisis support and immediate resources
- **Negative** (score < 0): Empathetic support and stress-relief tips
- **Neutral** (score = 0): Maintenance tips and encouragement
- **Positive** (score > 0, < 3): Positive reinforcement and momentum tips
- **Very Positive** (score ≥ 3): Celebration and sharing encouragement

## Important Notes

⚠️ **This chatbot is a supportive tool and NOT a replacement for professional mental health care.**

If you're experiencing a mental health crisis:
- Contact emergency services: 911
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Reach out to your campus counseling center

## Project Structure

```
mental-health-chatbot/
├── server.js           # Express server and API endpoints
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML file
│   ├── styles.css     # Styling
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

## Development

To modify the chatbot:
- Edit `server.js` to change backend logic or add new tips
- Edit `public/styles.css` to customize the UI
- Edit `public/script.js` to modify frontend behavior
- Edit `public/index.html` to change the HTML structure

## License

MIT

## Contributing

Feel free to submit issues or pull requests to improve this project!

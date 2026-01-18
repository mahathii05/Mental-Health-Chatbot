const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const moodValue = document.getElementById('moodValue');
const moodFill = document.getElementById('moodFill');
const tipsContent = document.getElementById('tipsContent');

const API_URL = 'http://localhost:3000/api';

// Mood display mapping
const moodDisplay = {
    'veryNegative': 'Very Low',
    'negative': 'Low',
    'neutral': 'Neutral',
    'positive': 'Good',
    'veryPositive': 'Very Good'
};

const moodColors = {
    'veryNegative': { color: '#f44336', class: 'very-negative' },
    'negative': { color: '#ff9800', class: 'negative' },
    'neutral': { color: '#ffc107', class: 'neutral' },
    'positive': { color: '#8bc34a', class: 'positive' },
    'veryPositive': { color: '#4caf50', class: 'very-positive' }
};

// Add message to chat
function addMessage(text, isUser = false, moodData = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isUser) {
        contentDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
    } else {
        let messageHTML = `<p>${escapeHtml(text)}</p>`;
        
        if (moodData) {
            if (moodData.type === 'crisis') {
                contentDiv.classList.add('crisis-message');
                messageHTML += `<div class="tip-box">
                    <strong>⚠️ Immediate Support Resources:</strong>
                    <ul>`;
                moodData.resources.forEach(resource => {
                    messageHTML += `<li>${escapeHtml(resource)}</li>`;
                });
                messageHTML += `</ul></div>`;
            } else if (moodData.tip) {
                messageHTML += `<div class="tip-box">
                    <strong>💡 Tip for you:</strong>
                    <p>${escapeHtml(moodData.tip)}</p>
                </div>`;
                
                if (moodData.additionalTips && moodData.additionalTips.length > 0) {
                    messageHTML += `<div class="additional-tips">
                        <strong>More helpful tips:</strong>
                        <ul>`;
                    moodData.additionalTips.forEach(tip => {
                        messageHTML += `<li>${escapeHtml(tip)}</li>`;
                    });
                    messageHTML += `</ul></div>`;
                }
            }
        }
        
        contentDiv.innerHTML = messageHTML;
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update mood indicator
function updateMoodIndicator(mood, score) {
    moodValue.textContent = moodDisplay[mood] || 'Neutral';
    
    // Update mood bar
    moodFill.className = 'mood-fill';
    const moodInfo = moodColors[mood];
    if (moodInfo) {
        moodFill.classList.add(moodInfo.class || 'neutral');
    }
    
    // Update tips display
    updateTipsDisplay(mood);
}

// Update tips display
function updateTipsDisplay(mood) {
    const tips = {
        'veryNegative': 'Remember: You are not alone. Reach out to someone you trust.',
        'negative': 'Take a moment to breathe. Small steps forward are still progress.',
        'neutral': 'Maintain balance. Regular breaks and self-care are important.',
        'positive': 'Great job maintaining a positive mindset! Keep it up.',
        'veryPositive': 'Wonderful! Your positive energy is inspiring.'
    };
    
    tipsContent.textContent = tips[mood] || tips['neutral'];
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Send message to API
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    userInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Add bot response
            addMessage(data.response, false, {
                type: data.type,
                tip: data.tip,
                additionalTips: data.additionalTips,
                resources: data.resources
            });
            
            // Update mood indicator
            updateMoodIndicator(data.mood, data.sentimentScore);
            
            // Save to mood history
            await fetch(`${API_URL}/mood-history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    mood: data.mood,
                    score: data.sentimentScore
                })
            });
        } else {
            addMessage('I apologize, but I encountered an error. Please try again.', false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('I apologize, but I\'m having trouble connecting right now. Please check your connection and try again.', false);
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
        userInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize
userInput.focus();
updateMoodIndicator('neutral', 0);

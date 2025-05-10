// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const clearChatBtn = document.getElementById('clear-chat');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModal = document.querySelector('.close-modal');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const featureBtns = document.querySelectorAll('.feature-btn');
const personalInfoContainer = document.getElementById('personal-info-container');
const chatTitle = document.querySelector('.chat-title h2');

// Global variables
let isListening = false;
let recognition;

// Initialize the chat
function initChat() {
    loadTheme();
    updateUsernameDisplay();
    renderPersonalInfoUI();
    loadChatHistory();
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    voiceBtn.addEventListener('click', toggleVoiceRecognition);
    clearChatBtn.addEventListener('click', clearChat);
    helpBtn.addEventListener('click', () => helpModal.style.display = 'flex');
    closeModal.addEventListener('click', () => helpModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    themeToggle.addEventListener('click', toggleTheme);
    
    featureBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFeatureClick(btn.dataset.feature));
    });
    
    // Auto-resize textarea
    userInput.addEventListener('input', autoResizeTextarea);
    
    // Initial greeting
    if (!localStorage.getItem('chatHistory')) {
        setTimeout(() => {
            const userName = localStorage.getItem('userName');
            if (userName) {
                addBotMessage(`Hello ${userName}! I'm Yuv, your personal assistant. How can I help you today?`);
            } else {
                addBotMessage("Hello! I'm Yuv, your personal assistant. How can I help you today?");
            }
        }, 500);
    }
}

// Update username display in chat header
function updateUsernameDisplay() {
    const userName = localStorage.getItem('userName');
    if (userName) {
        chatTitle.textContent = `${userName}'s Assistant`;
    } else {
        chatTitle.textContent = 'Yuv';
    }
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

// Personal info management
function renderPersonalInfoUI() {
    const userName = localStorage.getItem('userName');
    const userLocation = localStorage.getItem('userLocation');
    
    if (userName || userLocation) {
        let html = `
            <div class="personal-info-section">
                <div class="info-header">
                    <i class="fas fa-user-circle user-icon"></i>
                    <h3>Your Profile</h3>
                    <button id="edit-info" class="edit-info-btn" title="Edit Info">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                </div>
                <div class="info-display">
                    ${userName ? `
                    <div class="info-item">
                        <div class="info-label">
                            <i class="fas fa-user"></i>
                            <span>Name</span>
                        </div>
                        <div class="info-value">${userName}</div>
                    </div>` : ''}
                    
                    ${userLocation ? `
                    <div class="info-item">
                        <div class="info-label">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Location</span>
                        </div>
                        <div class="info-value">${userLocation}</div>
                    </div>` : ''}
                </div>
                <div class="info-footer">
                    <small>Last updated: ${new Date().toLocaleDateString()}</small>
                </div>
            </div>
        `;
        personalInfoContainer.innerHTML = html;
        
        document.getElementById('edit-info').addEventListener('click', renderPersonalInfoForm);
    } else {
        renderPersonalInfoForm();
    }
}

function renderPersonalInfoForm() {
    const html = `
        <div class="personal-info-section edit-mode">
            <div class="info-header">
                <i class="fas fa-user-edit user-icon"></i>
                <h3>Edit Profile</h3>
            </div>
            <div class="info-form">
                <div class="form-group">
                    <label for="user-name">
                        <i class="fas fa-user"></i>
                        <span>Your Name</span>
                    </label>
                    <input type="text" id="user-name" placeholder="Enter your name" 
                           value="${localStorage.getItem('userName') || ''}">
                </div>
                
                <div class="form-group">
                    <label for="user-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Your Location</span>
                    </label>
                    <input type="text" id="user-location" placeholder="City, Country" 
                           value="${localStorage.getItem('userLocation') || ''}">
                </div>
                
                <div class="form-actions">
                    <button id="save-info" class="save-info-btn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    ${localStorage.getItem('userName') ? `
                    <button id="cancel-edit" class="cancel-btn">
                        <i class="fas fa-times"></i> Cancel
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
    personalInfoContainer.innerHTML = html;
    
    document.getElementById('save-info').addEventListener('click', saveUserInfo);
    
    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', renderPersonalInfoUI);
    }
}

function saveUserInfo() {
    const name = document.getElementById('user-name').value.trim();
    const location = document.getElementById('user-location').value.trim();
    
    if (name) localStorage.setItem('userName', name);
    else localStorage.removeItem('userName');
    
    if (location) localStorage.setItem('userLocation', location);
    else localStorage.removeItem('userLocation');
    
    updateUsernameDisplay();
    renderPersonalInfoUI();
    addBotMessage(`Information saved${name ? `, ${name}` : ''}! I'll remember this for our conversations.`);
}

// Chat functions
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    
    const messageContent = document.createElement('div');
    messageContent.innerHTML = text.replace(/\n/g, '<br>');
    
    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time');
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timeSpan);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
    saveChatHistory();
}

function addBotMessage(text, answerData) {
    if (answerData) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        
        const messageContent = document.createElement('div');
        messageContent.innerHTML = text.replace(/\n/g, '<br>');
        
        // Add web answer card
        const answerCard = document.createElement('div');
        answerCard.classList.add('web-answer');
        
        const title = document.createElement('div');
        title.classList.add('web-answer-title');
        title.textContent = answerData.title || 'Search Result';
        
        const snippet = document.createElement('div');
        snippet.classList.add('web-answer-snippet');
        snippet.textContent = answerData.snippet || 'No additional information available.';
        
        const link = document.createElement('a');
        link.classList.add('web-answer-link');
        link.href = answerData.link || '#';
        link.textContent = 'View more details';
        link.target = '_blank';
        
        answerCard.appendChild(title);
        answerCard.appendChild(snippet);
        answerCard.appendChild(link);
        messageContent.appendChild(answerCard);
        
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timeSpan);
        chatMessages.appendChild(messageDiv);
    } else {
        addMessage(text, false);
    }
    scrollToBottom();
    saveChatHistory();
}

function loadChatHistory() {
    const history = localStorage.getItem('chatHistory');
    if (history) {
        chatMessages.innerHTML = history;
        scrollToBottom();
    }
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', chatMessages.innerHTML);
}

function clearChat() {
    if (confirm("Are you sure you want to clear the conversation?")) {
        chatMessages.innerHTML = '';
        saveChatHistory();
        addBotMessage("Conversation cleared. How can I assist you now?");
    }
}

// Feature button handlers
async function handleFeatureClick(feature) {
    try {
        switch (feature) {
            case 'weather':
                await handleWeatherFeature();
                break;
                
            case 'reminder':
                addBotMessage("What would you like me to remind you about? (Example: 'Remind me to call mom at 5pm')");
                break;
                
            case 'calculator':
                addBotMessage("Enter a math expression to calculate (Example: '5 + 3 * 2' or 'sqrt(16)'). I can handle:\n" +
                             "- Basic operations: +, -, *, /\n" +
                             "- Exponents: ^ or **\n" +
                             "- Square roots: sqrt()\n" +
                             "- Trigonometric functions: sin(), cos(), tan()");
                break;
                
            case 'todo':
                await handleTodoFeature();
                break;
                
            case 'notes':
                await handleNotesFeature();
                break;
                
            case 'joke':
                await handleJokeFeature();
                break;
                
            default:
                addBotMessage("I'm not sure what you're asking. Can you try again?");
        }
    } catch (error) {
        console.error(`Error handling ${feature} feature:`, error);
        addBotMessage("Sorry, I encountered an error processing your request. Please try again.");
    }
}

async function handleWeatherFeature() {
    const userLocation = localStorage.getItem('userLocation');
    if (!userLocation) {
        addBotMessage("Please set your location in Personal Information first.");
        renderPersonalInfoForm();
        return;
    }

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message');
    typingIndicator.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();

    try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(userLocation)}?format=%C+%t`);
        if (!response.ok) throw new Error("Weather API error");
        
        const weatherText = await response.text();
        chatMessages.removeChild(typingIndicator);
        addBotMessage(`Current weather in ${userLocation}: ${weatherText}`);
    } catch (error) {
        chatMessages.removeChild(typingIndicator);
        addBotMessage(`I couldn't fetch weather data. Try checking here: <a href="https://wttr.in/${encodeURIComponent(userLocation)}" target="_blank">Weather for ${userLocation}</a>`);
    }
}

async function handleJokeFeature() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message');
    typingIndicator.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();

    try {
        const joke = await fetchRandomJoke();
        chatMessages.removeChild(typingIndicator);
        addBotMessage(joke);
    } catch (error) {
        chatMessages.removeChild(typingIndicator);
        addBotMessage("I couldn't fetch a joke right now. How about this: Why did the programmer quit his job? Because he didn't get arrays!");
    }
}

async function fetchRandomJoke() {
    const jokeAPIs = [
        'https://official-joke-api.appspot.com/random_joke',
        'https://v2.jokeapi.dev/joke/Any?type=single',
        'https://icanhazdadjoke.com/'
    ];

    for (const api of jokeAPIs) {
        try {
            const headers = api.includes('icanhazdadjoke') 
                ? { 'Accept': 'application/json' }
                : {};
            
            const response = await fetch(api, { headers });
            if (!response.ok) continue;
            
            const jokeData = await response.json();
            
            if (api.includes('official-joke-api')) {
                return `${jokeData.setup} ${jokeData.punchline}`;
            } else if (api.includes('jokeapi')) {
                return jokeData.joke || `${jokeData.setup} ${jokeData.delivery}`;
            } else if (api.includes('icanhazdadjoke')) {
                return jokeData.joke;
            }
        } catch (e) {
            console.error(`Joke API ${api} failed:`, e);
            continue;
        }
    }
    throw new Error("All joke APIs failed");
}

async function handleTodoFeature() {
    const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
    
    if (todoList.length > 0) {
        let todoMessage = "Here's your to-do list:\n";
        todoList.forEach((item, index) => {
            todoMessage += `${index + 1}. ${item}\n`;
        });
        addBotMessage(todoMessage);
    } else {
        addBotMessage("Your to-do list is empty. Add a task by typing: 'add to my todo: Your task here'");
    }
}

async function handleNotesFeature() {
    const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
    
    if (userNotes.length > 0) {
        let notesMessage = "Here are your notes:\n";
        userNotes.forEach((note, index) => {
            notesMessage += `${index + 1}. ${note}\n`;
        });
        addBotMessage(notesMessage);
    } else {
        addBotMessage("You don't have any notes saved yet. Add one by typing: 'add to my notes: Your note here'");
    }
}

// Message processing
async function processUserMessage(message) {
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message');
    typingIndicator.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();
    
    try {
        // Check for greetings
        if (/hello|hi|hey|greetings/i.test(message)) {
            chatMessages.removeChild(typingIndicator);
            const userName = localStorage.getItem('userName');
            const greetings = [
                `Hi there${userName ? ' ' + userName : ''}! How can I help you today?`,
                `Hello${userName ? ' ' + userName : ''}! What can I do for you?`,
                `Greetings${userName ? ' ' + userName : ''}! How may I assist you?`
            ];
            addBotMessage(greetings[Math.floor(Math.random() * greetings.length)]);
            return;
        }
        
        // Check for thanks
        if (/thanks|thank you|appreciate/i.test(message)) {
            chatMessages.removeChild(typingIndicator);
            const responses = [
                "You're welcome! Is there anything else I can help with?",
                "My pleasure! Let me know if you need anything else.",
                "Happy to help! Don't hesitate to ask if you have more questions."
            ];
            addBotMessage(responses[Math.floor(Math.random() * responses.length)]);
            return;
        }
        
        // Check for math expressions
        if (/[\d+\-*/().%^]/.test(message)) {
            try {
                const sanitized = message.replace(/[^0-9+\-*/().%^]/g, '');
                const result = new Function('return ' + sanitized.replace(/\^/g, '**'))();
                chatMessages.removeChild(typingIndicator);
                addBotMessage(`The result of ${message} is: ${result}`);
                return;
            } catch (e) {
                // Not a valid math expression
            }
        }
        
        // Check for todo list commands
        if (/^add to my todo( list)?:/i.test(message)) {
            const task = message.replace(/^add to my todo( list)?:/i, '').trim();
            const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
            todoList.push(task);
            localStorage.setItem('todoList', JSON.stringify(todoList));
            chatMessages.removeChild(typingIndicator);
            addBotMessage(`✅ Added to your to-do list: "${task}"`);
            return;
        }

        // Check for notes commands
        if (/^add to my notes:/i.test(message)) {
            const note = message.replace(/^add to my notes:/i, '').trim();
            const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
            userNotes.push(note);
            localStorage.setItem('userNotes', JSON.stringify(userNotes));
            chatMessages.removeChild(typingIndicator);
            addBotMessage(`📝 Added to your notes: "${note}"`);
            return;
        }

        // Check for reminder commands
        if (/^remind me to/i.test(message)) {
            const reminder = message.replace(/^remind me to/i, '').trim();
            chatMessages.removeChild(typingIndicator);
            addBotMessage(`⏰ I'll remind you to ${reminder} (Note: This is a demo. In a real app, I would set an actual reminder)`);
            return;
        }
        
        // Get web search results
        const searchResults = await getWebSearchResults(message);
        
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        if (searchResults && searchResults.length > 0) {
            // Show main result
            const mainResult = searchResults[0];
            
            // Format the response based on result type
            let responseText = "Here's what I found:";
            if (mainResult.title.includes("Definition")) {
                responseText = `Definition of ${message}:`;
            } else if (mainResult.title === message || mainResult.title.includes(message)) {
                responseText = `About ${message}:`;
            }
            
            addBotMessage(responseText, mainResult);
            
            // Show additional unique results
            if (searchResults.length > 1) {
                setTimeout(() => {
                    const uniqueResults = searchResults.slice(1).filter(result => 
                        !result.snippet.includes(mainResult.snippet) && 
                        !mainResult.snippet.includes(result.snippet)
                    );
                    
                    if (uniqueResults.length > 0) {
                        addBotMessage("Additional information:", uniqueResults[0]);
                    }
                }, 500);
            }
        } else {
            addBotMessage(`I couldn't find specific results for "${message}". Try searching directly: 
                          <a href="https://duckduckgo.com/?q=${encodeURIComponent(message)}" target="_blank">Search DuckDuckGo</a>`);
        }
    } catch (error) {
        console.error("Error:", error);
        chatMessages.removeChild(typingIndicator);
        addBotMessage("Sorry, I encountered an error while processing your request. Please try again.");
    }
}

// Web search function
async function getWebSearchResults(query) {
    try {
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        if (!response.ok) throw new Error("Failed to fetch search results");
        
        const data = await response.json();
        const results = [];
        
        // Check for instant answer (Abstract)
        if (data.AbstractText) {
            results.push({
                title: data.Heading || query,
                snippet: data.AbstractText,
                link: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
            });
        }
        
        // Check for disambiguation (RelatedTopics)
        if (data.RelatedTopics) {
            data.RelatedTopics.forEach(topic => {
                if (topic.FirstURL && topic.Text) {
                    results.push({
                        title: topic.Text.split(' - ')[0] || topic.Text,
                        snippet: topic.Text,
                        link: topic.FirstURL
                    });
                }
            });
        }
        
        // Check for regular results (Results)
        if (data.Results) {
            data.Results.forEach(result => {
                if (result.FirstURL && result.Text) {
                    results.push({
                        title: result.Text.split(' - ')[0] || result.Text,
                        snippet: result.Text,
                        link: result.FirstURL
                    });
                }
            });
        }
        
        // Fallback to Wikipedia-like results (Definitions)
        if (data.Definition && data.DefinitionURL) {
            results.push({
                title: `${query} - Definition`,
                snippet: data.Definition,
                link: data.DefinitionURL
            });
        }
        
        // If no results found, provide a fallback
        if (results.length === 0) {
            results.push({
                title: `Search results for "${query}"`,
                snippet: "I couldn't find specific information, but you can try searching directly on DuckDuckGo.",
                link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
            });
        }
        
        return results.slice(0, 3); // Return top 3 most relevant results
        
    } catch (error) {
        console.error("Search error:", error);
        return [{
            title: "Search Error",
            snippet: "I couldn't complete the search. Please try again later.",
            link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
        }];
    }
}

// Voice recognition
function toggleVoiceRecognition() {
    if (!isListening) {
        startVoiceRecognition();
    } else {
        stopVoiceRecognition();
    }
}

function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            isListening = true;
            voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            voiceBtn.style.backgroundColor = 'var(--accent-color)';
            addBotMessage("I'm listening...");
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            autoResizeTextarea();
            sendMessage();
        };
        
        recognition.onerror = (event) => {
            addBotMessage("Sorry, I couldn't understand you. Please try again.");
            stopVoiceRecognition();
        };
        
        recognition.onend = () => {
            stopVoiceRecognition();
        };
        
        recognition.start();
    } else {
        addBotMessage("Voice recognition is not supported in your browser. Try Chrome or Edge.");
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
    }
    isListening = false;
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceBtn.style.backgroundColor = 'var(--primary-color)';
}



// Utility functions
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        autoResizeTextarea();
        processUserMessage(message);
    }
}

function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Initialize the chat
document.addEventListener('DOMContentLoaded', initChat);
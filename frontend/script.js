const msgContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const userMenuBtn = document.getElementById('userMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== userMenuBtn) {
        dropdownMenu.classList.remove('show');
    }
});

userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.value.trim() === '') {
        sendBtn.disabled = true;
    } else {
        sendBtn.disabled = false;
    }
});

sendBtn.disabled = true;


addMessage("Hi! Ask me anything about the campus (Library, Canteen, Mess, etc.)", 'bot');

function addMessage(text, sender) {
    const row = document.createElement('div');
    row.className = `msg-row ${sender}`;

    const content = document.createElement('div');
    content.className = 'msg-content';

    const msgText = document.createElement('div');
    msgText.className = 'msg-text';
    msgText.textContent = text;

    content.appendChild(msgText);
    row.appendChild(content);
    msgContainer.appendChild(row);
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
}

let typingIndicatorRow = null;

function showTypingIndicator() {
    typingIndicatorRow = document.createElement('div');
    typingIndicatorRow.className = 'msg-row bot';

    const content = document.createElement('div');
    content.className = 'msg-content';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    content.appendChild(indicator);
    typingIndicatorRow.appendChild(content);
    msgContainer.appendChild(typingIndicatorRow);
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
}

function removeTypingIndicator() {
    if (typingIndicatorRow) {
        typingIndicatorRow.remove();
        typingIndicatorRow = null;
    }
}

let API_URL = '{{API_URL}}';
if (API_URL.startsWith('{{')) {
    API_URL = 'http://127.0.0.1:8000/chat';
} else if (!API_URL.endsWith('/chat')) {
    API_URL += API_URL.endsWith('/') ? 'chat' : '/chat';
}

async function sendMsg() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;

    showTypingIndicator();

    try {
        const fetchPromise = fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const timeoutPromise = new Promise(res => setTimeout(res, 800));

        const [res] = await Promise.all([fetchPromise, timeoutPromise]);

        const data = await res.json();
        removeTypingIndicator();
        addMessage(data.response, 'bot');
    } catch (err) {
        removeTypingIndicator();
        addMessage("Error connecting to ML backend.", 'bot');
    }
}

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
    }
});

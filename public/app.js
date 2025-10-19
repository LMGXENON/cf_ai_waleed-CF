// grab the session ID from browser storage, or make a new one
function getSessionId() {
    let id = localStorage.getItem('sessionId');
    if (!id) {
        id = 'session_' + Math.random().toString(36).slice(2);
        localStorage.setItem('sessionId', id);
    }
    return id;
}

// grab all the HTML elements we need
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const clearBtn = document.getElementById('clear');
const sessionEl = document.getElementById('session');

const sessionId = getSessionId();
sessionEl.textContent = sessionId;

// add a message bubble to the chat
function addMsg(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = `<div class="content">${escape(text)}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight; // scroll to bottom
}

// show the "..." loading animation
function showLoading() {
    const div = document.createElement('div');
    div.className = 'msg loading';
    div.id = 'loading';
    div.innerHTML = '<div class="dots"><span>.</span><span>.</span><span>.</span></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
}

// prevent XSS attacks by escaping HTML
function escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// send a message to the backend and get the AI response
async function send(text) {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, sessionId })
        });
        const data = await res.json();
        return data.response;
    } catch (err) {
        return 'Error: ' + err.message;
    }
}

// load previous messages when page loads
async function loadHistory() {
    try {
        const res = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
            messages.innerHTML = '';
            data.messages.forEach(m => addMsg(m.role, m.content));
        }
    } catch (err) {
        console.log('No history');
    }
}

// when user submits the form
form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMsg('user', text);
    input.value = '';
    input.disabled = true;

    showLoading();
    const reply = await send(text);
    hideLoading();
    
    addMsg('assistant', reply);
    input.disabled = false;
    input.focus();
};

// when user clicks clear button
clearBtn.onclick = async () => {
    if (!confirm('Clear chat?')) return;
    
    try {
        await fetch('/api/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        messages.innerHTML = '<div class="msg assistant"><div class="content">Chat cleared. Say hi!</div></div>';
    } catch (err) {
        alert('Failed to clear');
    }
};

// load previous messages when page first opens
loadHistory();

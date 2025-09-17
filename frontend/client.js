const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'screenshot') {
        const img = new Image();
        img.src = 'data:image/png;base64,' + msg.data;
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
};

// Send mouse clicks
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (1024 / canvas.width);
    const y = (e.clientY - rect.top) * (768 / canvas.height);
    ws.send(JSON.stringify({ type: 'click', x, y }));
});

// Send keyboard
document.getElementById('sendKeyBtn').addEventListener('click', () => {
    const key = document.getElementById('keyInput').value;
    if (!key) return;
    ws.send(JSON.stringify({ type: 'keypress', key }));
    document.getElementById('keyInput').value = '';
});

// Navigate
document.getElementById('navigateBtn').addEventListener('click', () => {
    const url = document.getElementById('urlInput').value;
    if (!url) return;
    ws.send(JSON.stringify({ type: 'navigate', url }));
});

const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const { Server } = require('ws');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Start Express
const server = app.listen(port, () => console.log(`Server running on port ${port}`));

// Launch Puppeteer
let browser;
let page;
(async () => {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });
    await page.goto('https://example.com');
})();

// Setup WebSocket server
const wss = new Server({ server });

wss.on('connection', ws => {
    console.log('Client connected');

    // Periodically send screenshots
    const interval = setInterval(async () => {
        if (!page) return;
        const screenshot = await page.screenshot({ encoding: 'base64' });
        ws.send(JSON.stringify({ type: 'screenshot', data: screenshot }));
    }, 1000); // 1 screenshot per second

    // Receive user events
    ws.on('message', async message => {
        const msg = JSON.parse(message);
        if (!page) return;

        try {
            if (msg.type === 'click') {
                await page.mouse.click(msg.x, msg.y);
            } else if (msg.type === 'keypress') {
                await page.keyboard.type(msg.key);
            } else if (msg.type === 'navigate') {
                await page.goto(msg.url, { waitUntil: 'networkidle2' });
            }
        } catch (err) {
            console.error(err);
        }
    });

    ws.on('close', () => clearInterval(interval));
});

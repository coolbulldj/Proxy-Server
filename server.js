const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const { Server } = require('ws');

const app = express();

const puppeteer = require('puppeteer')

const browser = await puppeteer.launch();

const page = await browser.newPage();

// Set screen size.
await page.setViewport({width: 1080, height: 1024});


async function ScreenshotPage(url) {
    await page.goto(url);
    await page.screenshot({encoding: 'base64'});
    await browser.close();
}

app.get('/', (req, res) => {
    const url = req.query.url;
    res.send(`You requested the URL: ${url}`);
})


//Shutdown Processes
function ProcessShutdown() {
    console.log("closing server")
}

process.on("SIGTERM", ProcessShutdown)
process.on('SIGINT', ProcessShutdown)

//Port

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

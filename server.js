const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

async function ScreenshotPage(url) {
    const browser = await puppeteer.launch({
        headless: false, // run in headless mode
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    const page = await browser.newPage();

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Take screenshot and return it as base64
    const screenshot = await page.screenshot({ encoding: 'base64' });

    await browser.close();

    return screenshot;
}

// Endpoint: /?url=https://example.com
app.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send("Error: Please provide a ?url parameter.");
    }

    try {
        const screenshot = await ScreenshotPage(url);

        // Send as an image directly
        res.set('Content-Type', 'image/png');
        res.send(Buffer.from(screenshot, 'base64'));
    } catch (err) {
        console.error(err);
        res.status(500).send("Screenshot failed: " + err.message);
    }
});

// Shutdown cleanly
function ProcessShutdown() {
    console.log("Closing server...");
    process.exit(0);
}

process.on("SIGTERM", ProcessShutdown);
process.on("SIGINT", ProcessShutdown);

// Port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

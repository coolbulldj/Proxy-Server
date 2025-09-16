const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

// Launch a single browser for efficiency
let browser;
(async () => {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
})();

async function screenshot(url) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const img = await page.screenshot({ encoding: 'base64' });
    await page.close();
    return img;
}

// Endpoint for screenshots
app.get('/screenshot', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('Missing ?url parameter');

    try {
        const img = await screenshot(url);
        res.json({ image: img }); // send base64 to client
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

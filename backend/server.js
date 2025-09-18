const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();

const frontend_path = path.join(__dirname, "..", "frontend");

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

app.use(
    express.json(),
    express.static(frontend_path)
)


app.get('/', (req, res) => {
    res.sendFile(path.join(frontend_path, 'main.html'));
})




app.post('/api/url', async (req, res) => {
    const body = req.body;
    const url = body.url;
    
    if (!url) return res.status(400).send({ error: 'URL is required' });

     try {
        const img = await screenshot(url);
        res.json({ image: img }); // send base64 to client
    } catch (err) {
        res.status(500).send(err.message);
    }
});


//Shutdown Processes
function ProcessShutdown() {
    console.log("closing server")
    CloseDB();
}

process.on("SIGTERM", ProcessShutdown)
process.on('SIGINT', ProcessShutdown)

//Port

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}...`))
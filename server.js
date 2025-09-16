const express = require('express');
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

app.listen(port, () => console.log(`listening on port ${port}...`))
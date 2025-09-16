const Express = require('express');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({ changeOrigin: true });
const app = Express();


app.get('/', (req, res) => {
    const targetUrl = req.query.url
   
    proxy.web(req, res, { target: targetUrl }, (err) => {
        res.status(500).send(`Proxy error: ${err.message}`);
    });
})

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
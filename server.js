const Express = require('express');
const { create_proxy_middleware } = require('http-proxy-middleware');
const app = Express();



app.get('/', (req, res, next) => {
    const targetUrl = req.query.url
    
    const middleware = create_proxy_middleware({
        target: targetUrl,
        changeOrigin: true,
        selfHandleResponse: true,
        onProxyRes(proxyRes, req, res) {
            let body = '';
            proxyRes.on('data', chunk => body += chunk);
            proxyRes.on('end', () => {
                // Rewrite absolute URLs in the response body
                const proxyBase = `${req.protocol}://${req.headers.host}/?url=${targetUrl}`;
                const rewritten = body.replace(new RegExp(targetUrl, 'g'), proxyBase);
                res.end(rewritten);
            });
        }
    })
    middleware(req, res, next);
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
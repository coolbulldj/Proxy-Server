const http = require('http');

http.createServer((client_req, client_res) => {
    const options = {
        hostname: 'www.google.com',
        port: 80,
        path: client_req.url,
        method: client_req.method,
        headers: client_req.headers
    };

    const proxy = http.request(options, (res) => {
        client_res.writeHead(res.statusCode, res.headers);
        res.pipe(client_res); // Directly pipe the response
    });

    client_req.pipe(proxy); // Pipe client request to the proxy server
}).listen(3000, () => console.log("Proxy running on port 3000"));
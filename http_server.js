const http = require('http');

const server = http.createServer((req, res)=>{

    res.writeHead(200, {
       'Content-Type': 'text/plain'
    });

    res.end(`<div>
Hello<br>
${req.url}
</div>`);

});

server.listen(3000);


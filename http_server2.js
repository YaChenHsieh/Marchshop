const http = require('http');
const fs = require('fs');

http.createServer((req, res)=>{
    if(req.url !== '/') {
        res.end('visit /');
        return;
    }
    fs.writeFile(__dirname + '/header01.json',
        JSON.stringify(req.headers),
        error=>{
            if(error) return 'error';
            console.log(error);
        });

}).listen(3000);


const path = require('path') //path

//express init
const port = 3000   
const express = require('express');
const app = express();

//websocket
var expressWs = require('express-ws')(app);


//ws init
app.ws("/echo", function(ws, req) {
    ws.on('message', function(msg) {
        ws.send(msg);
    });
});

//lagre ws i egen liste med brukere
//ws.send sender til bruker
//ws.end slett ws

//css
app.use(express.static(__dirname + '/public'));

//start
app.listen(port)
console.log("server started: http://localhost:"+port)

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/index.html'));
});

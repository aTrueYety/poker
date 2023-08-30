const path = require('path') //path

//express init
const port = 3000   
const express = require('express');
const app = express();

//websocket
var expressWs = require('express-ws')(app);

//session init
const session = require('express-session');
const e = require('express');
var SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
    secret: "GenererTilfeldigSenere", //endre dette senere. Lagre secret som et nytt tilfelfig nummer hver gang server starter?
    resave: false,
    saveUninitialized: true,
    secure: false,
    store: new SQLiteStore({db : 'sessions.db', dir: __dirname + '/database'})
}));


app.use(express.json()) 

//lagre ws i egen liste med brukere
//ws.send sender til bruker
//ws.end slett ws

//css
app.use(express.static(__dirname + '/public'));


//start server
app.listen(port)
console.log("server started: http://localhost:"+port)

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/index.html'));
});

let test = {};

app.ws("/wsInit", function(ws, req) {
    test[req.sessionID] = {};
    test[req.sessionID]["ws"] = ws;

    ws.on("close",() => { 
        console.log("close");
        delete test[req.sessionID];
    });
});
let players = {}; //initierer brukere

// navn:{username: navn, res: res, c: chips, status: status, action: action}

function getNumPlayers(){
    return Object.keys(players).length;
}

app.post('/wstest', function(req, res) {
    test[req.sessionID]["ws"].send("5")
    //console.log(req.session.ws);
    res.send("ok");
});

app.get("/test", function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/test.html'));
});
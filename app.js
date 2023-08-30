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

//users
var users = {}

//session
app.use(session({
    secret: "GenererTilfeldigSenere", //endre dette senere. Lagre secret som et nytt tilfelfig nummer hver gang server starter?
    resave: false,
    saveUninitialized: true,
    secure: false,
    store: new SQLiteStore({db : 'sessions.db', dir: __dirname + '/database'})
}));


app.use(express.json()) //json

//css
app.use(express.static(__dirname + '/public'));


//start server
app.listen(port)
console.log("server started: http://localhost:"+port)

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/index.html'));
});

app.ws("/gameStream", function(ws, req) {
    users[req.sessionID] = {}; //make new user
    users[req.sessionID]["ws"] = ws; //add websocket to user

    ws.on("close",() => {  //remove user when websocket closes
        console.log("close"); 
        delete users[req.sessionID];
    });
});

app.post('/wstest', function(req, res) {
    users[req.sessionID]["ws"].send("5")

    Object.values(users).forEach(user => {
        console.log(user);
        user.ws.send(req.sessionID);
    });
    //console.log(req.session.ws);
    res.send("ok");
});


app.get("/test", function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/test.html'));
});

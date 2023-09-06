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
    //users[req.sessionID]["username"] = req.session.username; //add username to user
    console.log(req.sessionID)

    ws.on("close",() => {  //remove user when websocket closes
        console.log("close"); 
        delete users[req.sessionID];
    });

    ws.on("message", function(data){ //send chat to all users
        let message;
        try{
            message = JSON.parse(data)
        } catch(e){
            console.error("error parsing json message");
            console.log(data);
            return;
        }
        switch(message.type){
            case "chat": //chat
                chat(message.message, req.session.username);
                break;

            case "gameAction": //game action
                //send data to game class
                //pass through res
                console.log(message);
                switch(message.action){
                    //actions
                    case "join":
                        //check if user already is in game
                        //check if game is full
                        //add user to game

                        //get gamestate, get funtion from game class?
                        let p1 = '{"username": "test1", "cards":{"c1":"h1","c2":"s13"}}';
                        let p2 = '{"username": "test2", "cards":{"c1":"c8","c2":"d11"}}';
                        let p3 = '{"username": "test2", "cards":{"c1":"c8","c2":"d11"}}';
                        let p = '{"p1":'+p1+',"p2":'+p2+',"p3":'+p3+'}';
                        let cards = '{"c1":"h1","c2":"s1","c3":"c3","c4":"d4","c5":"h13"}';
                        let gameState = '{"players":'+p+',"centerCards":'+cards+', "pot": 0,"currBet": 0,"currPlayer": 1,"currButtons": ["check","bet","fold"]}';
                        //send gamestate to user
                        ws.send('{"type":"gameState","gameState":'+gameState+'}');
                        break;
                }

                //should be formated as {"type":"gameAction","action":"action","data":"data"}
                break;
            
            default: //if the type is not recognized, err
                console.error("error parsing json message");
                ws.send('{"type":"error","message":"'+message.type+' is not a valid message type"}');
                break;
        }
    });
});

// ----------------- CHAT ----------------- //

function chat(message,username){ //send chat through websocket
    Object.values(users).forEach(user => {
        user["ws"].send('{"type":"chat","chatMessage":"'+message+'","username":"'+username+'"}');
    });
}


app.post('/wstest', function(req, res) {
    users[req.sessionID]["ws"].send("5")

    Object.values(users).forEach(user => {
        console.log(user);
        user.ws.send(req.sessionID);
    });
    //console.log(req.session.ws);
    res.send("ok");
});


app.get("/game", function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/tempgame.html'));
});

app.get("/test", function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/test.html'));
});

app.post("/getName", function(req, res) {
    if(req.session.username){
        res.send(req.session.username);
    }
    else{
        res.send("no_user");
    }
});

app.post("/setName/:username", function(req, res) {
    if(!checkUsername(req.params.username)){
        res.send("err:username_taken");
        return;
    }
    req.session.username = req.params.username;
    users[req.sessionID]["username"] = req.params.username;
    req.session.save(function(err) {
    });
    res.send("ok");
});

function checkUsername(username){
    //check if username is valid

    //parse for html, script tags, etc.

    //check if username is taken
    Object.values(users).forEach(user => {
        if(user.username === username){
            return false;
        }
    });

    return true;
}




// ----------------- GAME ----------------- //


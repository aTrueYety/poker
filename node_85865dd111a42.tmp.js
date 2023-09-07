const path = require('path') //path

//express init
const port = 3000   
const express = require('express');
const app = express();

//websocket
var expressWs = require('express-ws')(app);

//get main script
var mainJS = require('./main.js');
mainJS.test();

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
                        let test = new mainJS.Game([new mainJS.Player("51355", "Erik", 2000), new mainJS.Player("749720", "Markus", 1000)]);
                        let p = '{' // '{"p1":'+p1+',"p2":'+p2+',"p3":'+p3+'}';
                        for (let i = 0; i < test.players.length; i++) {
                            const player = test.players[i];
                            let p_cards = '{';
                            for (let i = 0; i < player.hand.length; i++) {
                                const card = player.hand[i];
                                let short = card.value + card.suit[0];
                                p_cards += '"c'+(i+1)+'":"'+short+'",';
                            }
                            p_cards += '}';
                            let p_cur = '{"username": "'+player.username+'", "cards":'+p_cards+'}'; // '{"username": "test1", "cards":{"c1":"h1","c2":"s13"}}';
                            p += '"p'+(i+1)+'":'+p_cur;
                            if (i != test.players.length-1) {
                                p += ',';
                            }
                        }
                        p += '}';
                        console.log(p);

                        let board_cards = '{'; // '{"c1":"h1","c2":"s1","c3":"c3","c4":"d4","c5":"h13"}'
                        for (let i = 0; i < test.board.hand.length; i++) {
                            const card = test.board.hand[i];
                            let short = card.value + card.suit[0];
                            p_cards += '"c'+(i+1)+'":"'+short+'",';
                        }
                        board_cards += '}';
                        console.log(board_cards);

                        test.oppdaterPot();
                        let gameState = '{"players":'+p+',"centerCards":'+board_cards+', "pot": '+test.pot+',"currBet": 0,"currPlayer": '+test.turn+'}';
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


let window_width = window.innerWidth;
let window_heigth = window.innerHeight;


let board = document.getElementById("board"); //get board


class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    toString() {
        return this.value + " of " + this.suit;
    }
}

board.innerHTML = "<img src='render/assets/board.jpeg'>";
let gamestate = {};

function render(gamestate){
    let backCard = "<img src='render/assets/cards/Spades/14.jpg'> <div class=cardOutline></div>";

    //render center cards
    for(let i = 1; i < 6; i++){
        let card = document.getElementById("c"+i);
        let suit;
        let value;

        e = getSuitValue(gamestate.centerCards["c"+i]);
        suit = e[0];
        value = e[1];
        card.innerHTML = "<img src='render/assets/cards/"+suit+"/"+value+".jpg'> <div class=cardOutline></div>";
    }

    let numPlayers = Object.values(gamestate.players).length; //get number of players
    //render player positions

    let prPlayerAngle = 2*Math.PI/numPlayers; //angle between players

    for(let i = 1; i < numPlayers; i++){ //calculate and render player positions
        //the user has a offsett of 30vh from the bottom and is centered 50vw from the left
        //therefore, we need to calculate a new for the other players based on these values
        let playeryPos = Math.cos(prPlayerAngle*i); //y axis
        let playerxPos = Math.sin(prPlayerAngle*i); //x axis

        let player = document.getElementById("players");

        player.innerHTML += getPlayerTemplate(i+1,"Player "+(i+1), 1000, 100, playerxPos, playeryPos)

        let pc1 = document.getElementById("p"+(i+1)+"c1");
        let pc2 = document.getElementById("p"+(i+1)+"c2");

        for(let j= 1; j<3; j++){ //get and render player cards
            let card = document.getElementById("p"+(i+1)+"c"+j);
    
            let e = getSuitValue(gamestate.players["p"+(i)].cards["c"+j]);
            let suit = e[0];
            let value = e[1];
    
    
            card.innerHTML = "<img src='render/assets/cards/"+suit+"/"+value+".jpg'> <div class=cardOutline></div>";
        }
    }


    //render user cards
    for(let i = 1; i<3; i++){ //get and render player cards
        let card = document.getElementById("p1c"+i);

        let e = getSuitValue(gamestate.players["p1"].cards["c"+i]);
        let suit = e[0];
        let value = e[1];


        card.innerHTML = "<img src='render/assets/cards/"+suit+"/"+value+".jpg'> <div class=cardOutline></div>";
    }

    //render user buttons

    //for now the buttons stay the same. Change later. 
    //You cant both call and check, and you cant both raise and bet.
    //Simply change the text of the check button and interpret it as a call. 
    //This makes room for the bet field to be bigger.
    //The bet text of the bet button will be replaced with raise in situations where it is nessessary.

    let opacity = "70%"
    if(gamestate.currPlayer === 1){
        opacity = "100%"
    }
    let buttons = document.getElementsByClassName("userButtons");
    for(let i = 0; i < buttons.length; i++){
        buttons[i].style.opacity = opacity;
    }
    
}

function getSuitValue(card){
    let suit;
    let value;

    if(card === "back"){
        suit = "Spades";
        value = 14;
    }
    else{
        switch(card.charAt(0)){
            case "s":
                suit = "Spades";
                break;
            case "h":
                suit = "Hearts";
                break;
            case "c":
                suit = "Clubs";
                break;
            case "d":
                suit = "Diamonds";
                break;
        }
        value = parseInt(card.slice(1))
    }
    return [suit,value]
}


function getPlayerTemplate(playerNum,username, chips, bet, playerxPos, playeryPos){

    let posx = 0 + playerxPos*40; //calculate x position
    let posy = 40 + playeryPos*40; //calculate y position

    return `
    <div class = "playerWrapper" style = "top:${posy}%; left:${posx}%;">
        <div class="player">
            <div class = "playerCardWrapper">
                <div class = "playerCards">
                    <div class = "card" id = "p${playerNum}c1">
                    </div>
                    <div class = "card" id = "p${playerNum}c2">
                    </div>
                </div>
            </div>
            <div id = playerInfo>
                <div class = "playerName">
                    <p id = "player_name">${username}</p>
                </div>
                <div class = "playerChips">
                    <p id = "player_chips">Chips: ${chips}</p>
                </div>
                <div class = "playerBet">
                    <p id = "player_bet">Bet: ${bet}</p>
                </div>
            </div>
        </div>
    </div>
    `;
    
}

function getCurrButtons(){

}


let players = 4; //test with different amount of players

//webscocket setup
var socket = new WebSocket("ws://" + window.location.href.split("/")[2] + "/gameStream");

socket.onmessage = function (event) {
    console.log(event.data);
    let data;

    try{
        data = JSON.parse(event.data);
    } catch(e){
        console.error("error parsing json response");
        return;
    }
    
    switch(data.type){
        case "chat":
            displayChat(data);
            //should be formated as {"type":"chat","name":"username","chatMessage":"message""}
            break;

        case "gameAction": //when another a player has done an action

            break;

        case "gameState": //joining game / starting new game
            render(data.gameState); //render game
            break;
        
        case "error":
            console.error(data.message);
            break;
         
        default:
            console.error("error parsing json response");
            break;
    }
};


// ----------------- CHAT ----------------- //

function sendChat(inputvalue){ //send chat through websocket
    socket.send('{"type":"chat","message":"'+inputvalue+'"}');
}

//display chat
function displayChat(chatMessage){ 
    chat.push(chatMessage)
    if (chat.length > 50){ //hard coded max chat length CHANGE LATER
        chat.shift();
    }
  
    document.getElementById("msgContainer").innerHTML = "";
    var prevChatter = "";
  
    chat.forEach(chatMessage => { //display messages
        if (prevChatter === chatMessage.username){ //if the messsage is from the same user, style differently
            document.getElementById("msgContainer").innerHTML = document.getElementById("msgContainer").innerHTML + "<div class = 'chatElement'>" + chatMessage.chatMessage + "</div>"
        }
        else{ //new message from different user
            document.getElementById("msgContainer").innerHTML = document.getElementById("msgContainer").innerHTML + "<div class = 'chatElement'> <div class = 'chatName'>"+  chatMessage.username + ":"+ "</div> " + chatMessage.chatMessage + "</div>"
        }
      
        prevChatter = chatMessage.username //save previous chatter
    });
}

function sendHttpRequest(link, cb){
    let xhp = new XMLHttpRequest(); // initierer en ny request
    xhp.responseType = 'text';  
  
    xhp.open("POST",link ,true); //man setter url til meldingen
    xhp.send();

    xhp.timeout = 2000;
  
    xhp.onload = () => {
      	cb(xhp.response);
	  	return
    }
    
    xhp.ontimeout = (e) =>{ //connection timed out, resend
        cb("err: timeout")
		return
    }
}

var chat = []; //chat array
let isTurn = false; //users turn. Migrate to class?

window.onload = function(){ //onload get typebox
    chatinput = document.getElementById("typebox");
    nameinput = document.getElementById("getName");

    sendHttpRequest("/getName", function(res){
        if (res.includes("err")){
            document.getElementById("popup").style = "visibility:visible;";
            document.getElementById("error").innerHTML = res;
        }
        else if(res === "no_user"){
            document.getElementById("popup").style = "visibility:visible;";
        }
    });

    nameinput.addEventListener("keydown",function(event){
        if (event.key === "Enter"){
            inputvalue = document.getElementById("getName").value;
            document.getElementById("getName").value = "";
            sendHttpRequest("/setName/"+inputvalue, function(res){
                if (res.includes("err")){
                    document.getElementById("err").innerHTML = res;
                }
                else if(res === "ok"){
                    document.getElementById("popup").style = "visibility:hidden;";
                } else {
                    document.getElementById("err").innerHTML = res;
                }
            });
        }
    });
    
    //send chat on enter
    chatinput.addEventListener("keydown",function(event){
        if (event.key === "Enter"){
            inputvalue = document.getElementById("typebox").value;
            document.getElementById("typebox").value = "";
            sendChat(inputvalue);
        }
    });

    //uiButtons
    document.getElementById("fold").onclick = function(){
        socket.send('{"type":"gameAction","action":"fold"}');
    };

    document.getElementById("check").onclick = function(){
        socket.send('{"type":"gameAction","action":"check"}');
    };

    document.getElementById("call").onclick = function(){
        socket.send('{"type":"gameAction","action":"call"}');
    };

    document.getElementById("raise").onclick = function(){
        if(isNaN(parseInt(document.getElementById("raiseInput").value))){
            document.getElementById("raiseInput").value = "";
        } else {
            socket.send('{"type":"gameAction","action":"check","amount":"'+document.getElementById("raiseInput").value+'"}'); 
            document.getElementById("raiseInput").value = "";
        }
    };

    socket.send('{"type":"gameAction","action":"join"}')
};

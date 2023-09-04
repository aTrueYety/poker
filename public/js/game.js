let window_width = window.innerWidth;
let window_heigth = window.innerHeight;

let testCards = []

//test
testCards.push(new Card("Spades", 1));
testCards.push(new Card("Spades", 2));
testCards.push(new Card("Hearts", 3));
testCards.push(new Card("Clubs", 4));
testCards.push(new Card("Diamonds", 5));

let board = document.getElementById("board"); //get board

board.innerHTML = "<img src='render/assets/board.jpeg'>";

for(let i = 1; i < 6; i++){ //get and render center cards
    let card = document.getElementById("c"+i);
    card.innerHTML = "<img src='render/assets/cards/"+testCards[i-1].suit+"/"+testCards[i-1].value+".jpg'> <div class=cardOutline></div>";
}

for(let i = 1; i<3; i++){ //get and render player cards
    let card = document.getElementById("p1c"+i);
    card.innerHTML = "<img src='render/assets/cards/"+testCards[i-1].suit+"/"+testCards[i-1].value+".jpg'> <div class=cardOutline></div>";
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
let backCard = "<img src='render/assets/cards/Spades/14.jpg'> <div class=cardOutline></div>";

let prPlayerAngle = 2*Math.PI/players; //angle between players

for(let i = 1; i < players; i++){ //calculate and render player positions
    //the user has a offsett of 30vh from the bottom and is centered 50vw from the left
    //therefore, we need to calculate a new for the other players based on these values
    let playeryPos = Math.cos(prPlayerAngle*i); //y axis
    let playerxPos = Math.sin(prPlayerAngle*i); //x axis

    let player = document.getElementById("players");

    player.innerHTML += getPlayerTemplate(i+1,"Player "+(i+1), 1000, 100, playerxPos, playeryPos)
    
    let pc1 = document.getElementById("p"+(i+1)+"c1");
    let pc2 = document.getElementById("p"+(i+1)+"c2");

    pc1.innerHTML = backCard;
    pc2.innerHTML = backCard;

}

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

        case "gameAction":
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
      	console.log(xhp.response)
      	cb(xhp.response);
	  	return
    }
    
    xhp.ontimeout = (e) =>{ //connection timed out, resend
        cb("err: timeout")
		return
    }

}

var chat = []; //chat array

window.onload = function(){ //onload get typebox
    chatinput = document.getElementById("typebox");
    nameinput = document.getElementById("getName");

    sendHttpRequest("/getName", function(res){
        console.log(res);
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
                console.log(res);
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
    })
    
    //send chat on enter
    chatinput.addEventListener("keydown",function(event){
        if (event.key === "Enter"){
            inputvalue = document.getElementById("typebox").value;
            document.getElementById("typebox").value = "";
            sendChat(inputvalue);
        }
    })
};
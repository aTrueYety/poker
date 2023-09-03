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
    let posy = 30 + playeryPos*40; //calculate y position

    return `
    <div class = "playerWrapper" style = "top:${posy}vh; left:${posx}vw;">
        <div class="player">
            <div class = "playerCardWrapper">
                <div class = "playerCards">
                    <div class = "card" id = "p${playerNum}c1">
                    </div>
                    <div class = "card" id = "p${playerNum}c2">
                    </div>
                </div>
            </div>
            <div id = userInfo>
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


let players = 6; //test with different amount of players
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


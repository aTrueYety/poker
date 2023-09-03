class Holder {
    constructor(hand = []) {
        this.hand = hand;
    }
}
//console.log((-1+8)%(8))

class Player extends Holder {
    constructor(playerID, name, bank, hand = []) {
        super(hand);
        this.playerID = playerID;
        this.name = name;
        this.bank = bank;
        this.lastAction = null;
        this.allIn = false;
        this.turnPot = 0;
        this.roundPot = 0;
    }
    getBestHand(board) {
        
    }    
    toString() {
        return this.name + ": " + this.hand.toString() + " | Bank: " + this.bank + " | Last action: " + this.lastAction;
    }
}

class Board extends Holder {
    constructor(hand = []) {
        super(hand);
    }
    toString() {
        return "Board: " + this.hand.toString();
    }
}

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    toString() {
        return this.value + " of " + this.suit;
    }
}

const types = ["Spades", "Hearts", "Clubs", "Diamonds"];
class Deck {
    constructor() {
        this.cards = [];
        for (const type in types) {
            for (let j = 0; j < 13; j++) {
                this.cards.push(new Card(types[type], j+1));
            }
        }
        this.shuffle();
    }
    shuffle() {
        this.cards.sort(() => (Math.random() - 0.5));
    }
    dealTo(object) {
        object.hand.push(this.cards.pop());
    }
}


class Game {
    constructor(players, board = new Board(), blinds = [10, 20], blindTurn = 0) {
        this.players = players;
        this.turn = 0;
        this.board = board;
        this.blinds = blinds;
        this.blindTurn = blindTurn;
        this.deck = new Deck();
        this.pot;
        this.turnPot;

        // add obvservers
    }
    playerInput(player, action, amt = 0) /*Returns true if sucsess and fasle otherwise*/ {
        const res = this.playerAction(player, action, amt);
        if (res) {
            if (this.testTurnOver()) {this.nextTurn();}
        }
        return res;
    }
    playerAction(player, action, amt = 0) /*Returns true if sucsess and fasle otherwise*/ {
        const playerSpot = this.players.indexOf(player);
        if (playerSpot == -1) {return false;} // if player not found return false
        if (playerSpot != this.turn) {return false;} // if not players turn return false
        // test validity and do action, if valid return True
        switch (action) {
            case "check":
                const turnPot = player.turnPot; // compare the turnPots. If senders turnPot is grater or equal to all others then do check
                for (const player in this.players) {
                    if (this.players[player].turnPot > turnPot) {return false;}
                }
                this.bumpTurn(); 
                player.lastAction = "check";
                console.log("check validated for " + player.name);
                return true;
            case "call":
                var topPot = 0;
                for (let i = 0; i < this.players.length; i++) {
                    const otherPlayer = this.players[i];
                    topPot = Math.max(topPot, otherPlayer.turnPot);
                }
                var callAmt = topPot - player.turnPot; // find call amount
                if (callAmt <= 0) {return false;} // if no one has put in money then call is not valid
                if (player.bank < callAmt) {return false;} // if player does not have enough money then call is not valid
                this.playerPut(player, callAmt);
                this.bumpTurn(); 
                player.lastAction = "call";
                console.log("call validated for " + player.name);
                return true;
            case "bett":
                if (amt < Math.max(...(this.blinds))) {return false;} // if bett amount is 0 then bett is not valid   
                var topPot = 0;
                for (let i = 0; i < this.players.length; i++) {
                    const otherPlayer = this.players[i];
                    if (otherPlayer.lastAction == "bett" || otherPlayer.lastAction == "raise") {return false;} // if someone has bett or raised then bett is not valid
                    topPot = Math.max(topPot, otherPlayer.turnPot);
                }
                var callAmt = topPot - player.turnPot; // find call amount
                var totalAmt = amt+callAmt; // find bett amount
                if (player.bank < totalAmt) {return false;} // if player does not have enough money then bett is not valid
                this.playerPut(player, totalAmt);
                this.bumpTurn();
                player.lastAction = "bett";
                console.log("bett validated for " + player.name);
                return true;
            case "raise":
                if (playerSpot == -1) {console.log("vry bad!"); return false;} // if player index not found return false
                // if ether of the two last players are all in or folded then we need to continue backwards
                const prevRaiseIdx = (playerSpot-1+this.players.length)%this.players.length;
                const prevCallIdx = (playerSpot-2+this.players.length)%this.players.length;
                const minRaise = this.players[prevRaiseIdx].turnPot - this.players[prevCallIdx].turnPot; // find min raise
                if (amt <= minRaise) {return false;} // if raise amount is 0 then raise is not valid
                var topPot = 0;
                var otherBettOrRaise = false;
                for (let i = 0; i < this.players.length; i++) {
                    const otherPlayer = this.players[i];
                    if (otherPlayer.lastAction == "bett" || otherPlayer.lastAction == "raise") {otherBettOrRaise = true;} // if someone has bett or raised then bett is not valid
                    topPot = Math.max(topPot, otherPlayer.turnPot);
                }
                if (!otherBettOrRaise) {return false;} // if no one has bett or raised then raise is not valid
                var callAmt = topPot - player.turnPot; // find call amount
                var totalAmt = amt+callAmt; // find bett amount
                if (player.bank < totalAmt) {return false;} // if player does not have enough money then bett is not valid
                this.playerPut(player, totalAmt);
                this.bumpTurn();
                player.lastAction = "raise";
                console.log("raise validated for " + player.name);
                return true;
            case "fold":
                if (playerSpot == -1) {console.log("vry bad!"); return false;} // if player index not found return false
                // if ether of the two last players are all in or folded then we need to continue backwards
                var lastturnPot = this.players[(playerSpot-1+this.players.length)%this.players.length].turnPot; // find last player pot
                if (lastturnPot < player.turnPot) {return false;} // if player has put more or same amount of money than the prev player then fold is not valid
                player.lastAction = "fold";
                this.bumpTurn();
                console.log("fold validated for " + player.name);
                return true;
            default:  // if action does not exist return false
                console.log("action not found");
                return false;
        }
    }

    findPlayer(playerID) {
        for (const player in this.players) {
            if (this.players[player].playerID == playerID) {return this.players[player];}
        }
        return null;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    bumpTurn(amt = 1) {  // this is not tested if a player has folded or is all in
        var temp = 0;
        this.turn += amt-1;
        do {
            this.turn++;
            this.turn %= this.players.length;
            temp++;
        } while (this.players[this.turn].allIn || this.players[this.turn].lastAction == "fold");
        if (temp != 1) {console.log("bumpTurn: skipped player"); return false;}
        //console.log("New turn:" + this.turn);
    }
    bumpBlindTurn(amt = 1) {
        this.blindTurn += amt;
        this.blindTurn %= this.players.length;
    }
    oppdaterPot() {
        let sum = 0;
        for (const player in this.players) {
            sum += this.players[player].turnPot;
        }
        this.pot = sum;
    }
    playerPut(player, amount) /*Returns true if sucsess or false otherwise*/ {
        if (amount > player.bank) {return false;} // check if player has enough money
        player.bank -= amount; // remove amount from player bank
        if (player.bank == 0) {player.allIn = true;} // set all in if player is all in
        player.turnPot += amount; // add to player pot
        this.oppdaterPot(); // oppdater pot
        return true;
    }

    testTurnOver() {
        var inGame = 0;
        var nullAction = 0;
        var otherPot = -1;
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.allIn || player.lastAction == "fold") {continue;}
            inGame++;
            if (player.lastAction == null) {nullAction++;} // if someone has not done an action then return true
            if (otherPot == -1) {otherPot = player.turnPot; continue;} // if otherPot is not set then set it
            if (otherPot != player.turnPot) {return false;} // if otherPot is not the same as turnPot then return false
        }
        if (inGame == 1) {return true;} // if only one player is in game then return true because round over
        if (nullAction > 0) {return false;} // if someone has not done an action then return false
        return true;
    }
    testRoundOver() /*This only runs after testTurnOver is sucsessful*/ {
        if (this.board.hand.length == 5) {return ture;} // if board is full and turn over then round over
        var inGame = 0;
        for (let i = 0; i < this.players.length; i++) {
            if (!(this.players[i].allIn || this.players[i].lastAction == "fold")) {inGame++;}
        }
        if (inGame == 1) {return true;} // if only one player is in game then return true
        return false;
    }

    nextTurn() {
        if (this.testRoundOver()) {this.endRound(); return;} // check if round is over
        else this.startTurn()
    }

    startTurn() {
        // deal a card to the board
        const cardsOnBoard = this.board.hand.length;
        switch (cardsOnBoard) {
            case 0:
                for (let i = 0; i < 3; i++) { this.deck.dealTo(this.board); }
                console.log("Deal flop");
                break;
            case 3:
                this.deck.dealTo(this.board);
                console.log("Deal turn");
                break;
            case 4:
                this.deck.dealTo(this.board);
                console.log("Deal river");
                break;
            default:
                console.log("startTurn: board is full or not within limits");
                break;
        }
        // reset player last action and pot
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            player.lastAction = null;
            player.turnPot = 0;
        }
        // reset turn
        this.turn = (this.blindTurn+this.blinds.length)%this.players.length;
    }

    startRound() {
        this.deck = new Deck();
        this.pot = 0;
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            player.hand = []; // reset hand
            for (let j = 0; j < 2; j++) { this.deck.dealTo(player); } // deal 2 cards to hand
            // nvm dette må bare gjøres ved startTrun()     if (player.allIn) { player.lastAction = call; } // set last action to call if all in so the testRoundOver() works
            //                                              else { player.lastAction = null; } // reset last action for same reason
            player.lastAction = null; // reset last action
            player.turnPot = 0; // reset player pot
        }
        for (let i = 0; i < this.blinds.length; i++) { // deal blinds
            const player = this.players[(this.blindTurn+i)%this.players.length];
            const amt = Math.min(this.blinds[i], player.bank);
            this.playerPut(player, amt);
            this.bumpTurn();
            console.log("Blind: " + player.name + " " + amt);
        }
    }
    endRound() {
        console.log("endRound");
        // find the winner
        let winners = this.getWinners();
        // give the winner the money

        // start a new game startRound()
        // ckeck if a player lost and kick them
        //        this.players.pop(   )
        // this.bumpBlindTurn();     fiks dette med at player blir kicked
    }

    getWinners() { // returns an array of the winner or winners in order if there are multiple
        let candidates = [];
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.lastAction != "fold") {candidates.push(player);}
        }
        if (candidates.length == 1) {console.log("Winner: " + candidates[0].name); return;} // if only one player left then they are the winner
        for (let i = 0; i < candidates.length; i++) {
            // get candidate
            const candidate = candidates[i];
            // get all cards
            let allCards = [];
            for (let i = 0; i < this.board.hand.length; i++) {allCards.push(this.board.hand[i]);}
            for (let i = 0; i < candidate.hand.length; i++) {allCards.push(candidate.hand[i]);}
            // get all hands
            let allHands = [];
            for (let i = 0; i < allCards.length-1; i++) {
                for (let j = i+1; j < allCards.length; j++) {
                    let newHand = allCards.splice(i, 1);
                    newHand.splice(j, 1);
                    allHands.push(newHand);
                }
            }
            // get best hand
            let bestHand = allHands[0];
            for (let i = 1; i < allHands.length; i++) {
                const hand = allHands[i];
                if (hand > bestHand) {bestHand = hand;}
            }
        }
    }

    toString() {
        let res = "";
        res += "Players: \n";
        for (const player in this.players) {
            res += this.players[player].toString() + "\n";
        }
        res += this.board.toString() + "\n";
        res += "Blinds: " + this.blinds.toString();
        return res;
    }

}

function playerRequestInput(playerID, action, game = test, amt = 0) {
    // try to find player
    sender = game.findPlayer(playerID);
    if (sender == null) {console.log("Sender not found"); return false;} // if player not found return false
    amt = document.getElementsByTagName("input")[0].value; // temporary input!!!
    const result = game.playerInput(sender, action, parseInt(amt))
    console.log("playerRequestInput: " + result);
}

function compareHand(hand1, hand2) {

}

function evaluateHand(hand) { 
    // this kinda only works without kickers as tie breaker
    /* encodes hand value as a number. Higher number is better hand. 
    Digits 1-2 are for royal flush, where0 represents no royal flush 
    and a number represents the higest in the flush. 3-4 represents 
    straight flush and so on. The number would be 32 digids long 
    whitch is too long for js so its split into two numbers and 
    returned in an array. */
        // check for royal flush     1-2
        // check for straight flush  3-4
        // check for four of a kind  5-6
        // check for full house      7-8 and 9-10
        // check for flush           11-12
        // check for straight        13-14
        // check for three of a kind 15-16
        // check for two pair        17-18 and 19-20
        // check for pair            21-22
        // check for high card       23-24
        // check for kickers         25-26 and 27-28 and 29-30 and 31-32
    
    // this should work with kickers as tie breakers
    /* Encodes hand value as an array of numbers. Each element represents 
    a combination of cards. Element 1 is for royal flush, where 0 
    represents no royal flush and a number represents the higest in the 
    flush. 2 represents straight flush and so on.*/
        // check for royal flush     1
        // check for straight flush  2
        // check for four of a kind  3
        // check for full house      4 and 5
        // check for flush           6
        // check for straight        7
        // check for three of a kind 8
        // check for two pair        9 and 10
        // check for pair            11
        // check for high card       12
        // check for kickers         13 and 14 and 15 and 16
    
}

console.log("Hello World!")
let test = new Game([new Player("51355", "Erik", 2000), new Player("749720", "Markus", 1000)]);
test.startRound();
//console.log(test.toString());
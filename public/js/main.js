class Holder {
    constructor(hand = []) {
        this.hand = hand;
    }
}

class Player extends Holder {
    constructor(playerID, name, bank, hand = []) {
        super(hand);
        this.playerID = playerID;
        this.name = name;
        this.bank = bank;
        this.lastAction = null;
        this.allIn = false;
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
        this.playerPot;

        // add obvservers
    }

    playerInput(player, action, amt = 0) /*Returns true if sucsess and fasle otherwise*/ {
        const playerSpot = this.players.indexOf(player);
        if (playerSpot == -1) {return false;} // if player not found return false
        if (playerSpot != this.turn) {return false;} // if not players turn return false
        // test validity and do action, if valid return True
        switch (action) {
            case "check":
                const playerPot = this.playerPot[player]; // compare the playerPots. If senders playerpot is grater or equal to all others then do check
                for (const otherPot in this.playerPot) {
                    if (this.playerPot[otherPot] > playerPot) {return false;}
                }
                this.bumpTurn(); 
                console.log("check validated for " + player.name);
                return true;
            case "call":
                let topPot = 0;
                for (let i = 0; i < this.playerPot; i++) {
                    const element = this.playerPot[i];
                    console.log(element);
                }
                for (const otherPot in this.playerPot) {
                    topPot = Math.max(topPot, this.playerPot[otherPot]);
                }
                let callAmt = topPot - this.playerPot[player];
                console.log("callAmt: " + callAmt);
                if (callAmt <= 0) {return false;} // if no one has put in money then call is not valid
                if (player.bank < callAmt) {return false;} // if player does not have enough money then call is not valid
                this.playerPut(player, callAmt);
                this.bumpTurn(); 
                console.log("call validated for " + player.name);
                return true;
            case "raise":
                return false;
            case "bett":
                return false;
            case "fold":    
                return false;
            default:  // if action does not exist return false
                console.log("action not found");
                return false;
        }
        // test if turn over and call nextTurn if so
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
    bumpTurn(amt = 1) {
        this.turn += amt;
        this.turn %= this.players.length;
        console.log("New turn:" + this.turn);
    }
    bumpBlindTurn(amt = 1) {
        this.blindTurn += amt;
        this.blindTurn %= this.players.length;
    }
    oppdaterPot() {
        let sum = 0;
        for (const pot in this.playerPot) {
            sum += this.playerPot[pot];
        }
        this.pot = sum;
    }
    playerPut(player, amount) /*Returns true if sucsess or false otherwise*/ {
        if (amount > player.bank) {return false;} // check if player has enough money
        player.bank -= amount; // remove amount from player bank
        if (player.bank == 0) {player.allIn = true;} // set all in if player is all in
        this.playerPot[player] += amount; // add to player pot
        this.oppdaterPot(); // oppdater pot
        return true;
    }

    trunOver() { // tror det er feil her hvis noen gikk all in og andre fortsatte og spille
        var actions = {"fold": 0, "check": 0, "call": 0, "raise": 0, "bett": 0};
        for (const i in this.players) {
            if (this.players[i].allIn) {continue;}
            if (players[i].lastAction in actions) /*null safty*/ { actions[players[i].lastAction] += 1; }
            else {return false;}
        }
        if (actions["raise"] + actions["bett"] > 1) {return false;}
        return true;
    }

    startRound() {
        this.deck = new Deck();
        this.pot = 0;
        this.playerPot = new Object();
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            player.hand = []; // reset hand
            for (let j = 0; j < 2; j++) { this.deck.dealTo(player); } // deal 2 cards to hand
            // nvm dette må bare gjøres ved startTrun()     if (player.allIn) { player.lastAction = call; } // set last action to call if all in so the testRoundOver() works
            //                                              else { player.lastAction = null; } // reset last action for same reason
            player.lastAction = null; // reset last action
            this.playerPot[player] = 0; // reset player pot
        }
        for (let i = 0; i < this.blinds.length; i++) { // deal blinds
            const player = this.players[(this.blindTurn+i)%this.players.length];
            const amt = Math.min(this.blinds[i], player.bank);
            this.playerPut(player, amt);
        }
    }
    endRound() {
        // give the winner the money
        // start a new game startRound()
        // ckeck if a player lost and kick them
        //        this.players.pop(   )
        // this.bumpBlindTurn();     fiks dette med at player blir kicked
    }

    getRoundWinner() /*returns null if game cant be done*/ {
        // check if the game can be finished
        if (this.board.hand.length != 5) {return null;}
        if (!this.trunOver()) {return null;}
        
        // find the winner
            // idk how tf u do thisssss
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
    const result = game.playerInput(sender, action, amt)
    console.log("playerRequestInput: " + result);
}

console.log("Hello World!")
let test = new Game([new Player("51355", "Erik", 2000), new Player("749720", "Markus", 1000)]);
test.startRound();
console.log(test.toString());
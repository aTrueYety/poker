class Holder {
    constructor(hand = []) {
        this.hand = hand;
    }
}

class Player extends Holder {
    constructor(name, bank, hand = []) {
        super(hand);
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
      this.deck = new Deck();
      this.board = board;
      this.blinds = blinds;
      this.blindTurn = blindTurn;
    }

    addPlayer(player) {
        this.players.push(player);
    }
    bumpTurn() {
        this.turn++;
        this.turn %= this.players.length;
    }
    bumpBlindTurn() {
        this.blindTurn++;
        this.blindTurn %= this.players.length;
    }

    trunOver() { // tror det er feil her hvis noen gikk all in og andre fortsatte og spille
        var actions = {"fold": 0, "check": 0, "call": 0, "raise": 0, "bett": 0};
        for (const lastAction in this.players) {
            if (lastAction in actions) /*null safty*/ { actions[lastAction] += 1; }
            else {return false;}
        }
        if (actions["raise"] + actions["bett"] > 1) {return false;}
        return true;
    }

    startRound() {
        this.deck = new Deck();
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            player.hand = [];
            for (let j = 0; j < 2; j++) {
                this.deck.dealTo(player);
            }
            if (player.allIn) { player.lastAction = call; } 
            else { player.lastAction = null; }
        }
        for (let i = 0; i < this.blinds.length; i++) {
            const element = array[i];
            this.players[(this.blindTurn+i)%this.players.length].bank -= this.blinds[i];
        }
    }

    getRoundWinner() /*returns null if game cant be done*/ {
        // check if the game can be finished
        if (this.board.hand.length != 5) {return null;}
        if (!this.trunOver()) {return null;}
        
        // find the winner
            // idk how tf u do thisssss
    }

    endRound() {
        // give the winner the money
        // start a new game startRound()
        // this.bumpBlindTurn();

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


console.log("Hello World!")
let test = new Game([new Player("test", 1000), new Player("test2", 1000)]);
console.log(test.toString());
class Holder {
    constructor() {
        this.hand = [];
    }
}

class Player extends Holder {
    constructor(name, bank, hand = []) {
        this.name = name;
        this.bank = bank;
        this.hand = hand;
        this.lastAction = null;
    }
}

class Board extends Holder {
    constructor(hand = []) {
        this.hand = hand;
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
        for (let i = 0; i < types; i++) {
            for (let j = 0; j < 13; j++) {
                this.cards.push(new Card(types[i], j));
            }
        }
        this.shuffle();
    }
    shuffle() {
        this.cards.sort(() => (Math.random() - 0.5) ? 1 : -1);
    }
    dealTo(object) {
        object.hand.push(this.cards.pop());
    }
}


class Game {
    constructor(players, board = new Board(), blinds = [10, 20]) {
      this.players = players;
      this.year = year;
      this.turn = 0;
      this.deck = new Deck();
      this.board = board;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    bumpTurn() {
        this.turn++;
        if (this.turn >= this.players.length) {
            this.turn = 0;
        }
    }

    trunOver() {
        var actions = {"fold": 0, "check": 0, "call": 0, "raise": 0, "bett": 0};
        for (const lastAction in this.players) {
            if (lastAction in actions) /*null safty*/ { actions[lastAction] += 1; }
            else {return false;}
        }
        if (actions["raise"] + actions["bett"] > 1) {return false;}
        return true;
    }

    getWinner() /*returns null if game cant be done*/ {
        // check if the game can be finished
        if (this.board.hand.length != 5) {return null;}
        if (!this.trunOver()) {return null;}
        
        // find the winner
            // idk how tf u do thisssss
    }


}


console.log("Hello World!")
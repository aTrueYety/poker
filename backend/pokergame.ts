import { Game, GameAction, PokerPlayerInfo, Suit, Value, Player } from "@/types/types";

export interface Holder {
    hand: Card[]
}

class PokerPlayer extends Player implements Holder {
    public bank: number
    public lastAction: string | null;
    public allIn: boolean
    public turnPot: number
    public roundPot: number
    public hand: Card[]
    public isSpectating: boolean
    public hasForfeit: boolean // If the player has left the game or not perfomed an action in time
    public hasLeft: boolean // If the player has left the game, but can still rejoin the game

    constructor(player: Player, hand: Card[] = [], bank: number = 2000, isSpectating = false) {
        super(player.getId(), player.getUsername(), player.notify, player.romFunctions, player.getAccessToken())
        this.hand = hand;
        this.bank = bank
        this.lastAction = null;
        this.allIn = false;
        this.turnPot = 0;
        this.roundPot = 0;
        this.isSpectating = isSpectating
        this.hasForfeit = false;
        this.hasLeft = false;
    }

    toString(): string {
        return this.getUsername() + ": " + this.hand.toString() + " | Bank: " + this.bank + " | Last action: " + this.lastAction;
    }
}

class PokerBoard implements Holder {
    public hand: Card[] = []
    toString() {
        return "Board: " + this.hand.toString();
    }
}

class Card {
    public suit: Suit
    public value: Value

    constructor(suit: Suit, value: Value) {
        this.suit = suit;
        this.value = value;
    }
    toString() {
        return this.value + " of " + this.suit;
    }
}


class Deck {
    private cards: Card[]
    constructor() {
        this.cards = [];
        for (const suit in Suit) {
            for (let j: number = 0; j < 13; j++) {
                this.cards.push(new Card(Suit[suit as keyof typeof Suit], j + 1));
            }
        }
        this.shuffle();
    }

    getRemainingCards(): number {
        return this.cards.length
    }

    shuffle() {
        this.cards.sort(() => (Math.random() - 0.5));
    }
    dealTo(holder: Holder): boolean {

        let card = this.cards.pop();

        if (!card) {
            return false
        }

        holder.hand.push(card);
        return true
    }
}

// TODO: implement time control
class PokerGame implements Game {
    infoText: string;
    players: PokerPlayer[]
    private turn: number
    private board: PokerBoard
    private blinds: number[]
    private blindTurn: number
    private deck: Deck
    private pot: number
    private turnPot: number
    public ingame: boolean

    constructor(_players: Player[], board = new PokerBoard(), blinds = [10, 20], blindTurn = 0) {
        this.players = _players.map((p) => { return new PokerPlayer(p) })
        this.turn = 0;
        this.board = board;
        this.blinds = blinds;
        this.blindTurn = blindTurn;
        this.deck = new Deck();
        this.pot = 0;
        this.turnPot = 0;
        this.infoText = "Poker - texas holdem";
        this.ingame = false

        // add obvservers
    }

    /**
     * Performs an input from a player
     *
     * @param player The player that wants to perform the action
     * @param action The action to be performed
     * @param amt    The amount being betted
     * @returns      True if the action is performed, false otherwise
     */
    public playerInput(playerid: string, action: GameAction): boolean /*Returns true if sucsess and fasle otherwise*/ {
        console.log("playerInput: " + playerid + " " + action.action + " " + action.amount);

        const player = this.getPokerPlayerById(playerid)

        if (!player) {
            return false
        }

        const res = this.playerAction(player, action.action, action.amount ? action.amount : 0);
        console.log("playerInput: " + res);
        if (res) {
            if (this.testTurnOver()) { this.nextTurn(); }
        }
        return res;
    }

    private getPokerPlayerById(playerid: string) {
        return this.players.find(p => (p.getId() === playerid))
    }

    private playerAction(player: PokerPlayer, action: string, amt = 0) /*Returns true if sucsess and fasle otherwise*/ {

        const playerSpot = this.players.indexOf(player);
        if (playerSpot == -1) { return false; } // if player not found return false
        if (playerSpot != this.turn) { return false; } // if not players turn return false
        // test validity and do action, if valid return True
        switch (action) {
            case "check":
                const turnPot = player.turnPot; // compare the turnPots. If senders turnPot is grater or equal to all others then do check
                for (const player in this.players) {
                    if (this.players[player].turnPot > turnPot) { return false; }
                }
                this.bumpTurn();
                player.lastAction = action;
                console.log("check validated for " + player.getUsername());
                return true;
            case "call":
                var topPot = 0;
                for (let i = 0; i < this.players.length; i++) {
                    const otherPlayer = this.players[i];
                    topPot = Math.max(topPot, otherPlayer.turnPot);
                }
                var callAmt = topPot - player.turnPot; // find call amount
                if (callAmt <= 0) { return false; } // if no one has put in money then call is not valid
                if (player.bank < callAmt) { return false; } // if player does not have enough money then call is not valid
                this.playerPut(player, callAmt);
                this.bumpTurn();
                player.lastAction = action
                console.log("call validated for " + player.getUsername());
                return true;
            case "bet":
                if (amt < Math.max(...(this.blinds))) { return false; } // if bett amount is 0 then bett is not valid   
                var topPot = 0;
                for (let i = 0; i < this.players.length; i++) {
                    const otherPlayer = this.players[i];
                    if (otherPlayer.lastAction == "bet" || otherPlayer.lastAction == "raise") { return false; } // if someone has bett or raised then bett is not valid
                    topPot = Math.max(topPot, otherPlayer.turnPot);
                }
                var callAmt = topPot - player.turnPot; // find call amount
                var totalAmt = amt + callAmt; // find bett amount
                if (player.bank < totalAmt) { return false; } // if player does not have enough money then bett is not valid
                this.playerPut(player, totalAmt);
                this.bumpTurn();
                player.lastAction = action;
                console.log("bett validated for " + player.getUsername());
                return true;
            case "raise":
                if (playerSpot == -1) { console.log("vry bad!"); return false; } // if player index not found return false
                // if ether of the two last players are all in or folded then we need to continue backwards
                const prevRaiseIdx = (playerSpot - 1 + this.players.length) % this.players.length;
                const prevCallIdx = (playerSpot - 2 + this.players.length) % this.players.length;
                const minRaise = this.players[prevRaiseIdx].turnPot - this.players[prevCallIdx].turnPot; // find min raise
                if (amt < minRaise) { return false; } // if raise amount is 0 then raise is not valid
                var topPot = 0;
                var otherBettOrRaise = false;
                for (let i = 0; i < this.players.length; i++) {
                    const otherPlayer = this.players[i];
                    if (otherPlayer.lastAction == "bet" || otherPlayer.lastAction == "raise") { otherBettOrRaise = true; } // if someone has bett or raised then bett is not valid
                    topPot = Math.max(topPot, otherPlayer.turnPot);
                }
                if (!otherBettOrRaise) { return false; } // if no one has bett or raised then raise is not valid
                var callAmt = topPot - player.turnPot; // find call amount
                var totalAmt = amt + callAmt; // find bett amount
                if (player.bank < totalAmt) { return false; } // if player does not have enough money then bett is not valid
                this.playerPut(player, totalAmt);
                this.bumpTurn();
                player.lastAction = action
                console.log("raise validated for " + player.getUsername());
                return true;
            case "fold":
                if (playerSpot == -1) { console.log("vry bad!"); return false; } // if player index not found return false
                // if ether of the two last players are all in or folded then we need to continue backwards
                let lastturnPot = this.players[(playerSpot - 1 + this.players.length) % this.players.length].turnPot; // find last player pot
                if (lastturnPot < player.turnPot) { return false; } // if player has put more or same amount of money than the prev player then fold is not valid
                player.lastAction = action

                if (this.testTurnOver()) { this.nextTurn() }
                this.bumpTurn();
                console.log("fold validated for " + player.getUsername());
                return true;
            default:  // if action does not exist return false
                console.log("action not found");
                return false;
        }
    }

    findPlayer(playerID: string) {
        for (const player in this.players) {
            if (this.players[player].getId() == playerID) { return this.players[player]; }
        }
        return null;
    }

    playerInGame(playerID: string) {
        for (const player in this.players) {
            if (this.players[player].getId() == playerID) { return true; }
        }
        return false;
    }

    addPlayer(player: Player): void {
        if (this.playerInGame(player.getId())) {
            return
        }

        this.players.push(new PokerPlayer(player));
    }

    setSpectator(playerId: string, value: boolean): void {
        const player = this.players.find(p => p.getId() === playerId);
        if (player) {
            player.isSpectating = value;
        }
    }

    removePlayer(playerId: string): void {
        console.log(playerId + " is leaving")

        // if the game is ongoing, mark the player as left
        if (this.ingame) {
            const player = this.players.find(p => p.getId() === playerId);
            if (player) {
                player.hasLeft = true
            }
            return
        }

        // if the game is not ongoing, remove the player
        this.players = this.players.filter(p => {
            return p.getId() !== playerId
        })
        console.log(this.players) //debug
    }

    // This may or may not create an infinite loop :=)
    // If a player is alone and has folded then the game will never end
    bumpTurn(amt = 1) {  // this is not tested if a player has folded or is all in
        var temp = 0;
        this.turn += amt - 1;
        do {
            this.turn++;
            this.turn %= this.players.length;
            temp++;
        } while (this.players[this.turn].allIn || this.players[this.turn].lastAction == "fold");
        if (temp != 1) { console.log("bumpTurn: skipped player"); return false; }
        //console.log("New turn:" + this.turn);
    }

    bumpBlindTurn(amt = 1) {
        this.blindTurn += amt;
        this.blindTurn = (this.blindTurn + this.players.length) % this.players.length;
    }

    updatePot() {
        let sum = 0;
        for (const player in this.players) {
            sum += this.players[player].turnPot;
        }
        this.pot = sum;
    }
    playerPut(player: PokerPlayer, amount: number) /*Returns true if sucsess or false otherwise*/ {
        if (amount > player.bank) { return false; } // check if player has enough money
        player.bank -= amount; // remove amount from player bank
        if (player.bank == 0) { player.allIn = true; } // set all in if player is all in
        player.turnPot += amount; // add to player pot
        this.updatePot(); // oppdater pot
        return true;
    }

    testTurnOver() {
        var inGame = 0;
        var nullAction = 0;
        var otherPot = -1;
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.allIn || player.lastAction == "fold") { continue; }
            inGame++;
            if (player.lastAction == null) { nullAction++; } // if someone has not done an action then return true
            if (otherPot == -1) { otherPot = player.turnPot; continue; } // if otherPot is not set then set it
            if (otherPot != player.turnPot) { return false; } // if otherPot is not the same as turnPot then return false
        }
        if (inGame == 1) { return true; } // if only one player is in game then return true because round over
        if (nullAction > 0) { return false; } // if someone has not done an action then return false
        return true;
    }
    testRoundOver() /*This only runs after testTurnOver is sucsessful*/ {
        if (this.board.hand.length == 5) { return true; } // if board is full and turn over then round over
        var inGame = 0;
        for (let i = 0; i < this.players.length; i++) {
            if (!(this.players[i].allIn || this.players[i].lastAction == "fold")) { inGame++; }
        }
        if (inGame == 1) { return true; } // if only one player is in game then return true
        return false;
    }

    nextTurn() {
        if (this.testRoundOver()) { this.endRound(); return; } // check if round is over
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
            player.roundPot += player.turnPot;
            player.turnPot = 0;
        }
        // reset turn
        this.turn = (this.blindTurn + this.blinds.length) % this.players.length;
    }

    startRound() {
        this.deck = new Deck();
        this.pot = 0;
        this.board.hand = []; // reset board
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            player.hand = []; // reset hand
            for (let j = 0; j < 2; j++) { this.deck.dealTo(player); } // deal 2 cards to hand
            // nvm dette må bare gjøres ved startTrun()     if (player.allIn) { player.lastAction = call; } // set last action to call if all in so the testRoundOver() works
            //                                              else { player.lastAction = null; } // reset last action for same reason
            player.lastAction = null; // reset last action
            player.turnPot = 0; // reset player pot
        }
        this.turn = this.blindTurn; // set turn to blindTurn
        for (let i = 0; i < this.blinds.length; i++) { // deal blinds
            const player = this.players[(this.blindTurn + i) % this.players.length];
            const amt = Math.min(this.blinds[i], player.bank);
            this.playerPut(player, amt);
            this.bumpTurn();
            console.log("Blind: " + player.getUsername() + " " + amt);
        }

        this.players.forEach(player => {
            player.notify("gameStream", { event: "startRound", data: { players: this.players.map(player => { return player.getUsername() }), board: this.board.hand, blinds: this.blinds } })
        })

        this.ingame = true
    }

    endRound() { // this assumes all player in game not folded have the sama amount of money in the pot or are all in
        console.log("endRound");
        // finish roundpot
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            player.roundPot += player.turnPot;
            player.turnPot = 0;
        }
        // find the winners and give them the money $$$$$$$$$$$$$$$
        // give the winner the money
        // get the winner(s) with least money in the pot and put them in array 'a'
        // get the player pot of an alement in 'a' and put the value in amount.
        // make sidepot. Put 'amount' money from each playerPot into the sidepot.
        // equaly share the sidepot too all winners. Remove 'a' form winners as they are fully paid now.
        // repeat until all winners are paid
        let playersToInclude = [...this.players];
        do {
            let winners = [...this.getWinners(playersToInclude)];
            winners.forEach(winner => { playersToInclude.splice(playersToInclude.indexOf(winner), 1); });  // remove winners from playersToInclude
            do {
                // get the winner(s) with least money in the pot and put them in array minPotWinners
                let minPotWinners = [winners[0]];
                for (let i = 0; i < winners.length; i++) {
                    const winner = winners[i];
                    if (winner.roundPot < minPotWinners[0].roundPot) { minPotWinners = [winner]; }
                    if (winner.roundPot == minPotWinners[0].roundPot && winner != minPotWinners[0]) { minPotWinners.push(winner); }
                }
                let minWinnerPot = minPotWinners[0].roundPot; // get the player pot of an alement in minPotWinners
                let sidepot = 0;
                for (let i = 0; i < this.players.length; i++) { // Put money from each playerPot into the sidepot.
                    const player = this.players[i];
                    const amt = Math.min(player.roundPot, minWinnerPot);
                    sidepot += amt;
                    player.roundPot -= amt;
                }
                // equaly share the sidepot too all winners. Remove minPotWinners form winners as they are fully paid now.
                const share = Math.floor(sidepot / winners.length); // idk what to do with the rest
                for (let i = 0; i < winners.length; i++) {
                    winners[i].bank += share;
                    console.log(winners[i])
                    console.log("won: " + share);
                }
                for (let i = 0; i < minPotWinners.length; i++) {
                    const toRemove = minPotWinners[i];
                    winners.splice(winners.indexOf(toRemove), 1);
                }
            } while (winners.length > 0);
            this.updatePot();
        } while (this.pot > 0);

        // ckeck if a player lost and kick them
        let blindTurnOffset = 0;
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.bank <= 0) {
                let playerIndex = this.players.indexOf(player);
                this.players.splice(playerIndex, 1);
                console.log("Player lost: " + player.getUsername());
                if (playerIndex <= this.blindTurn) { blindTurnOffset--; } // could be just <. Needs testing.
            }
        }
        this.bumpBlindTurn(1 + blindTurnOffset);

        // check if game is over
        this.ingame = false

        // remove all players that has left the game
        this.players.forEach(player => {
            if (player.hasLeft) {
                this.removePlayer(player.getId())
            }
        })

        // start a new game
        //this.startRound()
    }

    // if the winner(s) are all in then run this again with all players without the winner(s) to find where the eventual rest of pot should go
    getWinners(subjects = this.players): PokerPlayer[] { // returns an array of the winner or winners there are multiple in a tie. Takes in an array of players
        let candidates: PokerPlayer[] = [];
        for (const element of subjects) {
            const player = element;
            if (player.lastAction != "fold") { candidates.push(player); }
        }
        if (candidates.length == 1) {
            console.log("Winner: " + candidates[0].getUsername());
            return [];
        } // if only one player left then they are the winner

        let bestHands = [];
        for (const element of candidates) {
            // get candidate
            const candidate = element;
            // get all cards
            // let allCards = [];
            // for (let i = 0; i < this.board.hand.length; i++) {allCards.push(this.board.hand[i]);}
            // for (let i = 0; i < candidate.hand.length; i++) {allCards.push(candidate.hand[i]);}
            let allCards = [...this.board.hand, ...candidate.hand]; // small ace
            let allCardsBigAce = [...allCards]; // big ace

            // get all hands. This will often have duplicates but that shouldn't be a problem (pls)
            let allHands = [];
            for (let i = 0; i < allCards.length - 1; i++) { // small ace
                for (let j = i + 1; j < allCards.length; j++) {
                    var newHand = [...allCards];
                    newHand.splice(j, 1);
                    newHand.splice(i, 1);
                    allHands.push([...newHand]);
                }
            }
            for (let i = 0; i < allCardsBigAce.length - 1; i++) { // bid ace
                for (let j = i + 1; j < allCardsBigAce.length; j++) {
                    var newHand = [...allCardsBigAce];
                    newHand.splice(j, 1);
                    newHand.splice(i, 1);
                    allHands.push([...newHand]);
                }
            }
            // get best hand for candidate
            let bestHand = allHands[0];
            for (let i = 1; i < allHands.length; i++) {
                const hand = allHands[i];
                // console.log([...hand]);
                // console.log(evaluateHand([...hand]));
                const comparison = this.compareHands([...hand], [...bestHand]);
                if (comparison) { bestHand = [...hand]; }
            }
            bestHands.push(bestHand);
        }
        // get best hand and assosiated candidate
        let winners = [candidates[0]];
        let bestHand = [bestHands[0]];
        for (let i = 1; i < bestHands.length; i++) {
            const candidate = candidates[i];
            const hand = bestHands[i];
            const comparison = this.compareHands(hand, bestHand[0]);
            if (comparison === true) {
                bestHand = [hand];
                winners = [candidate];
            } else if (comparison === 0) {
                bestHand.push(hand);
                winners.push(candidate);
            }
        }
        return winners;
    }

    compareHands(hand1: Card[], hand2: Card[]) /*Returns true if hand one is greater or false if hand two is greater. Returns 0 if they are equal*/ {
        const hand1Value = this.evaluateHand(hand1);
        const hand2Value = this.evaluateHand(hand2);
        for (let i = 0; i < hand1Value.length; i++) {
            if (hand1Value[i] > hand2Value[i]) { return true; } // impliment console.log hva som gjorde at spiller vant
            if (hand1Value[i] < hand2Value[i]) { return false; }
        }
        return 0;
    }

    evaluateHand(hand: Card[]) {
        // this should work with kickers as tie breakers
        /* Encodes hand value as an array of numbers. Each element represents 
        a combination of cards. Element 1 is for royal flush, where 0 
        represents no royal flush and a number represents the higest in the 
        flush. 2 represents straight flush and so on.*/
        // check for royal flush     0
        // check for straight flush  1
        // check for four of a kind  2
        // check for full house      3 and 4
        // check for flush           5 -
        // check for straight        6 -
        // check for three of a kind 7 
        // check for two pair        8 (second is placed in 9) -
        // check for pair            9 -
        // check for high card and kickers       10, 11, 12, 13 and 14 in order form high to low  -

        let res = [];
        for (let i = 0; i < 14; i++) { res.push(0); }
        hand.sort(function (a, b) { return b.value - a.value });
        let pairs = []
        let testSuit = hand[0].suit;
        res[5] = 1;
        let testValue = hand[0].value;
        res[6] = testValue;
        for (let i = 0; i < hand.length; i++) {
            const card = hand[i];
            const otherCards = [...hand]; // check for pair
            otherCards.splice(i, 1); // remove this card from otherCards, may be a bug here where it removed the card from the hand array. Needs testing
            let similars = 0;
            for (let j = i; j < otherCards.length; j++) {
                if (otherCards[j] == null) { continue; }
                if (card.value == otherCards[j].value) {
                    similars++;
                    //otherCards[j] = null
                }
            }
            if (similars == 1) { pairs.push(card.value); }
            // check for three of a kind 7
            if (similars == 2) { res[7] = card.value; }
            // check for four of a kind  2
            if (similars == 3) { res[2] = card.value; }
            // check for flush           5
            if (card.suit != testSuit) { res[5] = 0; }
            // check for straight        6
            if (card.value != testValue - i) { res[6] = 0; }
        }
        // check for two pair        8 (second is placed in 9)
        pairs.sort(function (a, b) { return a - b });
        if (pairs.length > 1) { res[8] = pairs[1] }
        // check for pair            9
        if (pairs.length > 0) { res[9] = pairs[0]; }
        // check for full house      3 and 4
        if (pairs.length > 1) { if (res[7] != 0 && res[8] != 0) { res[3] = res[7]; res[4] = res[8]; } }
        else if (res[7] != 0 && res[9] != 0) { res[3] = res[7]; res[4] = res[9]; }
        // check for straight flush  1
        if (res[5] != 0 && res[6] != 0) { res[1] = res[6]; }
        // check for royal flush     0
        if (res[1] == 14) { res[0] = 1; }
        // check for high card and kickers       10, 11, 12, 13 and 14 in order form high to low
        for (let i = 0; i < hand.length; i++) { res[10 + i] = hand[i].value; }

        return res;
    }

    public getState(userId: string) {
        return {
            cards: this.players.find(p => p.getId() === userId)?.hand,
            otherPlayers: this.players.map(player => {
                return {
                    username: player.getUsername(),
                    id: player.getId(),
                    pot: player.roundPot,
                    lastAction: player.lastAction,
                    bank: player.bank,
                    allIn: player.allIn
                } as PokerPlayerInfo
            }),

            board: this.board.hand,
            blinds: this.blinds,
            pot: this.pot,
            turn: this.turn,
            turnPot: this.turnPot,
            spectating: this.players.find(p => p.getId() === userId)?.isSpectating,
            allSpectators: this.players.filter(p => p.isSpectating).map(p => p.getUsername())
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


export { PokerGame as PokerGame, PokerPlayer as PokerPlayer, Card as Card, Deck as Deck }
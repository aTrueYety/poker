import { Player, RoomFunctions, Suit, Value } from "@/types/types";
import { Deck, PokerGame, PokerPlayer, Holder, Card } from "../../games/pokergame";
import { beforeEach, describe, expect, test } from '@jest/globals';


describe("testCard", () => {
    let card: Card;

    beforeEach(() => {
        card = new Card(Suit.CLUBS, Value.ACE)
    });

    test("testCardValue", () => {
        expect(card.value).toBe(14);
    })

    test("testCardSuit", () => {
        expect(card.suit).toBe("clubs");
    })

    test("testCardToString", () => {
        expect(card.toString()).toBe("14 of clubs");
    })
})

describe("testDeck", () => {
    let deck: Deck;

    beforeEach(() => {
        deck = new Deck();
    });

    test("testDeckPopulated", () => {
        expect(deck.getRemainingCards()).toBe(52);
    })

    test("testDealCard", () => {
        let dealTarget: Holder = { hand: [] };
        deck.dealTo(dealTarget);
        expect(deck.getRemainingCards()).toBe(51);
        expect(dealTarget.hand.length).toBe(1);
    })

})

describe("testPokergame", () => {
    let game: PokerGame;
    let player1: PokerPlayer;
    let player2: PokerPlayer;
    let player3: PokerPlayer;

    beforeEach(() => {
        player1 = new PokerPlayer(new Player("1", "player1", (a) => { }, {} as RoomFunctions, "1"))
        player2 = new PokerPlayer(new Player("2", "player2", (a) => { }, {} as RoomFunctions, "2"))
        player3 = new PokerPlayer(new Player("3", "player3", (a) => { }, {} as RoomFunctions, "3"))
        game = new PokerGame([player1, player2, player3]);
    });

    test("testAddPlayer", () => {
        let player4 = new PokerPlayer(new Player("4", "player4", (a) => { }, {} as RoomFunctions, "4"))
        game.addPlayer(player4);
        expect(game.players.length).toBe(4);
    })
});


describe("testHandEvaluation", () => {
    let game: PokerGame;

    beforeEach(() => {
        game = new PokerGame([]);
    });


    test("testEqualHands", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.SIX)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.SIX)
        ]

        expect(game.compareHands(hand1, hand2)).toBe(0);
        expect(game.compareHands(hand2, hand1)).toBe(0);
    })

    test("testHighCard", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.EIGHT)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.SEVEN)
        ]

        // Since hand1 has a higher final card, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    })

    test("testPair", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.FIVE)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.SEVEN)
        ]

        // Since hand1 has a pair, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    })

    test("testHigherPair", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.EIGHT),
            new Card(Suit.HEARTS, Value.EIGHT)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FIVE),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.SEVEN)
        ]

        // Since hand1 has a higher pair, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    })


    test("testTwoPair", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.FIVE)

        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.EIGHT),
            new Card(Suit.DIAMONDS, Value.EIGHT),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.ACE)
        ]

        // Since hand2 has two pairs, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });

    test("testHigherTwoPair", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.EIGHT)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.CLUBS, Value.THREE),
            new Card(Suit.HEARTS, Value.ACE)
        ]


        // Since hand1 has a higher pair, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    })

    test("testThreeOfAKind", () => {

        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.SEVEN)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.ACE)
        ]

        // Since hand1 has a three of a kind, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });


    test("testHigherThreeOfAKind", () => {

        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.SEVEN)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.TWO),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.ACE)
        ]

        // Since hand1 has a higher three of a kind, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });

    test("testStraight", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.SIX)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.SEVEN)
        ]

        // Since hand1 has a straight, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });

    test("testHigherStraight", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.SPADES, Value.FOUR),
            new Card(Suit.CLUBS, Value.FIVE),
            new Card(Suit.HEARTS, Value.SIX)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.FOUR),
            new Card(Suit.SPADES, Value.FIVE),
            new Card(Suit.CLUBS, Value.SIX),
            new Card(Suit.HEARTS, Value.SEVEN)
        ]

        // Since hand2 has a higher straight, it should win
        expect(game.compareHands(hand1, hand2)).toBe(false);
        expect(game.compareHands(hand2, hand1)).toBe(true);
    });


    test("testFlush", () => {
        let hand1: Card[] = [
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.EIGHT),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.SIX)
        ]

        let hand2: Card[] = [
            new Card(Suit.CLUBS, Value.TEN),
            new Card(Suit.DIAMONDS, Value.JACK),
            new Card(Suit.SPADES, Value.QUEEN),
            new Card(Suit.CLUBS, Value.KING),
            new Card(Suit.HEARTS, Value.ACE)
        ]

        // Since hand1 has a flush, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });

    test("testHigherFlush", () => {
        let hand1: Card[] = [
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.SIX)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.KING),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.SIX)
        ]

        // Since hand1 has a higher flush, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });


    test("testFullHouse", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.TWO),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.FOUR)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.SIX)
        ]

        // Since hand1 has a full house, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });


    test("testHigherFullHouse", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.TWO),
            new Card(Suit.CLUBS, Value.FOUR),
            new Card(Suit.HEARTS, Value.FOUR)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.FIVE)
        ]

        // Since hand2 has a higher full house, it should win
        expect(game.compareHands(hand1, hand2)).toBe(false);
        expect(game.compareHands(hand2, hand1)).toBe(true);
    });

    test("testFourOfAKind", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.TWO),
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.HEARTS, Value.FOUR)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.ACE),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.FIVE)
        ]

        // Since hand1 has a four of a kind, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });

    test("testHigherFourOfAKind", () => {
        let hand1: Card[] = [
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.SPADES, Value.TWO),
            new Card(Suit.CLUBS, Value.TWO),
            new Card(Suit.HEARTS, Value.FOUR)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.CLUBS, Value.THREE),
            new Card(Suit.HEARTS, Value.THREE),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.DIAMONDS, Value.TWO)
        ]

        // Since hand2 has a higher four of a kind, it should win
        expect(game.compareHands(hand1, hand2)).toBe(false);
        expect(game.compareHands(hand2, hand1)).toBe(true);
    });


    test("testStraightFlush", () => {
        let hand1: Card[] = [
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.FOUR),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.SIX)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.CLUBS, Value.THREE),
            new Card(Suit.HEARTS, Value.THREE),
            new Card(Suit.SPADES, Value.THREE),
            new Card(Suit.DIAMONDS, Value.TWO)
        ]
        // Since hand1 has a straight flush, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });


    test("testHigherStraightFlush", () => {
        let hand1: Card[] = [
            new Card(Suit.DIAMONDS, Value.TWO),
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.FOUR),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.SIX)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.THREE),
            new Card(Suit.DIAMONDS, Value.FOUR),
            new Card(Suit.DIAMONDS, Value.FIVE),
            new Card(Suit.DIAMONDS, Value.SIX),
            new Card(Suit.DIAMONDS, Value.SEVEN)
        ]

        // Since hand2 has a higher straight flush, it should win
        expect(game.compareHands(hand1, hand2)).toBe(false);
        expect(game.compareHands(hand2, hand1)).toBe(true);
    });


    test("testRoyalFlush", () => {
        let hand1: Card[] = [
            new Card(Suit.DIAMONDS, Value.TEN),
            new Card(Suit.DIAMONDS, Value.JACK),
            new Card(Suit.DIAMONDS, Value.QUEEN),
            new Card(Suit.DIAMONDS, Value.KING),
            new Card(Suit.DIAMONDS, Value.ACE)
        ]

        let hand2: Card[] = [
            new Card(Suit.DIAMONDS, Value.NINE),
            new Card(Suit.DIAMONDS, Value.TEN),
            new Card(Suit.DIAMONDS, Value.JACK),
            new Card(Suit.DIAMONDS, Value.QUEEN),
            new Card(Suit.DIAMONDS, Value.JACK)
        ]

        // Since hand1 has a royal flush, it should win
        expect(game.compareHands(hand1, hand2)).toBe(true);
        expect(game.compareHands(hand2, hand1)).toBe(false);
    });
})
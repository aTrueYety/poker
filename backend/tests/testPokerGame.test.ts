import { Player, Suit, Value } from "@/types/types";
import { Deck, PokerGame, PokerPlayer, Holder, Card } from "../pokergame";
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
        deck.dealTo({ hand: [] } as Holder);
        expect(deck.getRemainingCards()).toBe(51);
    })

})

describe("testPokergame", () => {



});
import { Player } from "@/backend/lobbyhandler";

/**
 * A message to be sent in the chat
 */
export type Message = {
    content: string;
    author: string;
};

/**
 * Barebones information about a lobby
 */
export type LobbyInfo = {
    id: string;
    players: string[];
    status: string;
};

/**
 * Suit of a card
 */
export enum Suit {
    SPADES = "spades",
    HEARTS = "hearts",
    DIAMONDS = "diamonds",
    CLUBS = "clubs"
}

/**
 * Value of a card
 */
export enum Value {
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    JACK = 11,
    QUEEN = 12,
    KING = 13,
    ACE = 14
}

/**
 * A card in a deck
 */
export type Card = {
    value: Value;
    suit: Suit;
}

/**
 * Action a player can take in poker
 */
export enum PokerAction {
    CHECK = "check",
    CALL = "call",
    BET = "bet",
    RAISE = "raise",
    FOLD = "fold"
}

/**
 * Generic interface for a game
 */
export interface Game {
    players: Player[];
    startRound(): void;
}




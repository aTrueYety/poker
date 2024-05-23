import { PokerGame } from "@/backend/pokergame";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

/**
 * A message to be sent in the chat
 */
export type Message = {
    content: string;
    author: PlayerInfo;
};


export interface MessageTransfer {
    gameId: string;
    message: Message;
}

/**
 * Barebones information about a lobby
 */
export type LobbyInfo = {
    id: string;
    players: string[];
    status: LobbyStatus;
    rated: boolean;
    owner: string; //change this to a uuid
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

export type GameAction = {
    action: string;
    amount?: number;
}


/**
 * Generic interface for a game
 */
export interface Game {
    players: Player[];
    infoText: string;
    startRound(): void;
    addPlayer(player: Player): void;
    removePlayer(playerId: string): void;
    playerInput(playerid: string, action: GameAction): boolean
    getState(userId: string): any;
    setSpectator(playerId: string, value: boolean): void;
    playerInGame(playerId: string): boolean;
}

/**
 * Different statuses a lobby can have
 */
export enum LobbyStatus {
    WAITING,
    IN_PROGRESS,
    FINISHED
}

export type TimeControl = {
    time: number;
    timeIncrement: number;
}

export const DefaultTimeControls = {
    BLITZ: { time: 300, timeIncrement: 5 } as TimeControl,
    RAPID: { time: 600, timeIncrement: 10 } as TimeControl,
    BULLET: { time: 120, timeIncrement: 3 } as TimeControl
} as const;

export interface GameSettings {
    rated: boolean;
    timeControl: TimeControl;
}

/**
 * A player that with an access token, socket and username
 */
export class Player {
    private id: string
    private username: string
    private accessToken: string
    private socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

    constructor(id: string, username: string, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, accessToken: string) {
        this.id = id
        this.username = username
        this.socket = socket
        this.accessToken = accessToken
    }

    public getSocket(): Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
        return this.socket
    }

    public getId(): string {
        return this.id
    }

    public getUsername(): string {
        return this.username
    }

    public getAccessToken(): string {
        return this.accessToken
    }

    public toPlayerInfo(): PlayerInfo {
        return {
            id: this.id,
            username: this.username
        }
    }
}

/**
 * Lobby errors
 */
export enum LobbyError {
    GAME_NOT_FOUND,
    GAME_FULL,
    GAME_IN_PROGRESS,
    GAME_NOT_IN_PROGRESS,
    GAME_ALREADY_JOINED,
    GAME_NOT_JOINED,
    NO_GAME_SET
}

export enum GameEvent {
    ACTION,
    END_OF_ROUND,
    START,
    END
}

export interface GameStream {
    event: GameEvent;
    player: PlayerInfo;
    message: any;
}

// TODO: Include more player info to be displayed to the front end
export interface PlayerInfo {
    id: string;
    username: string;
}

export interface PokerPlayerInfo extends PlayerInfo {
    pot: number,
    lastAction: string,
    bank: number,
    allIn: boolean
}




import { PokerGame } from "../backend/games/pokergame";
import { Socket } from "socket.io";
import { DefaultEventsMap, EventNames, EventParams } from "socket.io/dist/typed-events";
import { SessionUser } from "./next-auth";
import { Games } from "@/backend/games";

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
    data?: any;
}

export interface FourInarowAction extends GameAction {
    action: "place";
    data: {
        column: number;
    }
}


/**
 * Generic interface for a game
 */
export interface Game {
    players: Player[];
    infoText: string;
    addWinListener: (listener: (player: Player) => void) => void;
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
 * A function that sends a message to a user.
 */
export type NotifyUserFunction = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>["emit"];

/**
 * A function that allows a player to join and leave rooms
 */
export interface RoomFunctions {
    leave: (room: string) => Promise<void>;
    join: (room: string) => Promise<void>;
}

export type ackStatus = "ok" | "notFound" | "error";

export type userData = {
    id: string | undefined;
    username: string | undefined;
    accessToken: string | undefined;
}

/**
 * Events that the client can send to the server
 */
export interface ClientToServerEvents {

    //Lobby functionality
    joinGame: (data: {
        user: userData,
        gameId: string
    }, callback: (data: { status: ackStatus, inProgress?: boolean }) => void) => void;
    leaveGame: (data: { gameId: string, user: userData }) => void;
    gameExists: (gameid: string, callback: (data: { status: ackStatus }) => void) => void;
    ownerOf: (data: { gameId: string, userId?: string }, callback: (data: { status: ackStatus, owner?: boolean }) => void) => void;
    createGame:
    (data: {
        user: SessionUser
    }, callback: (data: { status: ackStatus, code?: string }) => void) => void;
    getPlayers: (data: { gameId: string }, callback: (data: { status: ackStatus, players?: String[] }) => void) => void;
    getGameSettings: (data: { gameId: string }, callback: (data: { status: ackStatus, errorMessage?: LobbyError, settings?: GameSettings }) => void) => void;
    getGameType: (data: { gameId: string }, callback: (data: { status: ackStatus, errorMessage?: LobbyError, gameType?: string }) => void) => void;
    updateGameSettings: (data: { gameId: string, userId?: string, settings: GameSettings | undefined }, callback: (data: { status: ackStatus, errorMessage?: LobbyError | string; }) => void) => void;
    setGame: (data: { gameId: string, userId?: string, gameType: keyof typeof Games }, callback: (data: { status: ackStatus, errorMessage?: LobbyError | string }) => void) => void;
    startGame: (data: { gameId: string, userId?: string }, callback: (data: { status: ackStatus, errorMessage?: string | LobbyError }) => void) => void;

    //Chats
    sendMessage: (data: MessageTransfer) => void;
    getChatMessages: (data: { gameId: string }, callback: (messages: Message[]) => void) => void;
    chatMessage: (data: MessageTransfer) => void;


    fetchGames: () => void;

    //Game functionality
    performGameAction: (data: { gameId: string, userId?: string, username?: string, action: GameAction }, callback: (data: { status: ackStatus, errorMessage?: string | LobbyError }) => void) => void;
    getGameState: (data: { gameId: string, userId?: string }, callback: (data: { status: ackStatus, errorMessage?: string | LobbyError, gameState?: GameState }) => void) => void;
}

/**
 * Events that the server can send to the client
 */
export interface ServerToClientEvents {
    ongoingGamesStream: (data: LobbyInfo[]) => void;
    playersUpdate: (data: string[]) => void;
    playerUpdate: (data: PlayerInfo[]) => void;
    playerLeft: (data: { userId: string }) => void;

    gameSettingsUpdate: (settings: GameSettings) => void;
    gameTypeUpdate: (gameType: keyof typeof Games) => void;
    owner: () => void;
    notOwner: () => void;
    gameStream: (data: GameStream) => void;
    chatMessage: (data: Message) => void;
}


/**
 * A player that with an access token, socket and username
 */
export class Player {
    private id: string
    private username: string
    private accessToken: string
    public notify: NotifyUserFunction
    public romFunctions: RoomFunctions
    public isSpectating: boolean = false;
    public hasLeft: boolean = false;

    constructor(id: string, username: string, notify: NotifyUserFunction, roomFunctions: RoomFunctions, accessToken: string) {
        this.id = id
        this.username = username
        this.notify = notify
        this.romFunctions = roomFunctions;
        this.accessToken = accessToken
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
    WIN,
    END
}

export interface GameStream {
    event: GameEvent;
    player?: PlayerInfo;
    message?: any;
}

export interface GameState {
    allSpectators: PlayerInfo[];
    otherPlayers: PlayerInfo[];
    spectating: boolean;
    turn: number;
}

export enum PokerAction {
    FOLD = "fold",
    CALL = "call",
    RAISE = "raise",
    CHECK = "check",
    BET = "bet"
}

export interface PokerGameState extends GameState {
    allSpectators: PlayerInfo[];
    otherPlayers: PokerPlayerInfo[];
    yourPlayer: PokerPlayerInfo;
    blinds: number[];
    board: Card[];
    cards: Card[];
    pot: number;
    yourTurn: boolean;
    spectating: boolean;
    turn: number;
    turnpot: number;
    availableActions: PokerAction[];
}

// TODO: Include more player info to be displayed to the front end
export interface PlayerInfo {
    id: string;
    username: string;
}

export interface PokerPlayerInfo extends PlayerInfo {
    pot: number,
    turnpot: number,
    lastAction: string,
    bank: number,
    allIn: boolean
}

export interface FourInarowGameState extends GameState {
    otherPlayers: PlayerInfo[];
    board: number[][]
    yourTurn: boolean;
    yourPosition: number;
    turn: number;
    spectating: boolean;
}

export interface FourInarowWinInfo {
    player: number;
    winningLine: number[][];
}





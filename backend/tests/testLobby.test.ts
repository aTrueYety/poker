import { Game, GameEvent, LobbyError, LobbyStatus, Player, RoomFunctions } from "@/types/types";
import Lobby from "../lobby";
import { expect } from "@jest/globals";
import { Games } from "../games";
import { jest, test, describe, beforeEach } from "@jest/globals";

describe("testLobby", () => {
    let lobby: Lobby;
    let joinCallback = jest.fn();
    let leaveCallback = jest.fn();
    let notifyCallback = jest.fn();

    beforeEach(() => {
        lobby = new Lobby("ABCD", "1", "player1")
        joinCallback.mockClear();
        leaveCallback.mockClear();
        notifyCallback.mockClear();
        let roomFunctions = { join: joinCallback, leave: leaveCallback } as RoomFunctions;
        lobby.addPlayer(new Player("1", "player1", notifyCallback, roomFunctions, "1"))
    });

    test("testGetPlayersAsUsername", () => {
        expect(lobby.getPlayersAsUsername()).toEqual(["player1"])
    });

    test("testAddPlayer", () => {
        lobby.addPlayer(new Player("2", "player2", (a) => { }, { join: (a) => { }, leave: (a) => { } } as RoomFunctions, "2"))
        expect(lobby.getPlayers().length).toBe(2);
    });

    test("testAddPlayerAlreadyInLobby", () => {
        lobby.addPlayer(new Player("1", "player1UniqueUserName", (a) => { }, { join: (a) => { }, leave: (a) => { } } as RoomFunctions, "coolnewaccesstoken"))
        expect(lobby.getPlayers().length).toBe(1);
        expect(lobby.getPlayers()[0].getUsername()).toBe("player1")
        expect(lobby.getPlayers()[0].getAccessToken()).toBe("1")
    });

    test("testIsOwner", () => {
        expect(lobby.isOwner("1")).toBe(true)
    });

    test("testChangeOwner", () => {
        lobby.addPlayer(new Player("2", "player2", (a) => { }, { join: (a) => { }, leave: (a) => { } } as RoomFunctions, "2"))
        lobby.changeOwner("2")
        expect(lobby.getOwner()).toBe("2")
    });

    test("testRemovePlayer", () => {
        lobby.removePlayer("1")
        expect(lobby.getPlayers().length).toBe(0);
    });

    test("testRemovePlayerNotInLobby", () => {
        lobby.removePlayer("2")
        expect(lobby.getPlayers().length).toBe(1);
    });

    test("testSetGame", () => {
        lobby.setGame("POKER")
        expect(lobby.getGame()?.players.length).toBe(1)
    })

    test("testNoGameSet", () => {
        expect(lobby.getGame()).toBe(null)
    });

    test("testStartGame", () => {
        lobby.setGame("POKER");
        lobby.startGame();
        expect(lobby.status).toBe(LobbyStatus.IN_PROGRESS);
        expect(notifyCallback.mock.calls).toHaveLength(3);
        expect(notifyCallback.mock.calls[1][1]).toStrictEqual({ event: GameEvent.START }); // Second message to socket should be game start
    });

    test("testJoinGameInProgress", () => {
        lobby.setGame("POKER");
        lobby.startGame();

        let nc = jest.fn();
        lobby.addPlayer(new Player("2", "player2", nc, { join: (a) => { }, leave: (a) => { } } as RoomFunctions, "2"))
        expect(lobby.getGame()?.players.length).toBe(2)
        expect(nc.mock.calls).toHaveLength(2);
        expect(nc.mock.calls[1][1]).toStrictEqual({ event: GameEvent.START }); // New player should receive game start message
    });

    test("testStartGameNoGameSet", () => {
        expect(lobby.startGame()).toBe(LobbyError.NO_GAME_SET);
        expect(lobby.status).toBe(LobbyStatus.WAITING)
    });

    test("testAddMessage", () => {
        lobby.addMessage("1", "Hello")
        expect(lobby.getMessages().length).toBe(1)
    })

    test("testAddMessagePlayerNotInLobby", () => {
        lobby.addMessage("2", "Hello")
        expect(lobby.getMessages().length).toBe(0)
    });
});
import { Game, LobbyError, LobbyStatus, Player, RoomFunctions } from "@/types/types";
import Lobby from "../lobby";
import { expect } from "@jest/globals";
import { Games } from "../games";
import { jest } from "@jest/globals";

describe("testLobby", () => {
    let lobby: Lobby;

    beforeEach(() => {
        lobby = new Lobby("ABCD", "1", "player1")
        lobby.addPlayer(new Player("1", "player1", (a) => { }, { join: (a) => { }, leave: (a) => { } } as RoomFunctions, "1"))
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
        lobby.setGame("POKER")
        lobby.startGame()
        expect(lobby.status).toBe(LobbyStatus.IN_PROGRESS)
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
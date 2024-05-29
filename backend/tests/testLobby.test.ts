import { Player, RoomFunctions } from "@/types/types";
import Lobby from "../lobby";
import { expect } from "@jest/globals";

describe("testLobby", () => {
    let lobby: Lobby;

    beforeEach(() => {
        lobby = new Lobby("ABCD", "1", "player1")
    });

    test("testAddPlayer", () => {
        lobby.addPlayer(new Player("2", "player2", (a) => { }, { join: (a) => { }, leave: (a) => { } } as RoomFunctions, "2"))
        expect(lobby.getPlayers().length).toBe(1);
    });
});
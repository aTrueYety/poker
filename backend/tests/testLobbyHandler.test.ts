import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import LobbyHandler from '../lobbyhandler';
import { Player, RoomFunctions } from '@/types/types';

describe("testLobbyHandler", () => {
    let lobbyHandler: LobbyHandler;

    beforeEach(() => {
        lobbyHandler = new LobbyHandler();
    });

    test("testGenerateCode", () => {
        expect(lobbyHandler.findValidCode()).toBeTruthy();
    });

    test("testCreateLobby", () => {
        expect(lobbyHandler.createLobby("id", "username")).toBeTruthy();
        expect(lobbyHandler.getGames().length).toBe(1);
    });

    test("testSamePlayerCreateLobby", () => {
        let code = lobbyHandler.createLobby("id", "username");
        expect(lobbyHandler.createLobby("id", "username")).toBe(code);
    });

    test("testRemoveLobby", () => {
        let leavefn = jest.fn();
        let joinfn = jest.fn();
        let notifyfn = jest.fn();
        let code = lobbyHandler.createLobby("id", "username") as string;

        lobbyHandler.getLobbyByCode(code)?.addPlayer(new Player("id", "username", notifyfn, { join: joinfn, leave: leavefn } as RoomFunctions, "token"));

        lobbyHandler.removeLobby(code);

        expect(lobbyHandler.getGames().length).toBe(0);
        expect(leavefn).toBeCalled();
        expect(notifyfn).toHaveBeenCalled();
    });

    test("testRemoveLobbyNotExists", () => {
        lobbyHandler.removeLobby("code");
        expect(lobbyHandler.getGames().length).toBe(0);
    });

    test("testRemoveOneOfManyLobbies", () => {
        let code = lobbyHandler.createLobby("id1", "username1") as string;
        lobbyHandler.createLobby("id2", "username2");
        lobbyHandler.createLobby("id3", "username3");

        lobbyHandler.removeLobby(code);

        expect(lobbyHandler.getGames().length).toBe(2);
        expect(lobbyHandler.getLobbyByCode(code)).toBeFalsy();
    });
});
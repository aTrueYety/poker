import { beforeEach, describe, expect, test } from '@jest/globals';
import LobbyHandler from '../lobbyhandler';

describe("testLobbyHandler", () => {
    let lobbyHandler: LobbyHandler;

    const player1 = { "userId": "1", "username": "player1" };
    const player2 = { "userId": "2", "username": "player2" };

    beforeEach(() => {
        lobbyHandler = new LobbyHandler();
    });

    test("testGenerateCode", () => {
        expect(lobbyHandler.findValidCode()).toBeTruthy();
    });

    test("testCreateLobby", () => {
        expect(lobbyHandler.createLobby(player1.userId, player1.username)).toBeTruthy();
        expect(lobbyHandler.getGames().length).toBe(1);
    });
});
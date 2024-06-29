import { describe, test, beforeEach, beforeAll, jest, expect } from "@jest/globals";
import { FourInarowBoard, FourInarowGame } from "../../games/fourInarowGame";
import { FourInarowWinInfo, Player, RoomFunctions } from "@/types/types";


describe("testFourInarowBoard", () => {
    let board: FourInarowBoard;

    beforeEach(() => {
        board = new FourInarowBoard(6, 7);
    })

    test("testPlacePiece", () => {
        expect(board.placePiece(1, 0)).toBe(true);
        expect(board.placePiece(1, 1)).toBe(true);
        expect(board.placePiece(1, 2)).toBe(true);
        expect(board.placePiece(1, 3)).toBe(true);
        expect(board.placePiece(1, 4)).toBe(true);
        expect(board.placePiece(1, 5)).toBe(true);
        expect(board.placePiece(1, 6)).toBe(true);
    })

    test("testPlacePieceInvalidPlayernum", () => {
        expect(board.placePiece(0, 0)).toBe(false);
    })

    test("testPlacePieceInvalidColumn", () => {
        expect(board.placePiece(1, -1)).toBe(false);
        expect(board.placePiece(1, 7)).toBe(false);
    })

    test("testCheckWinHorizontal", () => {
        board.placePiece(1, 0);
        board.placePiece(1, 1);
        board.placePiece(1, 2);
        board.placePiece(1, 3);

        expect(board.checkWin()).toStrictEqual({
            player: 1, winningLine: [
                [5, 0],
                [5, 1],
                [5, 2],
                [5, 3]
            ]
        } as FourInarowWinInfo)
    })

    test("testCheckWinVertical", () => {
        board.placePiece(1, 0);
        board.placePiece(1, 0);
        board.placePiece(1, 0);
        board.placePiece(1, 0);

        expect(board.checkWin()).toStrictEqual({
            player: 1, winningLine: [
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0]
            ]
        } as FourInarowWinInfo)
    })

    test("testCheckWinDiagonalUpRight", () => {
        board.placePiece(1, 0);

        board.placePiece(2, 1);
        board.placePiece(1, 1);

        board.placePiece(2, 2);
        board.placePiece(2, 2);
        board.placePiece(1, 2);

        board.placePiece(2, 3);
        board.placePiece(2, 3);
        board.placePiece(2, 3);
        board.placePiece(1, 3);

        expect(board.checkWin()).toStrictEqual({
            player: 1, winningLine: [
                [5, 0],
                [4, 1],
                [3, 2],
                [2, 3]
            ]
        } as FourInarowWinInfo)
    })

    test("testCheckWinDiagonalUpLeft", () => {
        board.placePiece(2, 0)
        board.placePiece(2, 0)
        board.placePiece(2, 0)
        board.placePiece(1, 0)

        board.placePiece(2, 1)
        board.placePiece(2, 1)
        board.placePiece(1, 1)

        board.placePiece(2, 2)
        board.placePiece(1, 2)

        board.placePiece(1, 3)

        expect(board.checkWin()).toStrictEqual({
            player: 1, winningLine: [
                [5, 3],
                [4, 2],
                [3, 1],
                [2, 0]
            ]
        } as FourInarowWinInfo)
    })

    test("testNoWinNoPiecesPlaced", () => {
        expect(board.checkWin()).toBe(false);
    })

    test("testNoWinNotEnoughPiecesHorizontal", () => {
        board.placePiece(1, 0);
        board.placePiece(1, 1);
        board.placePiece(1, 2);

        expect(board.checkWin()).toBe(false);
    })

    test("testNoWinNotEnoughPiecesVertical", () => {
        board.placePiece(1, 0);
        board.placePiece(1, 0);
        board.placePiece(1, 0);

        expect(board.checkWin()).toBe(false);
    })

    test("testNoWinNotEnoughPiecesDiagonalUpRight", () => {
        board.placePiece(1, 0);

        board.placePiece(2, 1);
        board.placePiece(1, 1);

        board.placePiece(2, 2);
        board.placePiece(2, 2);
        board.placePiece(1, 2);

        expect(board.checkWin()).toBe(false);
    })

    test("testNoWinNotEnoughPiecesDiagonalUpLeft", () => {
        board.placePiece(2, 0)
        board.placePiece(2, 0)
        board.placePiece(2, 0)
        board.placePiece(1, 0)

        board.placePiece(2, 1)
        board.placePiece(2, 1)
        board.placePiece(1, 1)

        board.placePiece(2, 2)
        board.placePiece(1, 2)

        expect(board.checkWin()).toBe(false);
    });

    test("testNoWinBlockedHorizontal", () => {
        board.placePiece(1, 0);
        board.placePiece(1, 1);
        board.placePiece(1, 2);
        board.placePiece(2, 3);
        board.placePiece(1, 4);
        board.placePiece(1, 5);
        board.placePiece(1, 6);

        expect(board.checkWin()).toBe(false);
    })

    test("testNoWinBlockedVertical", () => {
        board.placePiece(1, 0);
        board.placePiece(1, 0);
        board.placePiece(1, 0);
        board.placePiece(2, 0);
        board.placePiece(1, 0);
        expect(board.checkWin()).toBe(false);
    });

    test("testNoWinBlockedDiagonalUpRight", () => {
        board.placePiece(1, 0);

        board.placePiece(1, 1);
        board.placePiece(1, 1);

        board.placePiece(2, 2);
        board.placePiece(2, 2);
        board.placePiece(2, 2);

        board.placePiece(2, 3);
        board.placePiece(2, 3);
        board.placePiece(2, 3);
        board.placePiece(1, 3);

        board.placePiece(2, 4);
        board.placePiece(2, 4);
        board.placePiece(2, 4);
        board.placePiece(1, 4);
        board.placePiece(1, 4);

        expect(board.checkWin()).toBe(false);
    })

    test("testNoWinBlockedDiagonalUpLeft", () => {
        board.placePiece(2, 0)
        board.placePiece(2, 0)
        board.placePiece(2, 0)
        board.placePiece(1, 0)
        board.placePiece(1, 0)

        board.placePiece(2, 1)
        board.placePiece(2, 1)
        board.placePiece(2, 1)
        board.placePiece(1, 1)

        board.placePiece(2, 2)
        board.placePiece(2, 2)
        board.placePiece(2, 2)

        board.placePiece(1, 3)
        board.placePiece(1, 3)

        board.placePiece(2, 4)

        expect(board.checkWin()).toBe(false);

    })
})

describe("testFourInarowGame", () => {
    let game: FourInarowGame;
    let player1: Player;
    let player2: Player;
    let players: Player[];

    let player1Notify = jest.fn();
    let player2Notify = jest.fn();
    let player1Leave = jest.fn();
    let player2Leave = jest.fn();
    let player1Join = jest.fn();
    let player2Join = jest.fn();

    let socketMocks = [player1Notify, player2Notify, player1Leave, player2Leave, player1Join, player2Join]

    beforeAll(() => {
        player1 = new Player("1", "player1", player1Notify, { join: player1Join, leave: player1Leave } as RoomFunctions, "1")
        player2 = new Player("2", "player2", player2Notify, { join: player2Join, leave: player2Leave } as RoomFunctions, "2")
        players = [player1, player2]
    })

    beforeEach(() => {
        socketMocks.forEach(mock => {
            mock.mockClear();
        });

        game = new FourInarowGame(players, 6, 7);
    })

    test("testStartRound", () => {
        game.startRound();

        expect(game.ingame).toBe(true);
    })

})
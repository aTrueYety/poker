import { FourInarowAction, FourInarowGameState, FourInarowWinInfo, Game, GameAction, GameEvent, GameState, GameStream, Player } from "@/types/types";

export class FourInarowBoard {
    public height: number;
    public width: number;

    // 0 = empty, 1 = player1, 2 = player2, etc.
    private board: number[][];

    constructor(height: number, width: number) {
        this.height = height;
        this.width = width;
        this.board = Array.from({ length: height }, () => Array(width).fill(0));
    }

    public getBoard(): Readonly<number>[][] {
        return this.board;
    }

    /**
     * Places a piece on the board.
     * @param playerNum  The number of the player placing the piece.
     * @param column  The column to place the piece in.
     * @returns  True if the piece was placed, false if the column is full or playerNum is 0.
     */
    public placePiece(playerNum: number, column: number): boolean {
        if (column < 0 || column >= this.width) {
            return false;
        }

        if (playerNum === 0) {
            return false;
        }

        for (let i = this.height - 1; i >= 0; i--) {
            if (this.board[i][column] === 0) {
                this.board[i][column] = playerNum;
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if a player has won the game.
     * 
     * Assumes that only one player is in a winning position
     * @returns The player number and the winning line, or false if no player has won.
     */
    public checkWin(): FourInarowWinInfo | false {
        let res: FourInarowWinInfo = {
            player: 0,
            winningLine: []
        }

        // Check horizontal
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width - 3; j++) {
                if (this.board[i][j] !== 0 && this.board[i][j] === this.board[i][j + 1] && this.board[i][j] === this.board[i][j + 2] && this.board[i][j] === this.board[i][j + 3] && this.board[i][j] !== 0) {
                    res.player = this.board[i][j];

                    res.winningLine = [
                        [i, j],
                        [i, j + 1],
                        [i, j + 2],
                        [i, j + 3]
                    ]
                    return res;
                }
            }
        }

        // Check vertical
        for (let i = 0; i < this.height - 3; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.board[i][j] !== 0 && this.board[i][j] === this.board[i + 1][j] && this.board[i][j] === this.board[i + 2][j] && this.board[i][j] === this.board[i + 3][j] && this.board[i][j] !== 0) {
                    res.player = this.board[i][j];
                    res.winningLine = [
                        [i, j],
                        [i + 1, j],
                        [i + 2, j],
                        [i + 3, j]
                    ]
                    return res;
                }
            }
        }

        //Check diagonal
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {

                //Up to the right
                if (i > 2 && j < this.width - 3) {
                    if (this.board[i][j] == this.board[i - 1][j + 1] && this.board[i][j] == this.board[i - 2][j + 2] && this.board[i][j] == this.board[i - 3][j + 3] && this.board[i][j] !== 0) {
                        res.player = this.board[i][j];
                        res.winningLine = [
                            [i, j],
                            [i - 1, j + 1],
                            [i - 2, j + 2],
                            [i - 3, j + 3]
                        ]
                        return res;
                    }
                }

                //Up to the left
                if (i > 2 && j > 2) {
                    if (this.board[i][j] == this.board[i - 1][j - 1] && this.board[i][j] == this.board[i - 2][j - 2] && this.board[i][j] == this.board[i - 3][j - 3] && this.board[i][j] !== 0) {
                        res.player = this.board[i][j];
                        res.winningLine = [
                            [i, j],
                            [i - 1, j - 1],
                            [i - 2, j - 2],
                            [i - 3, j - 3]
                        ]
                        return res;
                    }
                }
            }
        }

        // No win, return false
        return false;
    }
}

export class FourInarowGame implements Game {
    public players: Player[];
    public spectators: Player[] = [];
    public board: FourInarowBoard | null = null;
    public width: number;
    public height: number;
    public infoText: string = "Four in a row"
    public ingame: boolean = false;
    private winListeners: ((player: Player) => void)[] = [];

    private turn: number = 0;

    constructor(players: Player[] = [], height: number = 6, width: number = 7) {
        this.players = players;
        this.height = height;
        this.width = width;
    }

    addWinListener(listener: (player: Player) => void): void {
        this.winListeners.push(listener);
    }

    startRound(): void {
        // Move spectators to players
        this.players = this.players.concat(this.spectators);
        this.spectators = [];


        this.board = new FourInarowBoard(this.height, this.width);

        // Set turn to zero
        this.turn = 0;

        this.ingame = true;
    }

    addPlayer(player: Player): void {
        if (this.playerInGame(player.getId())) {
            return
        }

        this.players.push(player);
    }

    removePlayer(playerId: string): void {
        // if the game is ongoing, mark the player as left
        if (this.ingame) {
            const player = this.players.find(p => p.getId() === playerId);
            if (player) {
                player.hasLeft = true
            }
            return
        }

        // if the game is not ongoing, remove the player
        this.players = this.players.filter(p => {
            return p.getId() !== playerId
        })
    }

    playerInput(playerid: string, action: FourInarowAction): boolean {
        switch (action.action) {
            case "place":
                if (this.placePiece(playerid, action.data.column)) {

                    // Check if a player has won
                    const win = this.board?.checkWin();
                    if (win) {
                        this.handleWin(win);
                    }
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    private handleWin(win: FourInarowWinInfo) {
        let winningPlayer = this.players[win.player - 1];

        this.ingame = false;

        this.players.forEach(player => {
            player.notify("gameStream", {
                player: winningPlayer.toPlayerInfo(),
                event: GameEvent.WIN,
                message: win
            } as GameStream)
        })

        this.winListeners.forEach(listener => {
            listener(winningPlayer);
        })
    }

    private placePiece(playerId: string, column: number): boolean {
        console.log("placing piece")
        if (this.players[this.turn].getId() !== playerId) {
            return false;
        }

        if (this.board?.placePiece(this.turn + 1, column)) {
            this.bumpTurn();
            return true;
        }

        return false;
    }

    private bumpTurn(): void {
        this.turn = (this.turn + 1) % this.players.length;
    }

    getState(userId: string): FourInarowGameState {
        console.log(this.players)
        return {
            allSpectators: this.spectators.map(player => player.toPlayerInfo()),
            otherPlayers: this.players.filter(player => player.getId() !== userId).map(player => player.toPlayerInfo()),
            board: this.board?.getBoard() ?? [],
            yourTurn: this.players[this.turn]?.getId() === userId,
            yourPosition: this.players.findIndex(player => player.getId() === userId),
            turn: this.turn,
            spectating: this.spectators.some(player => player.getId() === userId)
        }
    }

    setSpectator(playerId: string, value: boolean): void {
        const player = this.players.find(p => p.getId() === playerId);
        if (player) {
            player.isSpectating = value;
        }
    }

    playerInGame(playerId: string): boolean {
        return this.players.some(player => player.getId() === playerId);
    }

}
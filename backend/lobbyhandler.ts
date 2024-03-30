import { DefaultTimeControls, Game, GameEvent, GameSettings, LobbyError, LobbyInfo, LobbyStatus, Message, Player, TimeControl } from "@/types/types"
import { PokerGame } from "./pokergame";

export const Games = {
    POKER: PokerGame,
    // when more games are added, add them here
} as const;

class Lobby {
    private id: string
    private owner: string
    private ownerUsername: string //TODO: Change this to a uuid instead
    public status: LobbyStatus
    private players: Player[]
    private messages: Message[]
    private game: Game
    public rated: boolean = false
    public timeControl: TimeControl = DefaultTimeControls.RAPID


    constructor(id: string, owner: string, ownerUsername: string) {
        this.id = id
        this.owner = owner
        this.status = LobbyStatus.WAITING
        this.players = []
        this.messages = []
        this.game = null;
        this.ownerUsername = ownerUsername

        console.log("lobby created by " + owner + " id: " + id)
    }

    public getSettings(): GameSettings {
        return {
            rated: this.rated,
            timeControl: this.timeControl
        }
    }

    public setSettings(settings: GameSettings) {
        this.rated = settings.rated
        this.timeControl = settings.timeControl
    }

    public getGame(): Game {
        return this.game
    }

    public setGame(gametype: keyof typeof Games): LobbyError | null {

        if (gametype === undefined) {
            return LobbyError.NO_GAME_SET
        }

        if (this.game instanceof Games[gametype]) {
            // This set game to the same game
            return null
        }

        if (this.status !== LobbyStatus.WAITING) {
            return LobbyError.GAME_IN_PROGRESS
        }

        this.game = new Games[gametype]([...this.players])
        console.log(this.game.players)
    }

    public startGame(): LobbyError | null {
        if (!this.game) {
            return LobbyError.NO_GAME_SET
        }

        if (this.status !== LobbyStatus.WAITING) {
            return LobbyError.GAME_IN_PROGRESS
        }

        // Change status to in progress
        this.status = LobbyStatus.IN_PROGRESS

        // Send start message to clients
        this.players.forEach(player => {
            player.getSocket().emit("gameStream", { event: GameEvent.START })
        })



        this.game.startRound()
    }


    /**
     * @returns All messages in the lobby chat
     */

    getMessages(): Message[] {
        return this.messages
    }

    /**
     * Adds a message to the lobby chat.
     *
     * @param  author The author of the message. This is NOT the id of the author
     * @param  content The content of the message
     */

    addMessage(author: string, content: string) {
        this.messages.push({ author: author, content: content })
    }

    /**
     * Gets all players in the lobby as an array of usernames.
     *
     * @returns {Array} An array of usernames
     */
    getPlayersAsUsername(): string[] {
        return this.players.map(player => {
            return player.getUsername()
        })
    }

    /**
     * Adds a player to the lobby.
     *
     * @param player The Id of the player to add
     */
    addPlayer(player: Player) {
        // Check if the player already exists in the lobby
        if (this.playerExists(player.getId())) {
            return
        }

        player.getSocket().join(this.id)
        this.players.push(player)
        this.game?.addPlayer(player)



        // Check if a game is in progress
        if (this.status === LobbyStatus.IN_PROGRESS) {
            // Send start message to the player
            player.getSocket().emit("gameStream", { event: GameEvent.START })

            // Set the player as a spectator
            this.getGame().setSpectator(player.getId(), true)
        }
    }

    /**
     * Removes a player from the lobby.
     * 
     * If the player is the owner of the lobby, ownership wil transfer to the next player.
     * @param id The id of the player to remove
     */
    removePlayer(id: string) {
        this.players = this.players.filter(player => {
            if (player.getId() === id) {

                // Leave the socket room
                player.getSocket().leave(this.id)

                // Leave the game
                this.game?.removePlayer(player.getId())

                // Check if the player is the owner of the lobby
                if (player.getId() === this.owner) {
                    if (!this.changeOwner(this.players[0].getId())) {
                        // There are no players left in the lobby
                    }
                }

                return false
            }

            return true
        })
    }

    /**
     * Transfers ownership of the lobby to another player.
     *
     * @param {*} ownerId The id of the new owner
     * @returns {boolean} True if the owner was changed, false if the player does not exist in the lobby
     */
    changeOwner(ownerId: string): boolean {
        if (this.players.find(player => player.getId() === ownerId)) {
            this.owner = ownerId
            return true
        }

        return false
    }

    /**
     * @param  id  The id to check
     * @returns  True if the player with the given id is the owner of the lobby, false if the player is not the owner
     */
    isOwner(id: string) {
        return this.owner === id
    }

    /**
     * Checks if a player with the given id exists in the lobby.
     *
     * @param id  The id of the player to check for
     * @returns True if the player exists, false if the player does not exist
     */

    playerExists(id: string) {
        return this.players.find(player => {
            return player.getId() === id
        })
    }

    getId(): string {
        return this.id
    }

    getPlayers(): Player[] {
        return this.players
    }

    getOwner(): string {
        return this.owner
    }

    getOwnerUsername(): string {
        return this.ownerUsername

    }

}

class LobbyHandler {
    private lobbies: Lobby[]
    constructor() {
        this.lobbies = []
    }

    /**
     * Creates a new lobby and gives ownership to the user with the given id.
     *
     * @param userId  The id of the user that will own the lobby
     * @returns  The code of the new lobby, or false if no code could be generated
     */
    createLobby(userId: string, username: string) {
        let lobby = this.getLobbyByOwner(userId)
        if (lobby) {
            return lobby.getId()
        }

        let code = this.findValidCode()

        if (!code) {
            return false
        }

        this.lobbies.push(new Lobby(code, userId, username))

        return code
    }

    /**
     * Removes a lobby from the lobbyHandler.
     *
     * @param code  The code of the lobby to remove
     */

    removeLobby(code: string) {
        // this is a bit ugly
        this.lobbies = this.lobbies.filter(lobby => {
            if (lobby.getId() !== code) {
                // Kick all players
                lobby.getPlayers().forEach(player => {
                    player.getSocket().leave(code)
                    // player.socket.emit("kicked" + lobby.id)
                })
                return true
            }
        })
    }

    /**
     * Gets a lobby by the owner of the lobby.
     *
     * @param userId  The id of the user that owns the lobby
     * @returns  The lobby that the user owns, or undefined if the user does not own a lobby
     */
    getLobbyByOwner(userId: string): Lobby | undefined {
        return this.lobbies.find(lobby => {
            return lobby.getOwner() === userId
        })
    }

    /**
     * Gets a lobby by the code of the lobby.
     *
     * @param code  The code of the lobby
     * @returns The lobby with the given code, or undefined if the lobby does not exist
     */
    getLobbyByCode(code: string) {
        return this.lobbies.find(lobby => {
            return lobby.getId() === code
        })
    }

    /**
     * @returns All games in the lobbyHandler
     */
    getGames(): LobbyInfo[] {
        return this.lobbies.map(lobby => {
            return {
                id: lobby.getId(),
                players: lobby.getPlayersAsUsername(),
                status: lobby.status,
                owner: lobby.getOwnerUsername(),
                rated: lobby.rated
            }
        });
    }

    /**
     * Finds a valid code for a new lobby.
     *
     * @returns A valid code for a new lobby, or false if no code could be generated
     */
    findValidCode() {
        let maxIterations = 100
        let i = 0

        while (i < maxIterations) {
            let code = this.generateCode()

            if (!this.getLobbyByCode(code)) {
                return code
            }
            i += 1
        }
        return false
    }

    /**
     * Generates a new lobby code, but does not check if the code is already in use.
     *
     * @returns A random lobby code
     */
    generateCode() {
        let length = 4;
        let result = "";
        const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const charlenght = char.length;
        let i = 0;

        //stolen from stackoverflow
        while (i < length) {
            result += char.charAt(Math.floor(Math.random() * charlenght));
            i += 1;
        }

        return result;
    }
}
export { LobbyHandler as LobbyHandler, Player as Player, Lobby as Lobby }

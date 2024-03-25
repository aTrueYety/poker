import { LobbyInfo, Message } from "@/types/types"
import { Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

class Player {
    private id: string
    private username: string
    private socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

    constructor(id: string, username: string, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        this.id = id
        this.username = username
        this.socket = socket
        console.log("player created with id: " + id + " and username: " + username)
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
}

class Lobby {
    private id: string
    private owner: string
    public status: string // change this into an enum type
    private players: Player[]
    private messages: Message[]
    private game: any


    constructor(id: string, owner: string) {
        this.id = id
        this.owner = owner
        this.status = "waiting"
        this.players = []
        this.messages = []
        this.game = null;

        console.log("lobby created by " + owner + " id: " + id)
    }



    /**
     * @returns {Array} All messages in the lobby chat
     */

    getMessages(): Message[] {
        return this.messages
    }

    /**
     * Adds a message to the lobby chat.
     *
     * @param {*} author The author of the message. This is NOT the id of the author
     * @param {*} content The content of the message
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
     * @param {*} player The Id of the player to add
     */
    addPlayer(player: Player) {
        if (this.playerExists(player.getId())) {
            return
        }

        player.getSocket().join(this.id)
        this.players.push(player)
    }
    /**
     * Removes a player from the lobby.
     * 
     * If the player is the owner of the lobby, ownership wil transfer to the next player.
     * @param {*} id The id of the player to remove
     */
    removePlayer(id: string) {
        this.players = this.players.filter(player => {
            if (player.getId() !== id) {

                // Leave the socket room
                player.getSocket().leave(this.id)

                // Check if the player is the owner of the lobby
                if (player.getId() === this.owner) {
                    if (!this.changeOwner(this.players[0].getId())) {
                        // There are no players left in the lobby
                    }
                }

                return true
            }
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
     * @param {*} id  The id to check
     * @returns  {boolean} True if the player with the given id is the owner of the lobby, false if the player is not the owner
     */
    isOwner(id: string) {
        return this.owner === id
    }

    /**
     * Checks if a player with the given id exists in the lobby.
     *
     * @param {*} id  The id of the player to check for
     * @returns  {boolean} True if the player exists, false if the player does not exist
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

}

class LobbyHandler {
    private lobbies: Lobby[]
    constructor() {
        this.lobbies = []
    }

    /**
     * Creates a new lobby and gives ownership to the user with the given id.
     *
     * @param {*} userId  The id of the user that will own the lobby
     * @returns  {string} The code of the new lobby, or false if no code could be generated
     */
    createLobby(userId: string) {
        let lobby = this.getLobbyByOwner(userId)
        if (lobby) {
            return lobby.getId()
        }

        let code = this.findValidCode()

        if (!code) {
            return false
        }

        this.lobbies.push(new Lobby(code, userId))

        return code
    }

    /**
     * Removes a lobby from the lobbyHandler.
     *
     * @param {*} code  The code of the lobby to remove
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
     * @param {*} userId  The id of the user that owns the lobby
     * @returns  {Lobby} The lobby that the user owns, or undefined if the user does not own a lobby
     */
    getLobbyByOwner(userId: string): Lobby | undefined {
        return this.lobbies.find(lobby => {
            return lobby.getOwner() === userId
        })
    }

    /**
     * Gets a lobby by the code of the lobby.
     *
     * @param {*} code  The code of the lobby
     * @returns  {Lobby} The lobby with the given code, or undefined if the lobby does not exist
     */
    getLobbyByCode(code: string) {
        return this.lobbies.find(lobby => {
            return lobby.getId() === code
        })
    }

    /**
     * @returns {Array} All games in the lobbyHandler
     */
    getGames(): LobbyInfo[] {
        return this.lobbies.map(lobby => {
            return {
                id: lobby.getId(),
                players: lobby.getPlayersAsUsername(),
                status: lobby.status
            }
        });
    }

    /**
     * Finds a valid code for a new lobby.
     *
     * @returns {string} A valid code for a new lobby, or false if no code could be generated
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
     * @returns {string} A random lobby code
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

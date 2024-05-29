import { LobbyStatus, Player, Message, Game, TimeControl, GameSettings, DefaultTimeControls, LobbyError, GameEvent } from "@/types/types"
import { Games } from "./games"

export default class Lobby {
    private id: string
    private owner: string
    private ownerUsername: string //TODO: Change this to a uuid instead
    public status: LobbyStatus
    private players: Player[]
    private messages: Message[]
    private game: Game | null = null
    public rated: boolean = false
    public timeControl: TimeControl = DefaultTimeControls.RAPID


    constructor(id: string, owner: string, ownerUsername: string) {
        this.id = id
        this.owner = owner
        this.status = LobbyStatus.WAITING
        this.players = []
        this.messages = []
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

    public getGame(): Game | null {
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
        return null;
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

        this.game.startRound();
        return null;
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
     * @param  playerId The Id of the author 
     * @param  content The content of the message
     */

    addMessage(playerId: string, content: string) {
        let player = this.players.find(player => player.getId() === playerId)

        if (!player) {
            return
        }

        this.messages.push({ author: { id: player.getId(), username: player.getUsername() }, content: content })
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

        let rejoining: boolean | undefined = this.game?.playerInGame(player.getId())
        this.game?.addPlayer(player)

        // Check if a game is in progress
        if (this.status === LobbyStatus.IN_PROGRESS) {
            // Send start message to the player
            player.getSocket().emit("gameStream", { event: GameEvent.START })

            // Set the player as a spectator
            if (!rejoining) {
                this.getGame()?.setSpectator(player.getId(), true)
            }
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
                    // Transfer ownership to the next player
                    // TODO: Implement this along with a better way of transmitting the ownership
                    // back to the front end
                    /*
                    if (!this.changeOwner(this.players[0].getId())) {
                        // There are no players left in the lobby
                    }
                    */
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
        let player = this.players.find(player => player.getId() === ownerId)

        // this is a bad way of doing it but at this point i dont care
        if (player) {
            let lastOwner = this.players.find(player => player.getId() === this.owner)
            lastOwner?.getSocket().emit("notOwner")
            this.owner = ownerId
            player.getSocket().emit("owner")
            return true
        }

        return false
    }

    /**
     * @param  id  The id to check
     * @returns  True if the player with the given id is the owner of the lobby, false if the player is not the owner
     */
    isOwner(id: string): boolean {
        console.log(this.owner === id)
        return this.owner === id
    }

    /**
     * Checks if a player with the given id exists in the lobby.
     *
     * @param id  The id of the player to check for
     * @returns True if the player exists, false if the player does not exist
     */

    playerExists(id: string): boolean {
        return this.players.find(player => {
            return player.getId() === id
        }) !== undefined
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
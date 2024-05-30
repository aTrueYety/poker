import { LobbyInfo, Player } from "@/types/types"
import Lobby from "./lobby"


export default class LobbyHandler {
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
            if (lobby.getId() === code) {
                // Kick all players
                lobby.getPlayers().forEach(player => {
                    player.romFunctions.leave(code)
                    player.notify("lobbyDeleted");
                })
                return false;
            }

            return true
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

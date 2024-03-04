import { Server } from 'socket.io'
import { createServer } from 'node:http'
import express from 'express'
import ip from 'ip'

const app = express()
const port = 4000


//const hostname = ip.address()

const server = createServer(app)
const io = new Server(server,
    {
        cors: {
            origin: "*", //BAD!
            methods: ["GET", "POST"]
        }
    })

server.listen(port, () => {
    console.log("ws running")
})


class Player {
    constructor(id, username) {
        this.id = id
        this.username = username
        console.log("player created with id: " + id + " and username: " + username)
    }
}

class Lobby {
    constructor(id, owner) {
        this.id = id
        this.owner = owner
        this.status = "waiting"
        this.players = []

        console.log("lobby created by " + owner + " id: " + id)
    }

    getPlayersAsUsername() {
        return this.players.map(player => {
            return player.username
        })
    }


    addPlayer(player) {
        if (this.playerExists(player.id)) {
            return
        }

        this.players.push(player)
    }

    removePlayer(id) {
        this.players = this.players.filter(player => {
            return player === id
        })

        console.log(this.players)
    }

    playerExists(id) {
        return this.players.find(player => {
            return player.id === id
        })
    }

}

class LobbyHandler {
    constructor() {
        this.lobbies = []
    }

    createLobby(userId) {
        let lobby = this.getLobbyByOwner(userId)
        if (lobby) {
            return lobby.id
        }

        let code = this.findValidCode()

        if (!code) {
            return false
        }

        this.lobbies.push(new Lobby(code, userId))

        io.emit("ongoingGamesStream", this.getGames())

        return code
    }

    removeLobby(code) {
        this.lobbies = this.lobbies.filter(lobby => {
            return lobby.id === code
        })
    }

    getLobbyByOwner(userId) {
        return this.lobbies.find(lobby => {
            return lobby.owner === userId
        })
    }

    getLobbyByCode(code) {
        return this.lobbies.find(lobby => {
            return lobby.id === code
        })
    }

    getGames() {
        return this.lobbies.map(lobby => { return { id: lobby.id, owner: lobby.owner, players: lobby.getPlayersAsUsername(), status: lobby.status } })
    }

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

let lobbyHandler = new LobbyHandler()

io.on("connection", socket => {
    console.log("connected")
    socket.on("fetchGames", data => {
        socket.emit("ongoingGamesStream", lobbyHandler.getGames())
    })


    socket.on("disconnect", data => {
        console.log("disconnected")
    })

    socket.on("joinGame", (data, callback) => {
        let lobby = lobbyHandler.getLobbyByCode(data.gameId)

        if (!lobby) {
            callback({ status: "notFound" })
            return
        }

        console.log(data)

        lobby.addPlayer(new Player(data.user.id, data.user.username))
        callback({ status: "ok" })

        io.emit("ongoingGamesStream", lobbyHandler.getGames())
    })

    socket.on("leaveGame", data => {
        let lobby = lobbyHandler.getLobbyByCode(data.gameId)

        if (!lobby) {
            return
        }

        lobby.removePlayer(data.user.id)

        console.log(data.user.username + " left game: " + data.gameId)

        if (lobby.players.length === 0) {
            lobbyHandler.removeLobby(data.gameId)
        }

        console.log("players in lobby: " + lobby.getPlayersAsUsername())

        io.emit("ongoingGamesStream", lobbyHandler.getGames())
    })

    socket.on("createGame", (user, callback) => {
        let code = lobbyHandler.createLobby(user.id)
        console.log("lobby created with code: " + code)

        if (code) {
            callback({ status: "ok", code: code })
            return
        }

        callback({ status: "error" })
    })

})



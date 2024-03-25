import { Server } from 'socket.io'
import { createServer } from 'node:http'
import express from 'express'
import ip from 'ip'
import { LobbyHandler, Player } from './lobbyhandler.js'
//import { PokerGame, PokerPlayer, Deck, Card } from './pokergame.js'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const port = 4000

// TEMPORARY SETTINGS
const deleteLobbyOnEmpty = false;


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

let lobbyHandler = new LobbyHandler()

io.on("connection", socket => {
    socket.on("fetchGames", data => {
        socket.emit("ongoingGamesStream", lobbyHandler.getGames())
    })


    socket.on("disconnect", data => {
    })

    socket.on("joinGame", (data, callback) => {
        let lobby = lobbyHandler.getLobbyByCode(data.gameId)

        if (!lobby) {
            callback({ status: "notFound" })
            return
        }

        lobby.addPlayer(new Player(data.user.id, data.user.username, socket))
        callback({ status: "ok" })

        io.emit("ongoingGamesStream", lobbyHandler.getGames())
    })

    socket.on("leaveGame", data => {
        let lobby = lobbyHandler.getLobbyByCode(data.gameId)

        if (!lobby) {
            return
        }

        lobby.removePlayer(data.user.id)

        if (lobby.getPlayers().length === 0 && deleteLobbyOnEmpty) {
            console.log("removing lobby" + lobby)
            lobbyHandler.removeLobby(data.gameId)
        }

        io.emit("ongoingGamesStream", lobbyHandler.getGames())
    })

    socket.on("createGame", (user, callback) => {
        let code = lobbyHandler.createLobby(user.id)
        console.log("lobby created with code: " + code)

        if (code) {
            callback({ status: "ok", code: code })
            io.emit("ongoingGamesStream", lobbyHandler.getGames())
            return
        }

        callback({ status: "error" })
    })

    socket.on("getChatMessages", (data, cb) => {
        let lobby = lobbyHandler.getLobbyByCode(data.gameId)

        if (!lobby) {
            cb([])
            return
        }

        // Respond with chat messages
        cb(lobby.getMessages())
    })

    socket.on("sendMessage", (data) => {
        // Get lobby
        const lobby = lobbyHandler.getLobbyByCode(data.gameId)

        // Check if user is in lobby
        if (!lobby?.playerExists(data.authorId)) {

            // Send error message?
            return
        }

        // Add message to lobby
        lobby.addMessage(data.author, data.content)

        // Send message to all players in lobby
        io.to(data.gameId).emit("chatMessage", data)
    })

    socket.on("gameExists", (gameId, cb) => {
        if (lobbyHandler.getLobbyByCode(gameId)) {
            cb({ status: "ok" })
            return
        }
        cb({ status: "error" })
    })

    socket.on("ownerOf", (data, cb) => {
        const lobby = lobbyHandler.getLobbyByCode(data.gameId)
        if (!lobby) {
            cb({ status: "error" })
            return
        }

        if (lobby.isOwner(data.id)) {
            cb({ status: "ok", owner: true })
            return
        }

        cb({ status: "ok", owner: false })
    })

    socket.on("getPlayers", (data, cb) => {
        const lobby = lobbyHandler.getLobbyByCode(data.gameId)
        if (!lobby) {
            cb({ status: "error" })
            return
        }

        cb({ status: "ok", players: lobby.getPlayersAsUsername() })
    })

    socket.on("startGame", (data, cb) => {
        const lobby = lobbyHandler.getLobbyByCode(data.gameId)

        if (!lobby) {
            cb({ status: "error" })
            return
        }
    })

    socket.on("performGameAction", (data, cb) => {
        const lobby = lobbyHandler.getLobbyByCode(data.gameId)

        if (!lobby) {
            cb({ status: "error" })
            return
        }


    })

})


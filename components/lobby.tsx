"use client"
import { useSession } from "next-auth/react";
import { Button } from "./input";
import useSocket from "@/util/socket";
import { useEffect, useState } from "react";
import Toast from "./toast";

export default function Lobby({ gameId }: { gameId: string }) {
    const session = useSession();
    const socket = useSocket();
    const [loading, setLoading] = useState(true);
    const [owner, setOwner] = useState(false);

    const [successToastOpen, setSuccessToastOpen] = useState(false);
    const [successToastTitle, setSuccessToastTitle] = useState("");
    const [successToastMessage, setSuccessToastMessage] = useState("");

    const [errorToastOpen, setErrorToastOpen] = useState(false);
    const [errorToastTitle, setErrorToastTitle] = useState("");
    const [errorToastMessage, setErrorToastMessage] = useState("");

    const [players, setPlayers] = useState<Player[]>([]);

    const showLoadingError = (details?: string) => {
        setErrorToastOpen(true)
        setErrorToastTitle("Error")
        setErrorToastMessage("An error occurred while fetching game data \n Details: " + details)
    }

    useEffect(() => {
        socket?.timeout(2000).emit("ownerOf", { gameId: gameId, userId: session.data?.user.id }, (err: any, res: any) => {
            if (err) {
                showLoadingError("No response from server.")
                return
            }

            if (res.status === "error") {
                showLoadingError("Server returned an error.")
                return
            }

            setOwner(res.owner)
            // get players
            socket?.emit("getPlayers", { gameId: gameId }, (res: any) => {
                if (res.status === "error") {
                    showLoadingError("Server returned an error.")
                    return
                }

                setPlayers(res.players.map((player: any) => ({ name: player })))
                setLoading(false)
            })
        })

    }, [])

    useEffect(() => {

        if (loading) return

        if (owner) {
            setSuccessToastOpen(true)
            setSuccessToastTitle("You now the owner of the game")
        }

    }, [owner])


    return (
        <div className="flex w-full flex-col items-center mt-20">
            <div className="text-2xl font-bold">
                Game Code : {gameId}
            </div>
            <div className="mt-4">
                <Button variant="primary">Start Game</Button>
            </div>

            <DisplayPlayers players={players} />

            {errorToastOpen && <Toast variant="error" title={errorToastTitle} text={errorToastMessage} fade={4000} onClose={() => setErrorToastOpen(false)} />}
            {successToastOpen && <Toast variant="success" title={successToastTitle} text={successToastMessage} fade={2000} onClose={() => setSuccessToastOpen(false)} />}
        </div>
    )
}

interface Player {
    name: string;
}

function DisplayPlayers({ players }: { players: Player[] }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-xl font-bold mt-8">
                Players
            </div>
            <div className="mt-4 border">
                {players.map((player, index) => (
                    <div key={index} className="text-lg">
                        {player.name}
                    </div>
                ))}
            </div>

        </div>
    )
}
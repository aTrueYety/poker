"use client"
import useSocket from "@/util/socket"
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Chat from "@/components/chat";
import Toast from "@/components/toast";
import Lobby from "@/components/lobby";

export default function Game({ params }: { params: { gameId: string } }) {
    const router = useRouter();
    const socket = useSocket();
    const session = useSession();

    const [loading, setLoading] = useState(true);
    const [gameExists, setGameExists] = useState(false);
    const [gameInProgress, setGameInProgress] = useState(false);

    const userData = { user: { id: session.data?.user.id, username: session.data?.user.name }, gameId: params.gameId }

    useEffect(() => {

        //join game
        socket?.emit("joinGame", userData, (res: any) => {
            //if the game is not found
            if (res.status === "notFound") {
                setGameExists(false)
                setLoading(false)
                return
            }

            //if the game is found
            if (res.status === "ok") {
                setGameExists(true)
                setLoading(false)
                return
            }
        })

        //cleanup on page unload
        const cleanup = () => {
            //remove user from game

            socket?.emit("leaveGame", userData)
        }

        //listen for page unload
        window.addEventListener("beforeunload", cleanup)

        //remove unload listener
        return () => {
            window.removeEventListener("beforeunload", cleanup)
            cleanup()
        }


    }, [])

    // If user is not logged in, redirect to play page
    if (!session.data?.user) {
        router.push("/play")
        return null
    }

    // If the page is loading. Change this to a skeleton?
    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <h1>loading...</h1>
            </div>
        )
    }

    // If the game does not exist. Redirect to play page and show toast?
    if (!gameExists) {
        return (
            <div className="flex items-center justify-center">
                <h1>Game not found</h1>
                <Toast title="Game not found" text="The game you are trying to join does not exist. Redirecting you back to /play" variant="error" fade={3000} onClose={() => router.push("/play")} />
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center mt-2 max-h-full w-full h-full">
            <div className="flex flex-row-reverse max-h-full w-full h-full">
                <Chat gameId={params.gameId} />
                <Lobby gameId={params.gameId} />
            </div>
        </div>
    )
}

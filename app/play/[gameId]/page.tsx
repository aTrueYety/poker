"use client"
import useSocket from "@/util/socket"
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Game({ params }: { params: { gameId: string } }) {
    const router = useRouter();
    const socket = useSocket();
    const session = useSession();

    const [loading, setLoading] = useState(true);
    const [gameExists, setGameExists] = useState(false);

    const userData = { user: { id: session.data?.user.id, username: session.data?.user.name }, gameId: params.gameId }

    useEffect(() => {
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
        }
    }, [])

    if (!session.data?.user) {
        router.push("/play")
    }

    console.log(session.data)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <h1>loading...</h1>
            </div>
        )
    }

    if (!gameExists) {
        return (
            <div className="flex items-center justify-center">
                <h1>Game not found</h1>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-row items-center justify-center h-20 w-1/2">
                <h1>Game</h1>
            </div>
        </div>
    )
}

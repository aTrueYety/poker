"use client"

import { TextInput, Button } from "@/components/input"
import { useEffect, useState } from "react"
import useSocket from "@/util/socket"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Game() {

    const router = useRouter();
    const socket = useSocket();
    const session = useSession();

    useEffect(() => {
        socket?.emit("fetchGames")
    }, [socket])

    const [gameId, setGameId] = useState("");

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-row items-center justify-center h-20 w-1/2">
                <TextInput onChange={s => setGameId(s)} onSubmit={() => router.push("/play/" + gameId)} placeholder="Enter game id..." className=" w-10/12 text-center" textCentered={true} onEnterClear={true} />
                <Button variant={"primary"} className="ml-2 w-2/12" onClick={() => router.push("/play/" + gameId)}>Join</Button>
            </div>

            <div className="mt-8 mb-8">
                <h1 className="text-2xl">OR</h1>
            </div>

            <div className="flex flex-row items-center justify-center h-20 w-1/2">
                <Button variant={"primary"} className="w-full" onClick={() => {
                    if (!session?.data?.user) {
                        signIn();
                        return
                    }

                    socket?.emit("createGame", { user: session?.data?.user }, (res: any) => {
                        if (res.status === "ok" && res.code) {
                            router.push(`/play/${res.code}`)
                        }
                    })

                }}>Create New Game</Button>
            </div>

            <div className="mt-8 mb-8 flex flex-row">
                <div className="p-10">
                    <OngoingGames />
                </div>
            </div>
        </div>
    )
}

function OngoingGames() {
    const socket = useSocket();
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        socket?.on("ongoingGamesStream", (res) => {
            setLoading(false)
            setGames(res)
        })

        return () => {
            socket?.off("ongoingGamesStream")
        }
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col align-middle content-center justify-center">
                <div>
                    Loading...
                </div>
                <div className="flex justify-center mt-4" >
                    <LoadingSpinner />
                </div>
            </div>
        )
    }


    return (
        games.length == 0 ?
            <div> no ongoing games </div>
            :
            games.map((game: any, index: number) => {
                return (
                    <OngoingGameCard key={index} code={game.id} players={game.players} status={game.status} />
                )
            }
            )
    )
}

interface OngoingGameCardProps {
    code?: string,
    players?: string[],
    status?: string
}

function OngoingGameCard(props: OngoingGameCardProps) {
    return (
        <div className="flex flex-col w-56 border p-2 rounded-lg">
            <div>
                code : {props.code}
            </div>

            <div>
                players : {props.players}
            </div>

            <div>
                status : {props.status}
            </div>

        </div>
    )
}

function LoadingSpinner() {
    return (
        <svg
            aria-hidden='true'
            className='w-8 h-8 mr-2 text-neutral-600 animate-spin dark:text-gray-600 fill-neutral-100'
            viewBox='0 0 100 101'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                fill='currentColor'
            />
            <path
                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                fill='currentFill'
            />
        </svg>
    );
}

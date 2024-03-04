"use client"

import { TextInput, Button } from "@/components/input"
import { useState } from "react"
import useSocket from "@/util/socket"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Game() {

    const router = useRouter();
    const socket = useSocket();
    const session = useSession();

    const [gameId, setGameId] = useState("");

    socket?.emit("fetchGames")

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

    socket?.on("ongoingGamesStream", (res) => {
        console.log(res)
        setGames(res)
    })

    console.log(games)

    return (
        games.length == 0 ?
            <div> no ongoing games </div>
            :
            games.map((game: any) => {
                return (
                    <OngoingGameCard code={game.id} players={game.players} status={game.status} />
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

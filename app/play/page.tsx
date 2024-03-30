"use client"

import { TextInput, Button } from "@/components/input"
import { useEffect, useState } from "react"
import useSocket from "@/util/socket"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toast from "@/components/toast";
import { LobbyInfo, LobbyStatus } from "@/types/types";
import Badge, { BadgeColor } from "@/components/badge";

export default function Play() {

    const router = useRouter();
    const socket = useSocket();
    const session = useSession();
    const [noGameToast, setNoGameToast] = useState(false)

    useEffect(() => {
        socket?.emit("fetchGames")
    }, [socket])

    const [gameId, setGameId] = useState("");

    // Handles redirection to game page
    const redirectToGame = (gameId: string) => {
        socket?.timeout(2000).emit("gameExists", gameId, (err: any, res: any) => {

            if (err) {
                setNoGameToast(true)
                return
            }

            if (res.status === "ok") {
                router.push("/play/" + gameId)
                return
            }
            setNoGameToast(true)
        })
    }

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-row items-center justify-center h-20 w-1/2">
                <TextInput onEnterBlur={true} onChange={s => setGameId(s)} onSubmit={() => redirectToGame(gameId)} placeholder="Enter game id..." className=" w-10/12 text-center" textCentered={true} onEnterClear={true} />
                <Button variant={"primary"} className="ml-2 w-2/12" onClick={() => redirectToGame(gameId)}>Join</Button>
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
            {noGameToast && <Toast title="Game not found" text="The game you are trying to join does not exist" variant="error" fade={1500} onClose={() => setNoGameToast(false)} />}
        </div>
    )
}

function OngoingGames() {
    const socket = useSocket();
    const [games, setGames] = useState<LobbyInfo[]>([])
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

        // Change this to a skeleton
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
            games.map((game: LobbyInfo, index: number) => {
                return (
                    <OngoingGameCard key={index} info={game} />
                )
            }
            )
    )
}



function OngoingGameCard({ info }: { info: LobbyInfo }) {
    const session = useSession();
    const owned = session.data?.user.name === info.owner
    const socket = useSocket();
    const router = useRouter();

    // Handles redirection to game page
    const redirectToGame = (gameId: string) => {
        socket?.timeout(2000).emit("gameExists", gameId, (err: any, res: any) => {

            if (err) {
                return
            }

            if (res.status === "ok") {
                router.push("/play/" + gameId)
                return
            }
        })
    }

    return (
        <div className="w-96 relative border p-2 rounded-lg">
            <div className="text-lg font-semibold mb-4">
                {info.id}
            </div>
            {info.players.length > 0 && <div className="flex mt-6s flex-col">
                <div>
                    players : {info.players}
                </div>
            </div>}

            <div className="flex w-full justify-center">
                <Button variant="primary" className="mt-2 mb-2" onClick={() => redirectToGame(info.id)}>Join</Button>
            </div>

            <div className="absolute top-2 right-2 z-20">
                <div className="flex flex-row space-x-1">
                    {owned && <Badge color={BadgeColor.Blue} name={"Owner"} hoverInfo="You are the owner of this lobby" />}
                    {!info.rated && <Badge color={BadgeColor.Green} name={"Unrated"} hoverInfo="This lobby is unrated" />}
                    {info.status === LobbyStatus.IN_PROGRESS && <Badge color={BadgeColor.Red} name={"In Game"} hoverInfo="This lobby is currently in game" />}
                    {info.status === LobbyStatus.WAITING && <Badge color={BadgeColor.Green} name={"Waiting"} hoverInfo="This lobby is waiting for players" />}
                    {info.status === LobbyStatus.FINISHED && <Badge color={BadgeColor.Yellow} name={"Finishing"} hoverInfo="The game in this lobby is just finishing" />}
                </div>
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

"use client"
import { useSession } from "next-auth/react";
import { Button, Dropdown, DropdownItem } from "./input";
import useSocket from "@/util/socket";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { GameSettings, LobbyError, PlayerInfo } from "@/types/types";
import { useToast } from "@/util/toastProvider";

export default function Lobby({ gameId }: { gameId: string }) {
    const session = useSession();
    const socket = useSocket();
    const [loading, setLoading] = useState(true);
    const [owner, setOwner] = useState(false);

    const toast = useToast();

    const [players, setPlayers] = useState<PlayerInfo[]>([]);

    const showLoadingError = (details?: string) => {
        toast.enqueue({ title: "Error", text: "An error occurred while fetching game data \n Details: " + details, variant: "error", fade: 4000 })
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

            console.log(res)

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

        return () => {
            socket?.off("playersUpdate")
        }

    }, [])

    socket?.on("playersUpdate", (data: PlayerInfo[]) => {
        setPlayers(data)
    })

    useEffect(() => {

        if (loading) return

        if (owner) {
            toast.enqueue({ title: "Owner", text: "You are now the owner of this game", variant: "success", fade: 2000 })
        }

    }, [owner])

    const startGame = () => {
        // Set the game
        socket?.emit("setGame", { gameId: gameId, userId: session.data?.user.id, gameType: "POKER" }, (res: any) => {
            if (res.status === "error") {
                toast.enqueue({ title: "Error", text: "An error occurred while setting the game \n Error: " + LobbyError[res.errorMessage], variant: "error", fade: 4000 })
                return
            }
        })


        socket?.emit("startGame", { gameId: gameId, userId: session.data?.user.id }, (res: any) => {
            if (res.status === "error") {
                toast.enqueue({ title: "Error", text: "An error occurred while starting the game \n Error: " + LobbyError[res.errorMessage], variant: "error", fade: 4000 })
                return
            }

            toast.enqueue({ title: "Game started", text: "The game has been started", variant: "success", fade: 2000 })
        })
    }


    return (
        <div className="flex w-full flex-col items-center mt-20">
            <div className="text-2xl font-bold">
                Game Code : {gameId}
            </div>
            <div className="mt-4">
                <Button onClick={startGame} variant="primary">Start Game</Button>
            </div>

            <DisplayPlayers players={players} />

            <LobbySettings gameId={gameId} owner={owner} />
        </div>
    )
}

function LobbySettings({ gameId, owner }: { gameId: string, owner: boolean }) {
    const socket = useSocket();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<GameSettings>();
    const session = useSession();

    useEffect(() => {
        socket?.emit("getGameSettings", { gameId }, (res: any) => {
            if (res.status === "error") {
                return
            }

            setSettings(res.settings)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        if (loading) { return }

        socket?.emit("updateGameSettings", { gameId: gameId, userId: session.data?.user.id, settings: settings }, (res: any) => {
            if (res.status === "error") {
                console.log(res)
                console.log("error while updating game settings")
                // show error toast
                return
            }

            if (res.status === "ok") {
                // show success toast
            }
        })

    }, [settings])



    if (loading) {
        return (
            <>
                loading
            </>
        )
    }

    const setRated = (value: boolean) => {
        if (!settings) return
        setSettings({ ...settings, rated: value })
    }

    return (
        <div className="flex flex-col items-center">
            <div className="text-xl font-bold mt-8">
                Settings
            </div>
            <div className="mt-4 ">
                <div className="flex flex-row justify-between items-center">
                    <Label className="pr-2 w-full cursor-pointer" htmlFor="rated">Rated</Label>
                    <Switch disabled={!owner} onCheckedChange={(b) => { setRated(b) }} defaultChecked={settings?.rated} id={"rated"} />
                </div>

                <div className="flex space-x-6 flex-row justify-between items-center mt-2">
                    <div>
                        Time control
                    </div>
                    <Dropdown open={-1} >
                        <DropdownItem>No time control</DropdownItem>
                        <DropdownItem>Blitz</DropdownItem>
                        <DropdownItem>Custom</DropdownItem>
                    </Dropdown>
                </div>
            </div>
        </div>
    )

}

function DisplayPlayers({ players }: { players: PlayerInfo[] }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-xl font-bold mt-8">
                Players
            </div>
            <div className="mt-4 border">
                {players.map((player, index) => (
                    <div key={index} className="text-lg">
                        {player.username}
                    </div>
                ))}
            </div>

        </div>
    )
}
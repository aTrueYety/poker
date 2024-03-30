"use client"

import useSocket from "@/util/socket"
import { useSession } from "next-auth/react"
import PokerCardArea from "./pokerCardArea"
import { Card } from "@/backend/pokergame"
import { GameAction, GameStream, Suit } from "@/types/types"
import { useEffect, useState } from "react"
import { Button } from "./input"

export default function Game({ gameId, spectating }: { gameId: string, spectating: boolean }) {
    const session = useSession()
    const socket = useSocket()

    const [cards, setCards] = useState<Card[]>()

    socket?.on("gameStream", (data: GameStream) => {
        console.log(data)
    })

    useEffect(() => {
        socket?.emit("getGameState", { gameId: gameId, userId: session.data?.user.id }, (res: any) => {
            console.log(res)
            setCards(res.gameState.cards)
        })
    }, [])



    return (
        <div className="w-full h-full ml-20 flex justify-center">
            <div className="bottom-0 absolute mb-20">
                <UserArea username={session.data?.user.name} money={1000} cards={cards} onActionPerform={(action) => {
                    socket?.emit("performGameAction", { gameId: gameId, userId: session.data?.user.id, action: action }, (res: any) => {
                        console.log(res)
                    })
                }} />
            </div>
        </div>
    )
}



function UserArea({ username, money, cards, onActionPerform }: { username: string, money?: number, cards?: Card[], onActionPerform: (action: GameAction) => void }) {

    return (
        <div className="flex flex-col w-full content-center justify-center align-middle">
            <div className="flex w-full justify-center">
                <div className="w-44 p-2">
                    <div className="flex justify-between w-full">
                        <p>{username}</p>
                        <p>{money}</p>
                    </div>
                    <PokerCardArea card1={cards?.at(0)} card2={cards?.at(1)} />
                </div >
            </div>
            <div className="flex space-x-4 mt-2">
                <Button variant={"primary"} onClick={() => { onActionPerform({ action: "fold" }) }} > Fold </Button>
                <Button variant={"primary"} > Call </Button>
                <Button variant={"primary"} > Raise </Button>
                <Button variant={"primary"} > Check </Button>
                <Button variant={"primary"} > Bet </Button>
            </div>
        </div >
    )
}
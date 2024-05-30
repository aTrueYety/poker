"use client"

import useSocket from "@/util/socket"
import { useSession } from "next-auth/react"
import PokerCardArea from "./pokerCardArea"
import { Card } from "@/backend/pokergame"
import { GameAction, GameEvent, GameStream } from "@/types/types"
import { useEffect, useState } from "react"
import { Button } from "./input"
import { useToast } from "@/util/toastProvider"
import PokerCardAreaBoard from "./pokerCardAreaBoard"

export default function Game({ gameId, spectating }: { gameId: string, spectating: boolean }) {
    const session = useSession()
    const socket = useSocket()

    const [cards, setCards] = useState<Card[]>()
    const [boardCards, setBoardCards] = useState<Card[]>()
    const [turn, setTurn] = useState<number>()
    const [pot, setPot] = useState<number>()
    const [totalPot, setTotalPot] = useState<number>()

    const parseGameState = (gameState: any) => {
        setCards(gameState.cards)
        setBoardCards(gameState.board)
        setTurn(gameState.turn)
        setPot(gameState.pot)
        setTotalPot(gameState.totalPot)
    }

    const endOfRoundUpdate = (data: GameStream) => {
        setBoardCards(data.message.gameState.board)
    }

    const actionUpdate = (update: any) => {
        socket?.emit("getGameState", { gameId: gameId, userId: session.data?.user.id }, (res: any) => {
            parseGameState(res.gameState)
        })
    }

    const toast = useToast();

    useEffect(() => {
        socket?.emit("getGameState", { gameId: gameId, userId: session.data?.user.id }, (res: any) => {
            console.log(res)
            parseGameState(res.gameState)

            // TODO: Expand gamestate to include more information such as rejoing, forfeits, etc.

            if (res.gameState.spectating) {
                toast.enqueue({ title: "Spectating", text: "This game is in progress. You are now spectating", variant: "info", fade: 2000 })
            }
        })

        socket?.on("gameStream", (data: GameStream) => {
            console.log(data)

            if (data.event === GameEvent.END_OF_ROUND) {
                endOfRoundUpdate(data)
                return
            }

            if (data.event === GameEvent.ACTION) {
                actionUpdate(data.message)
                return
            }
        })
    }, [])



    return (
        <div className="w-full h-full ml-20 flex justify-center">
            <div className="mt-20">
                <PokerCardAreaBoard cards={boardCards} />
            </div>
            <div className="bottom-0 absolute mb-20">
                <UserArea username={session.data?.user.name} money={1000} cards={cards} onActionPerform={(action) => {
                    socket?.emit("performGameAction", { gameId: gameId, userId: session.data?.user.id, username: session.data?.user.name, action: action }, (res: any) => {
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
                <Button variant={"primary"} onClick={() => { onActionPerform({ action: "call" }) }}> Call </Button>
                <Button variant={"primary"} onClick={() => { onActionPerform({ action: "raise" }) }}> Raise </Button>
                <Button variant={"primary"} onClick={() => { onActionPerform({ action: "check" }) }} > Check </Button>
                <Button variant={"primary"} onClick={() => { onActionPerform({ action: "bet" }) }}> Bet </Button>
            </div>
        </div >
    )
}
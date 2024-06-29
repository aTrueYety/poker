"use client"

import useSocket from "@/util/socket"
import { useSession } from "next-auth/react"
import PokerCardArea from "./pokerCardArea"
import { Card } from "@/backend/games/pokergame"
import { GameAction, GameEvent, GameStream, PokerAction, PokerGameState, PokerPlayerInfo } from "@/types/types"
import { useEffect, useRef, useState } from "react"
import { Button, TextInput } from "./input"
import { useToast } from "@/util/toastProvider"
import PokerCardAreaBoard from "./pokerCardAreaBoard"

export default function PokerGame({ gameId, spectating }: { gameId: string, spectating: boolean }) {
    const session = useSession()
    const socket = useSocket()

    const [cards, setCards] = useState<Card[]>()
    const [boardCards, setBoardCards] = useState<Card[]>()
    const [turn, setTurn] = useState<number>()
    const [pot, setPot] = useState<number>()
    const [availableActions, setAvailableActions] = useState<PokerAction[]>()
    const [yourTurn, setYourTurn] = useState<boolean>()
    const [otherPlayers, setOtherPlayers] = useState<PokerPlayerInfo[]>()
    const [turnPot, setTurnPot] = useState<number>()
    const [yourPlayer, setYourPlayer] = useState<PokerPlayerInfo>()

    const gameRef = useRef<HTMLDivElement>(null)
    const [dim, setDim] = useState({ width: 0, height: 0 })

    const parseGameState = (gameState: PokerGameState) => {
        console.log("parsing")
        console.log(gameState)
        setCards(gameState.cards)
        setBoardCards(gameState.board)
        setTurn(gameState.turn)
        setPot(gameState.pot)
        setAvailableActions(gameState.availableActions)
        setYourTurn(gameState.yourTurn)
        setOtherPlayers(gameState.otherPlayers)
        setTurnPot(gameState.turnpot)
        setYourPlayer(gameState.yourPlayer)
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
            if (!res.gameState) return
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


    useEffect(() => {
        if (yourTurn) {
            toast.enqueue({ title: "Your turn", text: "It is now your turn to make a move", variant: "info", fade: 2000 })
        }
    }, [yourTurn])


    useEffect(() => {
        if (gameRef.current) {
            setDim({ width: gameRef.current.clientWidth, height: gameRef.current.clientHeight })
        }
    }, [gameRef.current])



    return (
        <div className="w-full h-full ml-20 flex justify-center" ref={gameRef}>
            <div className="m-auto pb-32">
                <PokerCardAreaBoard cards={boardCards} />
                {pot ? <div className="mt-2">Total pot: {pot}</div> : null}
                {turnPot ? <div className="mt-2">Current turn pot: {turnPot}</div> : null}
            </div>

            <DistributePlayers players={otherPlayers ? otherPlayers : []} dim={dim} />

            <div className="bottom-0 absolute mb-10">
                <UserArea
                    username={session.data?.user.name} money={yourPlayer?.bank} cards={cards}
                    onActionPerform={(action) => {
                        socket?.emit("performGameAction", { gameId: gameId, userId: session.data?.user.id, username: session.data?.user.name, action: action }, (res: any) => {
                            console.log(res)
                        })
                    }}
                    availableActions={availableActions}
                />
            </div>
        </div>
    )
}


function DistributePlayers({ players, dim, cards }: { players: PokerPlayerInfo[], dim: { width: number, height: number }, cards?: Card[] }) {

    let totalAngle = 180;
    let startingAngle = 180;
    let angleBetween = totalAngle / (players.length - 1)
    let radius = 250

    return (
        <div>
            {players.map((player, index) => {

                let centerpos = { x: dim.width / 1.65, y: dim.height / 2.5 }

                let angle = startingAngle + (angleBetween * index)

                // Special case for 1 player
                players.length === 1 ? angle = 270 : null

                let x = centerpos.x + radius * Math.cos(angle * Math.PI / 180)
                let y = centerpos.y + radius * Math.sin(angle * Math.PI / 180)

                // Account for the width of the card area
                x = x - 25

                return (
                    <div key={index + player.username} className="absolute" style={{ left: x, top: y }}>
                        <div className="flex flex-col items-center">
                            <div className="font-semibold">
                                {player.username}
                            </div>
                            <div className="flex space-x-4">
                                <div>
                                    Bank: {player.bank}
                                </div>
                                <div>
                                    Pot: {player.pot}
                                </div>
                            </div>
                            <div className="w-24">
                                <PokerCardArea size={"small"} card1={cards?.at(0)} card2={cards?.at(1)} />
                            </div>
                            <div>
                                Current bet: {player.turnpot}
                            </div>
                        </div>
                    </div>
                )
            })
            }
        </div >
    )

}



function UserArea({ username, money, cards, onActionPerform, availableActions }: { username: string, money?: number, cards?: Card[], onActionPerform: (action: GameAction) => void, availableActions?: PokerAction[] }) {
    let betRaiseAmountField = useRef<HTMLInputElement>(null)

    const onActionPerformWrapper = (a: GameAction) => {

        if (betRaiseAmountField.current && (a.action === PokerAction.BET || a.action === PokerAction.RAISE)) {
            a.amount = parseInt(betRaiseAmountField.current.value);
            betRaiseAmountField.current.value = "";
        }

        onActionPerform(a)
    }


    availableActions = availableActions ? availableActions : []

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
                {availableActions.map((action, index) => {
                    return (
                        <Button key={index} variant={"primary"} onClick={() => { onActionPerformWrapper({ action: action }) }} > {action} </Button>
                    )
                })}
            </div>
            <div className="flex w-full items-center justify-center mt-4">
                {availableActions.includes(PokerAction.BET) || availableActions.includes(PokerAction.RAISE) ?
                    <TextInput ref={betRaiseAmountField} placeholder="Amount" className="h-12"
                        acceptedValues={
                            [
                                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
                            ]
                        }

                    />
                    : null
                }
            </div>
        </div >
    )
}
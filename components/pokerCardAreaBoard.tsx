import { Card } from "@/types/types"
import Image from "next/image"

export default function PokerCardAreaBoard({ cards }: { cards?: Card[] }) {
    return (
        <div className="w-full space-x-4 h-32 flex justify-between">
            {cards?.map((card, i) => {
                return (
                    <Image key={i + card.suit + card.value} src={getImagePath(card)} width={65} height={80} alt="card" />
                )
            })}
        </div>
    )
}

function getImagePath(card?: Card) {
    let suit = card?.suit ? card.suit : "Clubs"
    suit = suit.toLowerCase().charAt(0).toUpperCase() + suit.slice(1)
    let value = card?.value ? card.value === 14 ? 1 : card.value : 14
    return `/images/poker/cards/${suit}/${value}.jpg`
}
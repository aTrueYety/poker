import { Card } from "@/types/types"
import Image from "next/image"

export default function PokerCardArea({ card1, card2, size }: { card1?: Card, card2?: Card, size?: "small" | "large" }) {

    if (size === "small") return (
        <div className="w-full space-x-4 h-24 flex justify-between">
            <Image src={getImagePath(card1)} width={46} height={20} alt="card" />
            <Image src={getImagePath(card2)} width={46} height={20} alt="card" />
        </div>
    )

    return (
        <div className="w-full space-x-4 h-32 flex justify-between">
            <Image src={getImagePath(card1)} width={65} height={80} alt="card" />
            <Image src={getImagePath(card2)} width={65} height={80} alt="card" />
        </div>
    )
}

function getImagePath(card?: Card) {
    let suit = card?.suit ? card.suit : "Clubs"
    suit = suit.toLowerCase().charAt(0).toUpperCase() + suit.slice(1)
    let value = card?.value ? card.value === 14 ? 1 : card.value : 14
    return `/images/poker/cards/${suit}/${value}.jpg`
}
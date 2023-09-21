'use client'
import Image from "next/image"
import UserTemplate from "src/components/userTemplate"
import PlayersTemplate from "src/components/playersTemplate"

export default function PokerGame() {

    function renderUsers(){
        return(
            <PlayersTemplate/>
        )
    }

    return (
        
        <div className="w-full relative">
            <div className="z-0 max-w-full h-full absolute">
                <Image src="/assets/board.jpeg" width={3840} height={2160} style={{width: "100%", height: "100%"}} alt = "board"/>
            </div>
            <div className="flex min-w-full h-full z-10 relativ">
                <UserTemplate />
            </div>
        </div>
    )
}       